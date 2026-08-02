import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc, or, inArray, sql, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { announcements, applications, desks } from '@/lib/schema';
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed';
import { PageHeader } from '@/components/dashboard/PageHeader';
import type { AnnouncementPriority } from '@/lib/types';

/**
 * Attendee Announcements Page — Server Component
 * Shows all announcements targeted at the current user based on role and registrations.
 */
export default async function UserAnnouncementsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;
  const userRole = (session.user as { role?: string })?.role || 'Attendee';

  // Get sub-event IDs from accepted applications
  const acceptedApps = await db
    .select({ subEventId: applications.subEventId })
    .from(applications)
    .where(
      and(
        eq(applications.uid, userId),
        eq(applications.status, 'accepted')
      )
    );

  const acceptedEventIds = acceptedApps.map((app) => app.subEventId);

  // Get sub-event IDs where user is assigned as volunteer
  const volunteerDesks = await db
    .select({ subEventId: desks.subEventId })
    .from(desks)
    .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`);

  const assignedEventIds = volunteerDesks.map((d) => d.subEventId);
  const allEventIds = [...new Set([...acceptedEventIds, ...assignedEventIds])];

  // Build audience filter
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

  const announcementItems = rows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    priority: a.priority as AnnouncementPriority,
    createdAt: a.createdAt,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Live updates"
        title="Announcements"
        description="Latest updates from event organizers and coordinators."
      />
      <AnnouncementFeed announcements={announcementItems} />
    </div>
  );
}
