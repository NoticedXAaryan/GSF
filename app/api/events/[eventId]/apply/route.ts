import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, events, applications, clearancePasses } from '@/lib/schema';
import { jsonResponse, errorResponse, getSession, generateId } from '@/lib/api-helpers';
import { sendApplicationConfirmation } from '@/lib/email';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

/**
 * POST /api/events/[eventId]/apply
 * Submit an application for a sub-event.
 * Requires authenticated user with complete profile and an active (non-revoked) pass.
 *
 * Requirements validated: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8, 4.9
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // ── Require authenticated session ──
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const { eventId } = await context.params;
    const uid = session.user.id;

    // ── Verify profile is complete ──
    const [userData] = await db
      .select({ profileComplete: user.profileComplete })
      .from(user)
      .where(eq(user.id, uid))
      .limit(1);

    if (!userData?.profileComplete) {
      return errorResponse('Complete registration first', 400);
    }

    // ── Verify user has an active (non-revoked) pass ──
    const [activePass] = await db
      .select({ id: clearancePasses.id })
      .from(clearancePasses)
      .where(
        and(
          eq(clearancePasses.uid, uid),
          eq(clearancePasses.revoked, false)
        )
      )
      .limit(1);

    if (!activePass) {
      return errorResponse('Complete registration first', 400);
    }

    // ── Fetch event and verify it exists ──
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // ── Verify event is published ──
    if (event.status !== 'published') {
      return errorResponse('Event is not accepting applications', 400);
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
      return errorResponse('Duplicate application', 409);
    }

    // ── Check capacity ──
    if (
      event.capacity !== null &&
      (event.currentRegistrations ?? 0) >= event.capacity
    ) {
      return errorResponse('Event is full', 400);
    }

    // ── Determine initial status based on event type ──
    const isShortlisted = event.type === 'shortlisted';
    const applicationStatus = isShortlisted ? 'pending' : 'accepted';

    // ── Insert application (and increment registrations for "registration" type) ──
    const applicationId = generateId();
    const appliedAt = Date.now();

    let createdApplication;

    if (!isShortlisted) {
      // Type is "registration": status = "accepted", increment currentRegistrations
      const result = await db.transaction(async (tx) => {
        const [application] = await tx
          .insert(applications)
          .values({
            id: applicationId,
            uid,
            subEventId: eventId,
            userName: session.user.name,
            userEmail: session.user.email,
            status: 'accepted',
            appliedAt,
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
      createdApplication = result;
    } else {
      // Type is "shortlisted": status = "pending", no increment
      const [application] = await db
        .insert(applications)
        .values({
          id: applicationId,
          uid,
          subEventId: eventId,
          userName: session.user.name,
          userEmail: session.user.email,
          status: 'pending',
          appliedAt,
        })
        .returning();
      createdApplication = application;
    }

    // ── Fire-and-forget: send application confirmation email ──
    sendApplicationConfirmation(
      session.user.email,
      session.user.name,
      event.name,
      isShortlisted
    ).catch((err) => console.error('[apply] Email send failed:', err));

    return jsonResponse(createdApplication, 201);
  } catch (error) {
    console.error('[POST /api/events/:id/apply]', error);
    return errorResponse('Internal server error', 500);
  }
}
