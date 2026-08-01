import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq, and, gt, count, isNotNull, sql, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  user,
  events,
  applications,
  scanLogs,
  taskChecklists,
  tasks,
  announcements,
} from '@/lib/schema';
import { AdminStats } from '@/components/dashboard/AdminStats';
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed';
import { AdminTaskChecklists } from './AdminTaskChecklists';
import type { AnnouncementItem } from '@/components/dashboard/AnnouncementFeed';

async function getAdminData() {
  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsersResult,
    totalEventsResult,
    totalApplicationsResult,
    statusBreakdown,
    checkInsLast24hResult,
    newUsersLast7dResult,
    eventsCapacityResult,
    checklistsResult,
    tasksResult,
    announcementsResult,
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

    // Check-ins in last 24 hours
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

    // Task checklists
    db.select().from(taskChecklists),

    // All tasks
    db.select().from(tasks),

    // Recent announcements (limit 10, ordered by createdAt desc)
    db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(10),
  ]);

  // Build applicationsByStatus map
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

  return {
    stats: {
      totalUsers: totalUsersResult[0]?.value ?? 0,
      totalEvents: totalEventsResult[0]?.value ?? 0,
      totalApplications: totalApplicationsResult[0]?.value ?? 0,
      applicationsByStatus: applicationsByStatus as {
        pending: number;
        accepted: number;
        waitlisted: number;
        rejected: number;
      },
      checkInsLast24h: checkInsLast24hResult[0]?.value ?? 0,
      newUsersLast7d: newUsersLast7dResult[0]?.value ?? 0,
      eventsCapacity: eventsCapacityResult.map((e) => ({
        eventId: e.eventId,
        eventName: e.eventName,
        capacity: e.capacity,
        currentRegistrations: e.currentRegistrations ?? 0,
      })),
    },
    checklistsResult,
    tasksResult,
    announcementsResult,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as { role?: string })?.role || 'Attendee';
  if (role !== 'Admin' && role !== 'Lead') {
    redirect('/dashboard/user');
  }

  const { stats, checklistsResult, tasksResult, announcementsResult } =
    await getAdminData();

  // Compose task checklists with their tasks
  const checklistsWithTasks = checklistsResult.map((checklist) => ({
    id: checklist.id,
    title: checklist.title,
    subEventId: checklist.subEventId,
    tasks: tasksResult
      .filter((t) => t.checklistId === checklist.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((t) => ({
        id: t.id,
        checklistId: t.checklistId,
        title: t.title,
        description: t.description ?? '',
        dueDate: t.dueDate,
        completed: t.completed ?? false,
        completedAt: t.completedAt,
        sortOrder: t.sortOrder ?? 0,
      })),
  }));

  // Map announcements to the format expected by AnnouncementFeed
  const announcementItems: AnnouncementItem[] = announcementsResult.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    priority: a.priority,
    createdAt: a.createdAt,
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview and management.
        </p>
      </div>

      {/* Stats section */}
      <AdminStats stats={stats} />

      {/* Task Checklists section */}
      {checklistsWithTasks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Task Checklists
          </h2>
          <AdminTaskChecklists checklists={checklistsWithTasks} />
        </section>
      )}

      {/* Announcements section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Announcements
        </h2>
        <AnnouncementFeed announcements={announcementItems} />
      </section>
    </div>
  );
}
