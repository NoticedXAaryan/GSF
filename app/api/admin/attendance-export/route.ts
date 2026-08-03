import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { scanLogs, events, user } from '@/lib/schema';
import { requireAdmin } from '@/lib/api-helpers';

/**
 * GET /api/admin/attendance-export?eventId=xxx
 * Export attendance data as CSV for a specific event.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId query parameter is required' },
        { status: 400 }
      );
    }

    // Get event name
    const [event] = await db
      .select({ name: events.name })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    const eventName = event?.name || 'Unknown Event';

    // Fetch all scan logs for this event joined with user table
    const logs = await db
      .select({
        scanLog: scanLogs,
        user: user,
      })
      .from(scanLogs)
      .leftJoin(user, eq(scanLogs.uid, user.id))
      .where(eq(scanLogs.eventId, eventId))
      .orderBy(desc(scanLogs.timestamp));

    // Build CSV
    const headers = [
      'Pass ID',
      'User Name',
      'User ID',
      'Email',
      'Phone',
      'College',
      'Course',
      'Semester',
      'Enrollment Number',
      'University ID',
      'Account Status',
      'Event Name',
      'Scan Result',
      'Reason',
      'Scanned By',
      'Timestamp',
    ];

    const rows = logs.map(({ scanLog, user }) => [
      scanLog.passId,
      scanLog.userName,
      scanLog.uid,
      user?.email || '',
      user?.phone || '',
      user?.organization || '',
      user?.collegeDept || '',
      user?.year || '',
      user?.enrollmentNumber || '',
      user?.universityId || '',
      user?.accountStatus || '',
      scanLog.eventName || eventName,
      scanLog.result,
      scanLog.reason || '',
      scanLog.scannedByUid,
      new Date(scanLog.timestamp).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const filename = `attendance-${eventName.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/attendance-export]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
