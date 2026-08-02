import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import { updateProfileSchema } from '@/lib/validators';
import { getSession, jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';

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

/**
 * PATCH /api/user/profile
 * Update profile fields (phone, college, course, semester, enrollment, universityId).
 * Allows editing after initial profile completion.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const parsed = await parseBody(request, updateProfileSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;
    const userId = session.user.id;

    // Build the update set from provided fields only
    const updateSet: Record<string, unknown> = { updatedAt: new Date() };
    if (data.phone !== undefined) updateSet.phone = data.phone.trim();
    if (data.college !== undefined) updateSet.organization = data.college.trim();
    if (data.course !== undefined) updateSet.collegeDept = data.course.trim();
    if (data.semester !== undefined) updateSet.year = data.semester.trim();
    if (data.enrollmentNumber !== undefined) updateSet.enrollmentNumber = data.enrollmentNumber.trim().toUpperCase();
    if (data.universityId !== undefined) updateSet.universityId = data.universityId.trim();

    if (Object.keys(updateSet).length <= 1) {
      return errorResponse('No fields to update', 400);
    }

    const [updated] = await db
      .update(user)
      .set(updateSet)
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        collegeDept: user.collegeDept,
        year: user.year,
        enrollmentNumber: user.enrollmentNumber,
        universityId: user.universityId,
        profileComplete: user.profileComplete,
        role: user.role,
        passId: user.passId,
      });

    return jsonResponse({ user: updated });
  } catch (error) {
    console.error('[PATCH /api/user/profile]', error);
    return errorResponse('Internal server error', 500);
  }
}

