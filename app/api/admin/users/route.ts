import { NextRequest } from 'next/server';
import { eq, desc, ilike, or, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import { updateRoleSchema } from '@/lib/validators';
import { jsonResponse, errorResponse, parseBody, requireAdmin } from '@/lib/api-helpers';
import { z } from 'zod';
import { ACCOUNT_STATUSES } from '@/lib/constants/colleges';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const search = searchParams.get('search')?.trim() || '';

    const selectFields = {
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
      enrollmentNumber: user.enrollmentNumber,
      universityId: user.universityId,
      accountStatus: user.accountStatus,
      adminNotes: user.adminNotes,
    };

    let users;
    let total: number;

    if (search) {
      const searchPattern = `%${search}%`;
      const whereClause = or(
        ilike(user.name, searchPattern),
        ilike(user.email, searchPattern)
      );

      const [countResult] = await db
        .select({ count: count() })
        .from(user)
        .where(whereClause);

      total = countResult.count;

      users = await db
        .select(selectFields)
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      const [countResult] = await db
        .select({ count: count() })
        .from(user);

      total = countResult.count;

      users = await db
        .select(selectFields)
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return jsonResponse({ users, total });
  } catch (error) {
    console.error('[GET /api/admin/users]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, updateRoleSchema);
    if (parsed.error) return parsed.error;

    const { userId, role } = parsed.data;

    // Prevent admin/lead from demoting their own account
    if (userId === session.user.id && role !== session.user.role) {
      return errorResponse('Cannot change your own role', 400);
    }

    const [updated] = await db
      .update(user)
      .set({ role })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

    if (!updated) {
      return errorResponse('User not found', 404);
    }

    return jsonResponse({ user: updated });
  } catch (error) {
    console.error('[PUT /api/admin/users]', error);
    return errorResponse('Internal server error', 500);
  }
}

// ── Schema for admin status update ──
const updateStatusSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  accountStatus: z.enum(['active', 'flagged', 'banned']),
  adminNotes: z.string().max(1000).optional().default(''),
});

/**
 * PATCH /api/admin/users
 * Admin only — update a user's account status (active/flagged/banned).
 * When banning: auto-revokes their pass and resets profileComplete.
 * When flagging: resets profileComplete to force re-verification.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, updateStatusSchema);
    if (parsed.error) return parsed.error;

    const { userId, accountStatus, adminNotes } = parsed.data;

    // Prevent admin from banning themselves
    if (userId === session.user.id) {
      return errorResponse('Cannot change your own account status', 400);
    }

    // Verify the target user exists
    const [targetUser] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    // Prevent banning other admins/leads
    if ((targetUser.role === 'Admin' || targetUser.role === 'Lead') && accountStatus === 'banned') {
      return errorResponse('Cannot ban an admin or lead. Demote them first.', 400);
    }

    const updateSet: Record<string, unknown> = {
      accountStatus,
      adminNotes,
      updatedAt: new Date(),
    };

    // When banning or flagging: reset profileComplete to force re-verification
    if (accountStatus === 'banned' || accountStatus === 'flagged') {
      updateSet.profileComplete = false;
    }

    // Update the user
    const [updated] = await db
      .update(user)
      .set(updateSet)
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        adminNotes: user.adminNotes,
        profileComplete: user.profileComplete,
      });

    // When banning: also revoke their clearance pass
    if (accountStatus === 'banned') {
      await db
        .update(clearancePasses)
        .set({ revoked: true })
        .where(eq(clearancePasses.uid, userId));
    }

    return jsonResponse({ user: updated });
  } catch (error) {
    console.error('[PATCH /api/admin/users]', error);
    return errorResponse('Internal server error', 500);
  }
}
