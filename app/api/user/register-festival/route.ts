import { NextRequest } from 'next/server';
import { sendRegistrationConfirmation } from '@/lib/email';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import {
  jsonResponse,
  errorResponse,
  requireSession,
  generatePassId,
  generateQRToken,
  generateId,
} from '@/lib/api-helpers';

/**
 * POST /api/user/register-festival
 * Explicit registration for the Goa Startup Festival.
 * Generates the digital pass and sends the confirmation email.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const userId = session.user.id;

    // Check if the user has completed their profile
    const [existingUser] = await db
      .select({
        profileComplete: user.profileComplete,
        passId: user.passId,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!existingUser?.profileComplete) {
      return errorResponse('Please complete your profile first', 400);
    }

    if (existingUser?.passId) {
      return errorResponse('You are already registered for the festival', 409);
    }

    // Transaction: Assign passId to user and create clearance pass
    const passId = generatePassId();
    const qrToken = generateQRToken();
    const now = Date.now();

    await db.transaction(async (tx) => {
      // Update user with the passId
      await tx
        .update(user)
        .set({
          passId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      // Create clearance pass
      await tx
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
        });
    });

    // Fire-and-forget: send registration confirmation email
    sendRegistrationConfirmation(
      session.user.email,
      session.user.name,
      passId
    ).catch((err) => console.error('[register-festival] Email send failed:', err));

    return jsonResponse(
      {
        message: 'Successfully registered for the festival',
        passId,
        qrToken,
      },
      201
    );
  } catch (error) {
    console.error('[POST /api/user/register-festival]', error);
    return errorResponse('Internal server error', 500);
  }
}
