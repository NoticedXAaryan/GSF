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

    // ── Parse request body for application notes ──
    const body = await request.json().catch(() => ({}));
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

    if (!notes) {
      return errorResponse('Please provide a reason for applying', 400);
    }

    // ── Check for existing application ──
    const [existing] = await db
      .select({ 
        id: applications.id, 
        status: applications.status, 
        rejectionCount: applications.rejectionCount 
      })
      .from(applications)
      .where(
        and(
          eq(applications.uid, uid),
          eq(applications.subEventId, eventId)
        )
      )
      .limit(1);

    if (existing) {
      if (existing.status === 'rejected') {
        const rejectionCount = existing.rejectionCount ?? 0;
        if (rejectionCount >= 2) {
          return errorResponse('You have reached the maximum number of application attempts for this event.', 400);
        }
        
        // Allowed to re-apply, update existing application
        const isShortlisted =
          event.type === 'shortlisted' || event.requiresShortlisting === true;
        const newStatus = isShortlisted ? 'pending' : 'accepted';
        
        const [updatedApplication] = await db
          .update(applications)
          .set({
            status: newStatus,
            notes,
            appliedAt: Date.now(),
            decidedBy: null,
            decidedAt: null
          })
          .where(eq(applications.id, existing.id))
          .returning();
          
        return jsonResponse(updatedApplication, 200);
      } else {
        return errorResponse('You have already applied for this event.', 409);
      }
    }

    // ── Check capacity ──
    if (
      event.capacity !== null &&
      (event.currentRegistrations ?? 0) >= event.capacity
    ) {
      return errorResponse('Event is full', 400);
    }

    // ── Determine initial status ──
    // An event needs manual review when it is a "shortlisted" type OR when the
    // organiser explicitly flagged it as requiring approval (e.g. limited seats).
    // Anything else is auto-accepted on apply.
    const isShortlisted =
      event.type === 'shortlisted' || event.requiresShortlisting === true;
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
            notes,
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
          notes,
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
