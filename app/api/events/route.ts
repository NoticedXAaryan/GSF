import { NextRequest } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { createEventSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireSession,
  requireAdmin,
  generateId,
} from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    const isAdminUser = session ? ['Admin', 'Lead'].includes(session.user.role) : false;

    let result;
    if (isAdminUser) {
      // Admins see all events (including drafts)
      result = await db
        .select()
        .from(events)
        .orderBy(asc(events.day), asc(events.startTime));
    } else {
      // Public sees only published events
      result = await db
        .select()
        .from(events)
        .where(eq(events.status, 'published'))
        .orderBy(asc(events.day), asc(events.startTime));
    }

    return jsonResponse({ events: result });
  } catch (error) {
    console.error('[GET /api/events]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, createEventSchema);
    if (parsed.error) return parsed.error;

    const { data } = parsed;
    const id = generateId();
    const now = Date.now();

    const [event] = await db
      .insert(events)
      .values({
        id,
        name: data.name,
        description: data.description,
        date: data.date,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        venue: data.venue,
        type: data.type,
        targetAudience: data.targetAudience,
        capacity: data.capacity,
        currentRegistrations: 0,
        requiresShortlisting: data.requiresShortlisting,
        coordinatorName: data.coordinatorName,
        status: data.status,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return jsonResponse({ event }, 201);
  } catch (error) {
    console.error('[POST /api/events]', error);
    return errorResponse('Internal server error', 500);
  }
}
