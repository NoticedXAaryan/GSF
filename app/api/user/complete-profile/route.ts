import { NextRequest } from 'next/server';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { completeProfileSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  getSession,
} from '@/lib/api-helpers';

/**
 * POST /api/user/complete-profile
 * Called after authentication to complete the user profile (phone, collegeDept).
 * Sets profileComplete = true. Also used for re-completion when admin flags the account.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Require authenticated session ──
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const userId = session.user.id;

    // ── Check if user is banned ──
    const [currentUser] = await db
      .select({ accountStatus: user.accountStatus })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (currentUser?.accountStatus === 'banned') {
      return errorResponse('Your account has been suspended. Contact an administrator.', 403);
    }

    // ── Validate input ──
    const parsed = await parseBody(request, completeProfileSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;

    // ── Check enrollment number uniqueness ──
    const enrollmentTrimmed = data.enrollmentNumber.trim().toUpperCase();
    if (enrollmentTrimmed) {
      const [dupeEnrollment] = await db
        .select({ id: user.id })
        .from(user)
        .where(
          and(
            eq(user.enrollmentNumber, enrollmentTrimmed),
            ne(user.id, userId)
          )
        )
        .limit(1);

      if (dupeEnrollment) {
        return errorResponse('This enrollment number is already registered to another account', 409, ['enrollmentNumber: Already in use']);
      }
    }

    // ── Check university ID uniqueness ──
    const universityIdTrimmed = data.universityId.trim();
    if (universityIdTrimmed) {
      const [dupeUnivId] = await db
        .select({ id: user.id })
        .from(user)
        .where(
          and(
            eq(user.universityId, universityIdTrimmed),
            ne(user.id, userId)
          )
        )
        .limit(1);

      if (dupeUnivId) {
        return errorResponse('This university ID is already registered to another account', 409, ['universityId: Already in use']);
      }
    }

    // ── Update user record ──
    const [updatedUser] = await db
      .update(user)
      .set({
        phone: data.phone.trim(),
        organization: data.college.trim(),
        collegeDept: data.course.trim(),
        year: data.semester.trim(),
        enrollmentNumber: enrollmentTrimmed,
        universityId: universityIdTrimmed,
        profileComplete: true,
        // If user was flagged, completing profile moves them back to active
        accountStatus: currentUser?.accountStatus === 'flagged' ? 'active' : undefined,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return jsonResponse({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        organization: updatedUser.organization,
        collegeDept: updatedUser.collegeDept,
        year: updatedUser.year,
        enrollmentNumber: updatedUser.enrollmentNumber,
        universityId: updatedUser.universityId,
        profileComplete: updatedUser.profileComplete,
      },
    });
  } catch (error) {
    console.error('[POST /api/user/complete-profile]', error);
    return errorResponse('Internal server error', 500);
  }
}
