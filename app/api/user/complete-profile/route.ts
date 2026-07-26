import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import { completeProfileSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireSession,
  generatePassId,
  generateQRToken,
  generateId,
} from '@/lib/api-helpers';

/**
 * POST /api/user/complete-profile
 * Called after Google OAuth to complete the profile (phone, dept, year)
 * and generate the clearance pass. This is a one-time operation.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const parsed = await parseBody(request, completeProfileSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;
    const userId = session.user.id;

    // ── Check if profile already completed ──
    const [existing] = await db
      .select({
        profileComplete: user.profileComplete,
        passId: user.passId,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existing?.profileComplete && existing?.passId) {
      return errorResponse('Profile already completed', 409);
    }

    // ── Transaction: update profile + create clearance pass ──
    const passId = generatePassId();
    const qrToken = generateQRToken();
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Update user profile
      const [updatedUser] = await tx
        .update(user)
        .set({
          phone: data.phone.trim(),
          collegeDept: data.collegeDept?.trim() || '',
          year: data.year?.trim() || '',
          organization: data.organization?.trim() || '',
          passId,
          profileComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning();

      // Create clearance pass
      const [pass] = await tx
        .insert(clearancePasses)
        .values({
          id: generateId(),
          uid: userId,
          passId,
          qrToken,
          issuedAt: now,
          revoked: false,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
        })
        .returning();

      return { user: updatedUser, pass };
    });

    return jsonResponse(
      {
        passId,
        qrToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          profileComplete: result.user.profileComplete,
        },
      },
      201
    );
  } catch (error) {
    console.error('[POST /api/user/complete-profile]', error);
    return errorResponse('Internal server error', 500);
  }
}
