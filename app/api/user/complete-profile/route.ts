import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
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
 * Sets profileComplete = true. This is a one-time operation.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Require authenticated session ──
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    // ── Validate input ──
    const parsed = await parseBody(request, completeProfileSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;
    const userId = session.user.id;

    // ── Check if profile already completed ──
    const [existing] = await db
      .select({ profileComplete: user.profileComplete })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existing?.profileComplete) {
      return errorResponse('Profile has already been completed', 409);
    }

    // ── Update user record ──
    const [updatedUser] = await db
      .update(user)
      .set({
        phone: data.phone.trim(),
        organization: data.college.trim(),
        collegeDept: data.course.trim(),
        year: data.semester.trim(),
        profileComplete: true,
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
        profileComplete: updatedUser.profileComplete,
      },
    });
  } catch (error) {
    console.error('[POST /api/user/complete-profile]', error);
    return errorResponse('Internal server error', 500);
  }
}
