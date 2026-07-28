import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { scanLogs } from '@/lib/schema';
import { requireVolunteer } from '@/lib/api-helpers';

/**
 * GET /api/scan/logs
 * Fetch scan logs. Volunteer-or-above access.
 * Optional query param: ?scannedByUid=xxx to filter by scanner.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireVolunteer(request.headers);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Volunteer access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scannedByUid = searchParams.get('scannedByUid');

    let rows;
    if (scannedByUid) {
      rows = await db
        .select()
        .from(scanLogs)
        .where(eq(scanLogs.scannedByUid, scannedByUid))
        .orderBy(desc(scanLogs.timestamp))
        .limit(200);
    } else {
      rows = await db
        .select()
        .from(scanLogs)
        .orderBy(desc(scanLogs.timestamp))
        .limit(200);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('[GET /api/scan/logs]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
