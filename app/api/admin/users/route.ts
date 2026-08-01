import { NextRequest } from 'next/server';
import { eq, desc, ilike, or, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { updateRoleSchema } from '@/lib/validators';
import { jsonResponse, errorResponse, parseBody, requireAdmin } from '@/lib/api-helpers';

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

    // Prevent admin from demoting their own account below Admin level
    if (userId === session.user.id && role !== 'Admin') {
      return errorResponse('Cannot demote your own account', 400);
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
