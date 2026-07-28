import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcements } from '@/lib/schema';
import { desc } from 'drizzle-orm';

/**
 * GET /api/announcements
 * Public-read endpoint for announcements. Any authenticated user can read.
 * Admin write operations remain on /api/admin/announcements.
 */
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
