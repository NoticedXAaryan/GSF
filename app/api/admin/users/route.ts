import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
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
    const roleFilter = searchParams.get('role');

    let result;
    if (roleFilter) {
      result = await db
        .select({
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
        })
        .from(user)
        .where(eq(user.role, roleFilter))
        .orderBy(desc(user.createdAt));
    } else {
      result = await db
        .select({
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
        })
        .from(user)
        .orderBy(desc(user.createdAt));
    }

    return jsonResponse({ users: result, total: result.length });
  } catch (error) {
    console.error('[GET /api/admin/users]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, updateRoleSchema);
    if (parsed.error) return parsed.error;

    const { userId, role } = parsed.data;

    // Prevent self-demotion
    if (userId === session.user.id && !['Admin', 'Lead'].includes(role)) {
      return errorResponse('Cannot demote yourself', 400);
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
    console.error('[PATCH /api/admin/users]', error);
    return errorResponse('Internal server error', 500);
  }
}
