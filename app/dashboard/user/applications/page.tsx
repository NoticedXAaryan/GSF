import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc, or, inArray, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { applications, events, announcements, desks } from '@/lib/schema';
import { ApplicationList } from '@/components/dashboard/ApplicationList';
import { PageHeader } from '@/components/dashboard/PageHeader';

/**
 * Attendee Applications Page — Server Component
 * Full-page view of all user applications with event details.
 */
export default async function UserApplicationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  const userApplications = await db
    .select({
      id: applications.id,
      subEventId: applications.subEventId,
      status: applications.status,
      appliedAt: applications.appliedAt,
      eventName: events.name,
      eventDate: events.date,
      eventVenue: events.venue,
      eventType: events.type,
    })
    .from(applications)
    .leftJoin(events, eq(applications.subEventId, events.id))
    .where(eq(applications.uid, userId))
    .orderBy(desc(applications.appliedAt));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Your entries"
        title="Applications"
        description="Track all your sub-event applications and their status."
      />

      <ApplicationList
        applications={userApplications.map((app) => ({
          id: app.id,
          subEventId: app.subEventId,
          status: app.status as "pending" | "accepted" | "waitlisted" | "rejected",
          appliedAt: app.appliedAt,
          eventName: app.eventName,
          eventDate: app.eventDate,
          eventVenue: app.eventVenue,
          eventType: app.eventType,
        }))}
      />
    </div>
  );
}
