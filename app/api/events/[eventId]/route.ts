import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { updateEventSchema } from '@/lib/validators';
import { jsonResponse, errorResponse, parseBody, requireAdmin } from '@/lib/api-helpers';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

// This route is DB-backed and must never be prerendered at build time —
// doing so runs a query during `next build` and fails on a cold database.
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    return jsonResponse({ event });
  } catch (error) {
    console.error('[GET /api/events/:id]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const { eventId } = await context.params;

    // Verify event exists and get current status
    const [existing] = await db
      .select({ id: events.id, status: events.status })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!existing) {
      return errorResponse('Event not found', 404);
    }

    const parsed = await parseBody(request, updateEventSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;

    // Enforce status lifecycle transitions
    if (data.status && data.status !== existing.status) {
      const currentStatus = existing.status;
      const newStatus = data.status;

      // Allowed transitions: draft→published, draft→archived, published→archived
      const allowedTransitions: Record<string, string[]> = {
        draft: ['published', 'archived'],
        published: ['archived'],
        archived: [],
      };

      const allowed = allowedTransitions[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        return errorResponse(
          `Invalid status transition: cannot change from "${currentStatus}" to "${newStatus}"`,
          400
        );
      }
    }

    const [updated] = await db
      .update(events)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(events.id, eventId))
      .returning();

    return jsonResponse({ event: updated });
  } catch (error) {
    console.error('[PUT /api/events/:id]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const { eventId } = await context.params;

    const [existing] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!existing) {
      return errorResponse('Event not found', 404);
    }

    // Soft delete — archive the event
    await db
      .update(events)
      .set({ status: 'archived', updatedAt: Date.now() })
      .where(eq(events.id, eventId));

    return jsonResponse({ message: 'Event archived successfully' });
  } catch (error) {
    console.error('[DELETE /api/events/:id]', error);
    return errorResponse('Internal server error', 500);
  }
}
