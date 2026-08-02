import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc, or, inArray, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { announcements, desks } from '@/lib/schema';
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed';
import { PageHeader } from '@/components/dashboard/PageHeader';
import type { AnnouncementPriority } from '@/lib/types';

/**
 * Volunteer Announcements Page — Server Component
 * Shows announcements targeted at volunteers and their assigned sub-events.
 */
export default async function VolunteerAnnouncementsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Get sub-event IDs where user is assigned as volunteer
  const volunteerDesks = await db
    .select({ subEventId: desks.subEventId })
    .from(desks)
    .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`);

  const assignedEventIds = volunteerDesks.map((d) => d.subEventId);

  // Build audience filter
  const audienceConditions = [
    eq(announcements.audience, 'all'),
    eq(announcements.audience, 'Volunteer'),
  ];

  if (assignedEventIds.length > 0) {
    audienceConditions.push(inArray(announcements.audience, assignedEventIds));
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Crew updates"
        title="Announcements"
        description="Updates from event organizers relevant to your volunteer assignments."
      />
      <AnnouncementFeed announcements={announcementItems} />
    </div>
  );
}
