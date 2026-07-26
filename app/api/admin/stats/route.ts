import { NextRequest } from 'next/server';
import { eq, sql, and, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, events, applications, scanLogs } from '@/lib/schema';
import { jsonResponse, errorResponse, requireAdmin } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Run all stats queries in parallel for speed
    const [
      usersCount,
      eventsCount,
      appsCount,
      statusBreakdown,
      todayCheckIns,
      capacityInfo,
      recentUsers,
    ] = await Promise.all([
      // Total users
      db.select({ count: sql<number>`count(*)::int` }).from(user),

      // Total active events
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(sql`${events.status} != 'archived'`),

      // Total applications
      db.select({ count: sql<number>`count(*)::int` }).from(applications),

      // Applications grouped by status
      db
        .select({
          status: applications.status,
          count: sql<number>`count(*)::int`,
        })
        .from(applications)
        .groupBy(applications.status),

      // Check-ins in the last 24 hours
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(scanLogs)
        .where(
          and(
            eq(scanLogs.result, 'allowed'),
            gt(scanLogs.timestamp, oneDayAgo)
          )
        ),

      // Events with capacity utilization
      db
        .select({
          id: events.id,
          name: events.name,
          capacity: events.capacity,
          currentRegistrations: events.currentRegistrations,
        })
        .from(events)
        .where(
          and(
            eq(events.status, 'published'),
            sql`${events.capacity} IS NOT NULL`
          )
        ),

      // Recently registered users (last 7 days)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(user)
        .where(gt(user.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))),
    ]);

    const statusMap = statusBreakdown.reduce(
      (acc, row) => {
        if (row.status) acc[row.status] = row.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return jsonResponse({
      stats: {
        totalUsers: usersCount[0]?.count ?? 0,
        totalEvents: eventsCount[0]?.count ?? 0,
        totalApplications: appsCount[0]?.count ?? 0,
        applicationsByStatus: statusMap,
        checkInsToday: todayCheckIns[0]?.count ?? 0,
        newUsersThisWeek: recentUsers[0]?.count ?? 0,
        eventsCapacity: capacityInfo,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/stats]', error);
    return errorResponse('Internal server error', 500);
  }
}
