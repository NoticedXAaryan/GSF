import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, events, applications, clearancePasses, ideaPitchData, reelPitchData, masterclassData, registrationDrafts } from '@/lib/schema';
import { canRegister, getEventSlug } from '@/lib/validateRegistration';
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

    // ── Verify profile is complete and account is active ──
    const [userData] = await db
      .select({
        profileComplete: user.profileComplete,
        accountStatus: user.accountStatus,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, uid))
      .limit(1);

    if (userData?.accountStatus === 'banned') {
      return errorResponse('Your account has been suspended. Contact an administrator.', 403);
    }

    if (userData?.accountStatus === 'flagged') {
      return errorResponse('Your account has been flagged. Please update your profile before applying.', 403);
    }

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

    const eventSlug = getEventSlug(event.name);
    if (!canRegister(eventSlug, userData?.role || 'Attendee')) {
      return errorResponse('Registration closed or unauthorized for this event.', 403);
    }

    if (eventSlug === 'idea-pitch') {
      if (!body.teamName || !body.ideaTitle || !body.ideaSummary || !body.problemSolution || !body.teamMembers) {
        return errorResponse('Missing required fields for Idea Pitch.', 400);
      }
    } else if (eventSlug === 'reel-pitch') {
      if (!body.instagramUrl || !body.teamMembers || body.acknowledgedRules === undefined) {
        return errorResponse('Missing required fields for Reel Pitch.', 400);
      }
      if (body.teamMembers.length > 3) {
        return errorResponse('Max 3 members allowed for Reel Pitch.', 400);
      }
      if (!body.instagramUrl.includes('instagram.com')) {
        return errorResponse('Invalid Instagram URL.', 400);
      }
    } else if (eventSlug === 'masterclass') {
      if (!body.sessions || !body.sessions.length) {
        return errorResponse('Please select at least one session.', 400);
      }
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

    const createdApplication = await db.transaction(async (tx) => {
      const statusToSet = isShortlisted ? 'pending' : 'accepted';
      
      const [application] = await tx
        .insert(applications)
        .values({
          id: applicationId,
          uid,
          subEventId: eventId,
          userName: session.user.name,
          userEmail: session.user.email,
          status: statusToSet,
          notes,
          appliedAt,
        })
        .returning();

      if (!isShortlisted) {
        // Safe concurrency update
        if (event.capacity !== null) {
          const updatedEvent = await tx
            .update(events)
            .set({
              currentRegistrations: sql`${events.currentRegistrations} + 1`,
              updatedAt: Date.now(),
            })
            .where(
              and(
                eq(events.id, eventId),
                sql`${events.currentRegistrations} < ${event.capacity}`
              )
            )
            .returning();
          
          if (updatedEvent.length === 0) {
            throw new Error('CAPACITY_FULL');
          }
        } else {
          await tx
            .update(events)
            .set({
              currentRegistrations: sql`${events.currentRegistrations} + 1`,
              updatedAt: Date.now(),
            })
            .where(eq(events.id, eventId));
        }
      }

      if (eventSlug === 'idea-pitch') {
        await tx.insert(ideaPitchData).values({
          id: generateId(),
          applicationId: application.id,
          teamName: body.teamName,
          ideaTitle: body.ideaTitle,
          ideaSummary: body.ideaSummary,
          problemSolution: body.problemSolution,
          teamMembers: body.teamMembers,
          pitchDeckUrl: body.pitchDeckUrl || null,
        });
      } else if (eventSlug === 'reel-pitch') {
        await tx.insert(reelPitchData).values({
          id: generateId(),
          applicationId: application.id,
          instagramUrl: body.instagramUrl,
          teamMembers: body.teamMembers,
          acknowledgedRules: body.acknowledgedRules,
        });
      } else if (eventSlug === 'masterclass') {
        await tx.insert(masterclassData).values({
          id: generateId(),
          applicationId: application.id,
          sessions: body.sessions,
        });
      }

      return application;
    });

    // Delete draft after successful application
    await db.delete(registrationDrafts).where(
      and(
        eq(registrationDrafts.uid, uid),
        eq(registrationDrafts.eventId, eventSlug)
      )
    );

    // ── Fire-and-forget: send application confirmation email ──
    sendApplicationConfirmation(
      session.user.email,
      session.user.name,
      event.name,
      isShortlisted
    ).catch((err) => console.error('[apply] Email send failed:', err));

    return jsonResponse(createdApplication, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'CAPACITY_FULL') {
      return errorResponse('Event is full', 400);
    }
    console.error('[POST /api/events/:id/apply]', error);
    return errorResponse('Internal server error', 500);
  }
}
