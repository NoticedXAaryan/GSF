import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc, sql, or, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { desks, events, announcements } from '@/lib/schema';
import { Card, CardBody } from '@/components/ui/Card';
import { QRScanner } from '@/components/dashboard/QRScanner';
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed';
import { PageHeader } from '@/components/dashboard/PageHeader';
import type { AnnouncementPriority } from '@/lib/types';

/**
 * Volunteer Dashboard — Server Component
 * Displays assigned sub-events, QR scanner, and announcements.
 * Requirements: 13.1, 13.2, 13.6, 5.5, 5.7
 */
export default async function VolunteerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch volunteer's assigned sub-events (desks where user is in assignedVolunteerUids)
  const volunteerDesks = await db
    .select({
      deskId: desks.id,
      subEventId: desks.subEventId,
      eventId: events.id,
      eventName: events.name,
      eventDate: events.date,
      eventDay: events.day,
      startTime: events.startTime,
      endTime: events.endTime,
      venue: events.venue,
    })
    .from(desks)
    .innerJoin(events, eq(desks.subEventId, events.id))
    .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`);

  // Collect assigned event IDs for announcement filtering
  const assignedEventIds = volunteerDesks.map((d) => d.subEventId);

  // Fetch announcements for Volunteer role or assigned sub-event IDs
  const audienceConditions = [
    eq(announcements.audience, 'all'),
    eq(announcements.audience, 'Volunteer'),
  ];

  if (assignedEventIds.length > 0) {
    audienceConditions.push(inArray(announcements.audience, assignedEventIds));
  }

  const announcementRows = await db
    .select()
    .from(announcements)
    .where(or(...audienceConditions))
    .orderBy(desc(announcements.createdAt));

  // Map announcements to the shape expected by AnnouncementFeed
  const announcementItems = announcementRows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    priority: a.priority as AnnouncementPriority,
    createdAt: a.createdAt,
  }));

  // Prepare events list for QRScanner
  const scannerEvents = volunteerDesks.map((d) => ({
    id: d.eventId,
    name: d.eventName,
  }));

  return (
    <div className="space-y-8">
      {/* Heading */}
      <PageHeader
        eyebrow="Your shifts"
        title="My Assignments"
        description="Sub-events you are assigned to as a volunteer."
      />

      {/* Assignment Cards Grid */}
      {volunteerDesks.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-fg-dim">
            You are not assigned to any sub-events yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteerDesks.map((assignment) => (
            <Card
              key={`${assignment.deskId}-${assignment.eventId}`}
              className="animate-tile-in"
            >
              <CardBody>
                <h3 className="font-semibold text-fg text-base mb-2">
                  {assignment.eventName}
                </h3>
                <div className="space-y-1 text-sm text-fg-dim">
                  <p>
                    <span className="font-medium text-fg">Date:</span>{' '}
                    {assignment.eventDate} (Day {assignment.eventDay})
                  </p>
                  <p>
                    <span className="font-medium text-fg">Time:</span>{' '}
                    {assignment.startTime} – {assignment.endTime}
                  </p>
                  <p>
                    <span className="font-medium text-fg">Venue:</span>{' '}
                    {assignment.venue}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* QR Scanner Section */}
      <section>
        <h2 className="text-lg font-semibold text-fg mb-3">
          Check-In Scanner
        </h2>
        <QRScanner events={scannerEvents} />
      </section>

      {/* Announcements Section */}
      <section>
        <h2 className="text-lg font-semibold text-fg mb-3">
          Announcements
        </h2>
        <AnnouncementFeed announcements={announcementItems} />
      </section>
    </div>
  );
}
