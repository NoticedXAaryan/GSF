import { NextRequest } from 'next/server';
import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications, events } from '@/lib/schema';
import { jsonResponse, errorResponse, requireLead } from '@/lib/api-helpers';

/**
 * GET /api/admin/applications
 * Cross-event application queue for admins/leads.
 *
 * Query params:
 *   ?status=pending|accepted|waitlisted|rejected   (default: pending)
 *   ?eventId=<id>                                  (optional narrowing)
 *
 * Returns applications joined with their event so the reviewer has context
 * without drilling into each event separately.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin or Lead access required.', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const eventId = searchParams.get('eventId');

    const VALID = ['pending', 'accepted', 'waitlisted', 'rejected', 'not_eligible'];
    if (status !== 'all' && !VALID.includes(status)) {
      return errorResponse('Invalid status filter', 400);
    }

    const conditions = [];
    if (status !== 'all') {
      conditions.push(eq(applications.status, status as 'pending'));
    }
    if (eventId) {
      conditions.push(eq(applications.subEventId, eventId));
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const rows = await db
      .select({
        id: applications.id,
        uid: applications.uid,
        subEventId: applications.subEventId,
        userName: applications.userName,
        userEmail: applications.userEmail,
        status: applications.status,
        notes: applications.notes,
        appliedAt: applications.appliedAt,
        decidedAt: applications.decidedAt,
        checkedIn: applications.checkedIn,
        eventName: events.name,
        eventDate: events.date,
        eventDay: events.day,
        eventVenue: events.venue,
        eventCapacity: events.capacity,
        eventRegistrations: events.currentRegistrations,
      })
      .from(applications)
      .leftJoin(events, eq(applications.subEventId, events.id))
      .where(whereClause)
      .orderBy(desc(applications.appliedAt));

    // Status tallies for the filter chips
    const tallyRows = await db
      .select({ status: applications.status, value: count() })
      .from(applications)
      .groupBy(applications.status);

    const counts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      waitlisted: 0,
      rejected: 0,
    };
    for (const row of tallyRows) {
      if (row.status && row.status in counts) counts[row.status] = row.value;
    }

    return jsonResponse({ applications: rows, total: rows.length, counts });
  } catch (error) {
    console.error('[GET /api/admin/applications]', error);
    return errorResponse('Internal server error', 500);
  }
}
