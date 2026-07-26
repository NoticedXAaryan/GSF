import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { announcements } from '@/lib/schema';
import { createAnnouncementSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireAdmin,
  generateId,
} from '@/lib/api-helpers';

export async function GET() {
  try {
    const result = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    return jsonResponse({ announcements: result });
  } catch (error) {
    console.error('[GET /api/admin/announcements]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, createAnnouncementSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;

    const [announcement] = await db
      .insert(announcements)
      .values({
        id: generateId(),
        title: data.title,
        body: data.body,
        audience: data.audience,
        priority: data.priority,
        createdAt: Date.now(),
        createdBy: session.user.id,
      })
      .returning();

    return jsonResponse({ announcement }, 201);
  } catch (error) {
    console.error('[POST /api/admin/announcements]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Announcement id is required', 400);
    }

    const [deleted] = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });

    if (!deleted) {
      return errorResponse('Announcement not found', 404);
    }

    return jsonResponse({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('[DELETE /api/admin/announcements]', error);
    return errorResponse('Internal server error', 500);
  }
}
