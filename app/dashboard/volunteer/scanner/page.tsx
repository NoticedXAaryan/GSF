import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { desks, events } from '@/lib/schema';
import { QRScanner } from '@/components/dashboard/QRScanner';
import { PageHeader } from '@/components/dashboard/PageHeader';

/**
 * Volunteer Scanner Page — Server Component
 * Standalone QR scanner page for volunteer check-in operations.
 */
export default async function VolunteerScannerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch volunteer's assigned sub-events
  const volunteerDesks = await db
    .select({
      eventId: events.id,
      eventName: events.name,
    })
    .from(desks)
    .innerJoin(events, eq(desks.subEventId, events.id))
    .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`);

  const scannerEvents = volunteerDesks.map((d) => ({
    id: d.eventId,
    name: d.eventName,
  }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        eyebrow="Gate control"
        title="Check-In Scanner"
        description="Use the camera to scan attendee QR codes for event check-in."
      />
      <QRScanner events={scannerEvents} />
    </div>
  );
}
