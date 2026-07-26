import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, applications } from '@/lib/schema';
import { jsonResponse, errorResponse, requireSession, generateId } from '@/lib/api-helpers';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const { eventId } = await context.params;
    const uid = session.user.id;

    // ── Verify event exists and is published ──
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (event.status !== 'published') {
      return errorResponse('This event is not accepting applications', 400);
    }

    // ── Check capacity ──
    if (
      event.capacity !== null &&
      (event.currentRegistrations ?? 0) >= event.capacity
    ) {
      return errorResponse('This event is at full capacity', 400);
    }

    // ── Check for duplicate application ──
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.uid, uid),
          eq(applications.subEventId, eventId)
        )
      )
      .limit(1);

    if (existing) {
      return errorResponse('You have already applied for this event', 409);
    }

    // ── Transaction: create application + increment count ──
    const result = await db.transaction(async (tx) => {
      const [application] = await tx
        .insert(applications)
        .values({
          id: generateId(),
          uid,
          subEventId: eventId,
          userName: session.user.name,
          userEmail: session.user.email,
          status: event.requiresShortlisting ? 'pending' : 'accepted',
          checkedIn: false,
          appliedAt: Date.now(),
        })
        .returning();

      await tx
        .update(events)
        .set({
          currentRegistrations: sql`${events.currentRegistrations} + 1`,
          updatedAt: Date.now(),
        })
        .where(eq(events.id, eventId));

      return application;
    });

    return jsonResponse({ application: result }, 201);
  } catch (error) {
    console.error('[POST /api/events/:id/apply]', error);
    return errorResponse('Internal server error', 500);
  }
}
