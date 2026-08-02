import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { QRScanner } from '@/components/dashboard/QRScanner';
import { AttendanceExport } from '@/components/dashboard/AttendanceExport';
import { PageHeader } from '@/components/dashboard/PageHeader';

/**
 * Admin Scanner Page — Server Component
 * Admins have access to scan for ALL events, not just assigned ones.
 */
export default async function AdminScannerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  // Admins can scan for any published event
  const allEvents = await db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(eq(events.status, 'published'));

  const scannerEvents = allEvents.map((e) => ({ id: e.id, name: e.name }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        eyebrow="Gate control"
        title="Check-In Scanner"
        description="Scan attendee QR codes for any event. Admins have access to all published events."
      />
      <QRScanner events={scannerEvents} />
      <AttendanceExport events={scannerEvents} />
    </div>
  );
}
