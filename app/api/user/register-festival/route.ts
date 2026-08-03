import { NextRequest } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import { sendRegistrationConfirmation } from '@/lib/email';
import {
  jsonResponse,
  errorResponse,
  getSession,
  generatePassId,
  generateQRToken,
  generateId,
} from '@/lib/api-helpers';

/**
 * POST /api/user/register-festival
 * Explicit registration for the Goa Startup Festival.
 * Generates the digital pass and sends the confirmation email.
 *
 * Requirements validated: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7
 */
export async function POST(request: NextRequest) {
  try {
    // ── Require authenticated session ──
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const userId = session.user.id;

    // ── Check if the user has completed their profile and is not banned ──
    const [existingUser] = await db
      .select({
        profileComplete: user.profileComplete,
        accountStatus: user.accountStatus,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser?.accountStatus === 'banned') {
      return errorResponse('Your account has been suspended. Contact an administrator.', 403);
    }

    if (!existingUser?.profileComplete) {
      return errorResponse('Profile must be completed first', 400);
    }

    // ── Check if user already has a pass ──
    const [existingPass] = await db
      .select({ id: clearancePasses.id })
      .from(clearancePasses)
      .where(eq(clearancePasses.uid, userId))
      .limit(1);

    if (existingPass) {
      return errorResponse('Already registered', 409);
    }

    // ── Check festival capacity (max 600) ──
    const [{ total }] = await db
      .select({ total: count() })
      .from(clearancePasses);

    if (total >= 600) {
      return errorResponse('Registration closed — capacity reached', 403);
    }

    // ── Wrap pass creation in a transaction ──
    const passId = generatePassId();
    const qrToken = generateQRToken();
    const issuedAt = Date.now();

    try {
      await db.transaction(async (tx) => {
        // Insert clearance pass
        await tx.insert(clearancePasses).values({
          id: generateId(),
          uid: userId,
          passId,
          qrToken,
          issuedAt,
          revoked: false,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
        });

        // Update user record with passId
        await tx
          .update(user)
          .set({
            passId,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId));
      });
    } catch (txError) {
      console.error('[register-festival] Transaction failed:', txError);
      return errorResponse('Registration could not be completed', 500);
    }

    // ── Send registration confirmation email (fire-and-forget) ──
    sendRegistrationConfirmation(
      session.user.email,
      session.user.name,
      passId
    ).catch((err) =>
      console.error('[register-festival] Email send failed:', err)
    );

    // ── Return pass details ──
    return jsonResponse(
      {
        passId,
        qrToken,
        issuedAt,
      },
      201
    );
  } catch (error) {
    console.error('[POST /api/user/register-festival]', error);
    return errorResponse('Registration could not be completed', 500);
  }
}
