import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import { getSession, jsonResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile and clearance pass details (if issued).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request.headers);
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
        role: user.role,
        phone: user.phone,
        collegeDept: user.collegeDept,
        year: user.year,
        organization: user.organization,
        profileComplete: user.profileComplete,
        passId: user.passId,
        enrollmentNumber: user.enrollmentNumber,
        universityId: user.universityId,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!profileUser) {
      return errorResponse('User not found', 404);
    }

    // ── Fetch clearance pass details if user has a pass ──
    let pass = null;
    if (profileUser.passId) {
      const [userPass] = await db
        .select({
          passId: clearancePasses.passId,
          qrToken: clearancePasses.qrToken,
          issuedAt: clearancePasses.issuedAt,
        })
        .from(clearancePasses)
        .where(eq(clearancePasses.uid, userId))
        .limit(1);
      pass = userPass || null;
    }

    return jsonResponse({
      user: profileUser,
      pass,
    });
  } catch (error) {
    console.error('[GET /api/user/profile]', error);
    return errorResponse('Internal server error', 500);
  }
}
