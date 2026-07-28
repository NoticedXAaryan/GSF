import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications, events } from '@/lib/schema';
import { jsonResponse, errorResponse, requireSession } from '@/lib/api-helpers';

/**
 * GET /api/user/applications
 * Returns all applications for the authenticated user,
 * joined with event names for display.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const userApps = await db
      .select({
        id: applications.id,
        subEventId: applications.subEventId,
        eventName: events.name,
        status: applications.status,
        appliedAt: applications.appliedAt,
        checkedIn: applications.checkedIn,
        checkedInAt: applications.checkedInAt,
        notes: applications.notes,
      })
      .from(applications)
      .leftJoin(events, eq(applications.subEventId, events.id))
      .where(eq(applications.uid, session.user.id))
      .orderBy(desc(applications.appliedAt));

    return jsonResponse({ applications: userApps });
  } catch (error) {
    console.error('[GET /api/user/applications]', error);
    return errorResponse('Internal server error', 500);
  }
}
