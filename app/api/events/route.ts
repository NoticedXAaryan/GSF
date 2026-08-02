import { NextRequest } from 'next/server';
import { eq, asc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, applications } from '@/lib/schema';
import { createEventSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  getSession,
  isAdmin,
  requireAdmin,
  generateId,
} from '@/lib/api-helpers';

/**
 * Derive registration status for an event:
 * - "closed" if the event is archived
 * - "open" if no capacity limit or currentRegistrations < capacity
 * - "full" if currentRegistrations >= capacity
 */
function deriveRegistrationStatus(event: {
  status: string;
  capacity: number | null;
  currentRegistrations: number | null;
}): 'open' | 'full' | 'closed' {
  if (event.status === 'archived') return 'closed';
  if (!event.capacity || event.capacity === 0) return 'open';
  const current = event.currentRegistrations ?? 0;
  return current >= event.capacity ? 'full' : 'open';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request.headers);
    const isAdminUser = session ? isAdmin(session.user.role) : false;

    let result;
    if (isAdminUser) {
      // Admins/Leads see all events (draft, published, archived)
      result = await db
        .select({
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          day: events.day,
          startTime: events.startTime,
          endTime: events.endTime,
          venue: events.venue,
          type: events.type,
          status: events.status,
          capacity: events.capacity,
          currentRegistrations: events.currentRegistrations,
          requiresShortlisting: events.requiresShortlisting,
          coordinatorName: events.coordinatorName,
          targetAudience: events.targetAudience,
        })
        .from(events)
        .orderBy(asc(events.day), asc(events.startTime));
    } else {
      // Public / non-admin users see only published events
      result = await db
        .select({
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          day: events.day,
          startTime: events.startTime,
          endTime: events.endTime,
          venue: events.venue,
          type: events.type,
          status: events.status,
          capacity: events.capacity,
          currentRegistrations: events.currentRegistrations,
          coordinatorName: events.coordinatorName,
          targetAudience: events.targetAudience,
        })
        .from(events)
        .where(eq(events.status, 'published'))
        .orderBy(asc(events.day), asc(events.startTime));
    }

    // Derive registrationStatus for each event
    let eventsWithStatus: Record<string, unknown>[] = result.map((event) => ({
      ...event,
      registrationStatus: deriveRegistrationStatus(event),
    }));

    // Admins additionally get a pending-application count per event so the
    // review queue is discoverable straight from the events list.
    if (isAdminUser) {
      const pendingRows = await db
        .select({
          subEventId: applications.subEventId,
          value: count(),
        })
        .from(applications)
        .where(eq(applications.status, 'pending'))
        .groupBy(applications.subEventId);

      const pendingByEvent = new Map(
        pendingRows.map((row) => [row.subEventId, row.value])
      );

      eventsWithStatus = eventsWithStatus.map((event) => ({
        ...event,
        pendingCount: pendingByEvent.get(event.id as string) ?? 0,
      }));
    }

    return jsonResponse({ events: eventsWithStatus });
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
