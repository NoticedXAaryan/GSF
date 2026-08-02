'use server';

import { db } from '@/lib/db';
import { scanLogs } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Checks if a pass has been recently scanned in the last 5 seconds.
 * This is used for real-time polling on the user's PassCard to trigger
 * the scan animation remotely when an admin or volunteer scans their QR code.
 */
export async function checkRecentScan(passId: string): Promise<boolean> {
  const fiveSecondsAgo = Date.now() - 5000;

  const recentScans = await db
    .select({ id: scanLogs.id })
    .from(scanLogs)
    .where(
      and(
        eq(scanLogs.passId, passId),
        gt(scanLogs.timestamp, fiveSecondsAgo)
      )
    )
    .limit(1);

  return recentScans.length > 0;
}
