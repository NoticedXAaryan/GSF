import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { scanLogs } from '@/lib/schema';
import { requireVolunteer } from '@/lib/api-helpers';

/**
 * GET /api/scan/logs
 * Fetch scan logs for a specific event. Volunteer-or-above access.
 * Required query param: ?eventId=xxx
 * Optional pagination: ?limit=50&offset=0
 * Returns: { logs: [...], total: number }
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
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(scanLogs)
        .where(eq(scanLogs.eventId, eventId))
        .orderBy(desc(scanLogs.timestamp))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(scanLogs)
        .where(eq(scanLogs.eventId, eventId)),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({ logs: rows, total });
  } catch (error) {
    console.error('[GET /api/scan/logs]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
