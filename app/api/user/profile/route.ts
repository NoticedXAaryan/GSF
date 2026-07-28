import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses, applications, events } from '@/lib/schema';
import { jsonResponse, errorResponse, requireSession } from '@/lib/api-helpers';

/**
 * GET /api/user/profile
 * Returns the authenticated user's full profile, clearance pass, and applications.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const userId = session.user.id;

    // ── Fetch user profile ──
    const [profileUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        phone: user.phone,
        collegeDept: user.collegeDept,
        year: user.year,
        organization: user.organization,
        passId: user.passId,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!profileUser) {
      return errorResponse('User not found', 404);
    }

    // ── Fetch clearance pass (if profile is complete) ──
    let pass = null;
    if (profileUser.passId) {
      const [userPass] = await db
        .select({
          passId: clearancePasses.passId,
          qrToken: clearancePasses.qrToken,
          issuedAt: clearancePasses.issuedAt,
          revoked: clearancePasses.revoked,
        })
        .from(clearancePasses)
        .where(eq(clearancePasses.uid, userId))
        .limit(1);
      pass = userPass || null;
    }

    // ── Fetch application history with event names ──
    const userApps = await db
      .select({
        id: applications.id,
        subEventId: applications.subEventId,
        eventName: events.name,
        status: applications.status,
        appliedAt: applications.appliedAt,
        checkedIn: applications.checkedIn,
        checkedInAt: applications.checkedInAt,
        notes: applications.notes,
      })
      .from(applications)
      .leftJoin(events, eq(applications.subEventId, events.id))
      .where(eq(applications.uid, userId))
      .orderBy(desc(applications.appliedAt));

    return jsonResponse({
      user: profileUser,
      pass,
      applications: userApps,
    });
  } catch (error) {
    console.error('[GET /api/user/profile]', error);
    return errorResponse('Internal server error', 500);
  }
}
