import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications, events } from '@/lib/schema';
import { getSession, jsonResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/user/applications
 * Returns all applications for the authenticated user,
 * joined with event details for display.
 * Ordered by appliedAt descending (most recent first).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const userApplications = await db
      .select({
        id: applications.id,
        subEventId: applications.subEventId,
        status: applications.status,
        appliedAt: applications.appliedAt,
        checkedIn: applications.checkedIn,
        checkedInAt: applications.checkedInAt,
        notes: applications.notes,
        eventName: events.name,
        eventDate: events.date,
        eventVenue: events.venue,
        eventType: events.type,
        eventStatus: events.status,
      })
      .from(applications)
      .leftJoin(events, eq(applications.subEventId, events.id))
      .where(eq(applications.uid, session.user.id))
      .orderBy(desc(applications.appliedAt));

    return jsonResponse({ applications: userApplications });
  } catch (error) {
    console.error('[GET /api/user/applications]', error);
    return errorResponse('Internal server error', 500);
  }
}
