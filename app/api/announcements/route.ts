import { NextRequest } from 'next/server';
import { eq, desc, sql, inArray, or, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { announcements, applications, desks } from '@/lib/schema';
import { getSession, jsonResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/announcements
 * User-facing endpoint that returns announcements targeted at the authenticated user.
 * Filters by audience matching:
 *   - "all" → always included
 *   - matches user's role (e.g., "Volunteer", "Attendee") → included
 *   - matches a sub-event ID the user is registered for (accepted application) → included
 *   - matches a sub-event ID the user is assigned to as a volunteer → included
 * Ordered by createdAt desc (newest first).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request.headers);
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Fetch sub-event IDs from accepted applications
    const acceptedApps = await db
      .select({ subEventId: applications.subEventId })
      .from(applications)
      .where(
        and(
          eq(applications.uid, userId),
          eq(applications.status, 'accepted')
        )
      );

    const registeredEventIds = acceptedApps
      .filter((app) => app.subEventId)
      .map((app) => app.subEventId);

    // Fetch sub-event IDs where user is assigned as a volunteer
    const volunteerDesks = await db
      .select({ subEventId: desks.subEventId })
      .from(desks)
      .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`);

    const assignedEventIds = volunteerDesks.map((d) => d.subEventId);

    // Combine all sub-event IDs the user is associated with
    const allEventIds = [...new Set([...registeredEventIds, ...assignedEventIds])];

    // Build audience matching conditions
    // Announcement audience can be "all", a role name, or a sub-event ID
    const audienceConditions = [
      eq(announcements.audience, 'all'),
      eq(announcements.audience, userRole),
    ];

    if (allEventIds.length > 0) {
      audienceConditions.push(inArray(announcements.audience, allEventIds));
    }

    const rows = await db
      .select()
      .from(announcements)
      .where(or(...audienceConditions))
      .orderBy(desc(announcements.createdAt));

    return jsonResponse({ announcements: rows });
  } catch (error) {
    console.error('[GET /api/announcements]', error);
    return errorResponse('Internal server error', 500);
  }
}
