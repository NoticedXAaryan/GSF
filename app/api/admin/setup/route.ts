import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import crypto from 'crypto';
import { z } from 'zod';

const adminSetupSchema = z.object({
  email: z.string().email('Valid email is required'),
  token: z.string().min(1, 'Setup token is required'),
});

/**
 * POST /api/admin/setup
 * One-time endpoint for promoting a registered user to Admin.
 * Protected by ADMIN_SETUP_TOKEN env var — not by session auth
 * (since the whole point is to create the first admin before one exists).
 *
 * When ADMIN_SETUP_TOKEN is not set, this endpoint returns 404
 * (stealth — looks like it doesn't exist).
 *
 * Usage:
 *   1. Set ADMIN_SETUP_TOKEN in your .env on the VPS
 *   2. Register through the normal UI with your Google account
 *   3. Call POST /api/admin/setup { email: "your@email.com", token: "<your-token>" }
 *   4. Remove ADMIN_SETUP_TOKEN from .env to disable the endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const setupToken = process.env.ADMIN_SETUP_TOKEN;

    // If token is not configured, pretend the endpoint doesn't exist
    if (!setupToken) {
      return errorResponse('Not found', 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    const parsed = adminSetupSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      return errorResponse('Validation failed', 422, messages);
    }

    const { email, token } = parsed.data;

    // ── Constant-time comparison to prevent timing attacks ──
    const expectedBuffer = Buffer.from(setupToken, 'utf-8');
    const providedBuffer = Buffer.from(token, 'utf-8');

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return errorResponse('Invalid setup token', 403);
    }

    // ── Find and promote the user ──
    const [existingUser] = await db
      .select({ id: user.id, name: user.name, email: user.email, role: user.role })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!existingUser) {
      return errorResponse(
        'User not found. Please register through the UI first.',
        404
      );
    }

    if (existingUser.role === 'Admin' || existingUser.role === 'Lead') {
      return jsonResponse({
        message: `${email} is already an ${existingUser.role}`,
        user: existingUser,
      });
    }

    const [updatedUser] = await db
      .update(user)
      .set({ role: 'Admin', emailVerified: true })
      .where(eq(user.email, email))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

    return jsonResponse({
      message: `${email} has been promoted to Admin`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('[POST /api/admin/setup]', error);
    return errorResponse('Internal server error', 500);
  }
}
