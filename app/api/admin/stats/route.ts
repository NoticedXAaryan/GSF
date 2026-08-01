import { NextRequest } from 'next/server';
import { eq, and, gt, count, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, events, applications, scanLogs } from '@/lib/schema';
import { jsonResponse, errorResponse, requireLead } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Lead access required.', 403);
    }

    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Run all stats queries in parallel
    const [
      totalUsersResult,
      totalEventsResult,
      totalApplicationsResult,
      statusBreakdown,
      checkInsLast24hResult,
      newUsersLast7dResult,
      eventsCapacityResult,
    ] = await Promise.all([
      // Total users
      db.select({ value: count() }).from(user),

      // Total non-archived events
      db
        .select({ value: count() })
        .from(events)
        .where(sql`${events.status} != 'archived'`),

      // Total applications
      db.select({ value: count() }).from(applications),

      // Applications grouped by status
      db
        .select({
          status: applications.status,
          value: count(),
        })
        .from(applications)
        .groupBy(applications.status),

      // Check-ins in last 24 hours (scan_logs with result "allowed" and timestamp > now - 86400000)
      db
        .select({ value: count() })
        .from(scanLogs)
        .where(
          and(
            eq(scanLogs.result, 'allowed'),
            gt(scanLogs.timestamp, oneDayAgo)
          )
        ),

      // New users in last 7 days
      db
        .select({ value: count() })
        .from(user)
        .where(gt(user.createdAt, sevenDaysAgo)),

      // Events capacity: published events with non-null capacity
      db
        .select({
          eventId: events.id,
          eventName: events.name,
          capacity: events.capacity,
          currentRegistrations: events.currentRegistrations,
        })
        .from(events)
        .where(
          and(
            eq(events.status, 'published'),
            isNotNull(events.capacity)
          )
        ),
    ]);

    // Build applicationsByStatus map with defaults
    const applicationsByStatus: Record<string, number> = {
      pending: 0,
      accepted: 0,
      waitlisted: 0,
      rejected: 0,
    };
    for (const row of statusBreakdown) {
      if (row.status && row.status in applicationsByStatus) {
        applicationsByStatus[row.status] = row.value;
      }
    }

    return jsonResponse({
      totalUsers: totalUsersResult[0]?.value ?? 0,
      totalEvents: totalEventsResult[0]?.value ?? 0,
      totalApplications: totalApplicationsResult[0]?.value ?? 0,
      applicationsByStatus,
      checkInsLast24h: checkInsLast24hResult[0]?.value ?? 0,
      newUsersLast7d: newUsersLast7dResult[0]?.value ?? 0,
      eventsCapacity: eventsCapacityResult,
    });
  } catch (error) {
    console.error('[GET /api/admin/stats]', error);
    return errorResponse('Internal server error', 500);
  }
}
