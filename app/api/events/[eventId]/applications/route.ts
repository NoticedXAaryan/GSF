import { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications, events } from '@/lib/schema';
import { sendApplicationStatusUpdate } from '@/lib/email';
import { updateApplicationSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireLead,
} from '@/lib/api-helpers';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

/**
 * GET /api/events/[eventId]/applications
 * Admin/Lead only — list all applications for the given event with user details.
 * Supports optional ?status= query parameter filter.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Lead access required.', 403);
    }

    const { eventId } = await context.params;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let result;
    if (statusFilter) {
      result = await db
        .select({
          id: applications.id,
          uid: applications.uid,
          userName: applications.userName,
          userEmail: applications.userEmail,
          status: applications.status,
          appliedAt: applications.appliedAt,
          notes: applications.notes,
          decidedBy: applications.decidedBy,
          decidedAt: applications.decidedAt,
        })
        .from(applications)
        .where(
          and(
            eq(applications.subEventId, eventId),
            eq(applications.status, statusFilter as any)
          )
        )
        .orderBy(desc(applications.appliedAt));
    } else {
      result = await db
        .select({
          id: applications.id,
          uid: applications.uid,
          userName: applications.userName,
          userEmail: applications.userEmail,
          status: applications.status,
          appliedAt: applications.appliedAt,
          notes: applications.notes,
          decidedBy: applications.decidedBy,
          decidedAt: applications.decidedAt,
        })
        .from(applications)
        .where(eq(applications.subEventId, eventId))
        .orderBy(desc(applications.appliedAt));
    }

    return jsonResponse({ applications: result, total: result.length });
  } catch (error) {
    console.error('[GET /api/events/:id/applications]', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/events/[eventId]/applications
 * Admin/Lead only — update an application's status.
 * Validates with updateApplicationSchema (requires: applicationId, status).
 * Updates decidedBy and decidedAt, then sends a fire-and-forget status email.
 */
export async function PUT(request: NextRequest, _context: RouteContext) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Lead access required.', 403);
    }

    const parsed = await parseBody(request, updateApplicationSchema);
    if (parsed.error) return parsed.error;

    const { applicationId, status, notes } = parsed.data;

    // Verify the application exists and get user details for the notification email
    const [existing] = await db
      .select({
        id: applications.id,
        userEmail: applications.userEmail,
        userName: applications.userName,
        subEventId: applications.subEventId,
      })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!existing) {
      return errorResponse('Application not found', 404);
    }

    const [updated] = await db
      .update(applications)
      .set({
        status,
        notes,
        decidedBy: session.user.id,
        decidedAt: Date.now(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    // ── Fire-and-forget: send application status update email ──
    db.select({ name: events.name })
      .from(events)
      .where(eq(events.id, existing.subEventId))
      .limit(1)
      .then(([event]) => {
        const eventName = event?.name ?? 'an event';
        return sendApplicationStatusUpdate(
          existing.userEmail,
          existing.userName,
          eventName,
          status,
          notes
        );
      })
      .catch((err) =>
        console.error('[applications PUT] Email send failed:', err)
      );

    return jsonResponse({ application: updated });
  } catch (error) {
    console.error('[PUT /api/events/:id/applications]', error);
    return errorResponse('Internal server error', 500);
  }
}
