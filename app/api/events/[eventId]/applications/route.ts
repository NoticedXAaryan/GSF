import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications, events } from '@/lib/schema';
import { sendApplicationStatusUpdate } from '@/lib/email';
import { updateApplicationSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireSession,
  requireAdmin,
} from '@/lib/api-helpers';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const role = session.user.role;
    if (!['Volunteer', 'Admin', 'Lead'].includes(role)) {
      return errorResponse('Unauthorized', 403);
    }

    const { eventId } = await context.params;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let result;
    if (statusFilter) {
      result = await db
        .select()
        .from(applications)
        .where(eq(applications.subEventId, eventId))
        .orderBy(desc(applications.appliedAt));

      // Filter in application code since status is an enum
      result = result.filter((a) => a.status === statusFilter);
    } else {
      result = await db
        .select()
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

export async function PATCH(request: NextRequest, _context: RouteContext) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, updateApplicationSchema);
    if (parsed.error) return parsed.error;

    const { applicationId, status, notes } = parsed.data;

    // Verify exists and get user details for the notification email
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

    // ── Fire-and-forget: send status update email ──
    // Fetch event name for a meaningful notification
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
      .catch((err) => console.error('[applications PATCH] Email send failed:', err));

    return jsonResponse({ application: updated });
  } catch (error) {
    console.error('[PATCH /api/events/:id/applications]', error);
    return errorResponse('Internal server error', 500);
  }
}
