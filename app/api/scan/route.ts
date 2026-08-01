import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clearancePasses, events, applications, scanLogs } from '@/lib/schema';
import { scanSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireVolunteer,
  generateId,
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Only volunteers, leads, or admins can scan
    const session = await requireVolunteer(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Volunteer access required.', 403);
    }

    const parsed = await parseBody(request, scanSchema);
    if (parsed.error) return parsed.error;

    const { eventId, passId, qrToken } = parsed.data;
    const scannedByUid = session.user.id;

    // ── Look up the clearance pass ──
    let passData;
    if (qrToken) {
      [passData] = await db
        .select()
        .from(clearancePasses)
        .where(
          and(
            eq(clearancePasses.qrToken, qrToken),
            eq(clearancePasses.revoked, false)
          )
        )
        .limit(1);

      // If not found with revoked=false, check if it exists but is revoked
      if (!passData) {
        const [revokedPass] = await db
          .select()
          .from(clearancePasses)
          .where(eq(clearancePasses.qrToken, qrToken))
          .limit(1);

        if (revokedPass && revokedPass.revoked) {
          // Pass exists but is revoked
          await logScan({
            passId: revokedPass.passId,
            uid: revokedPass.uid,
            userName: revokedPass.userName,
            scannedByUid,
            eventId,
            eventName: '',
            result: 'denied',
            reason: 'Pass revoked',
          });
          return jsonResponse({
            result: 'denied',
            reason: 'Pass revoked',
            userName: revokedPass.userName,
          });
        }

        // Pass does not exist at all — QR cannot be decoded / not found
        await logScan({
          passId: '',
          uid: '',
          userName: '',
          scannedByUid,
          eventId,
          eventName: '',
          result: 'denied',
          reason: 'Pass not found or invalid code',
        });
        return jsonResponse({
          result: 'denied',
          reason: 'Pass not found or invalid code',
        });
      }
    } else if (passId) {
      [passData] = await db
        .select()
        .from(clearancePasses)
        .where(eq(clearancePasses.passId, passId.trim().toUpperCase()))
        .limit(1);

      if (!passData) {
        await logScan({
          passId: passId.trim().toUpperCase(),
          uid: '',
          userName: '',
          scannedByUid,
          eventId,
          eventName: '',
          result: 'denied',
          reason: 'Pass not found or invalid code',
        });
        return jsonResponse({
          result: 'denied',
          reason: 'Pass not found or invalid code',
        });
      }

      // Check if pass is revoked (for passId lookups)
      if (passData.revoked) {
        await logScan({
          passId: passData.passId,
          uid: passData.uid,
          userName: passData.userName,
          scannedByUid,
          eventId,
          eventName: '',
          result: 'denied',
          reason: 'Pass revoked',
        });
        return jsonResponse({
          result: 'denied',
          reason: 'Pass revoked',
          userName: passData.userName,
        });
      }
    }

    if (!passData) {
      await logScan({
        passId: '',
        uid: '',
        userName: '',
        scannedByUid,
        eventId,
        eventName: '',
        result: 'denied',
        reason: 'Pass not found or invalid code',
      });
      return jsonResponse({
        result: 'denied',
        reason: 'Pass not found or invalid code',
      });
    }

    const resolvedPassId = passData.passId;
    const attendeeUid = passData.uid;
    const attendeeName = passData.userName;

    // ── Fetch event details ──
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    const eventName = event?.name ?? 'Unknown Event';
    const eventType = event?.type ?? 'open';

    // ── Check if already checked in (scan_logs with same uid + eventId + result "allowed") ──
    const [existingCheck] = await db
      .select({ id: scanLogs.id })
      .from(scanLogs)
      .where(
        and(
          eq(scanLogs.uid, attendeeUid),
          eq(scanLogs.eventId, eventId),
          eq(scanLogs.result, 'allowed')
        )
      )
      .limit(1);

    if (existingCheck) {
      await logScan({
        passId: resolvedPassId,
        uid: attendeeUid,
        userName: attendeeName,
        scannedByUid,
        eventId,
        eventName,
        result: 'already_checked_in',
        reason: 'Already checked in',
      });
      return jsonResponse({
        result: 'already_checked_in',
        userName: attendeeName,
      });
    }

    // ── For non-open events: verify user has an accepted application ──
    if (eventType !== 'open') {
      const [application] = await db
        .select()
        .from(applications)
        .where(
          and(
            eq(applications.uid, attendeeUid),
            eq(applications.subEventId, eventId),
            eq(applications.status, 'accepted')
          )
        )
        .limit(1);

      if (!application) {
        await logScan({
          passId: resolvedPassId,
          uid: attendeeUid,
          userName: attendeeName,
          scannedByUid,
          eventId,
          eventName,
          result: 'denied',
          reason: 'Not registered or not accepted for this event',
        });
        return jsonResponse({
          result: 'denied',
          reason: 'Not registered or not accepted for this event',
          userName: attendeeName,
        });
      }

      // ── Transaction: mark checked in + log ──
      await db.transaction(async (tx) => {
        await tx
          .update(applications)
          .set({
            checkedIn: true,
            checkedInAt: Date.now(),
            checkedInBy: scannedByUid,
          })
          .where(eq(applications.id, application.id));

        await tx.insert(scanLogs).values({
          id: generateId(),
          passId: resolvedPassId,
          uid: attendeeUid,
          userName: attendeeName,
          scannedByUid,
          eventId,
          eventName,
          result: 'allowed',
          reason: '',
          timestamp: Date.now(),
        });
      });

      return jsonResponse({
        result: 'allowed',
        userName: attendeeName,
      });
    }

    // ── Open events: allow with valid pass (no application needed) ──
    // Wrap in transaction for consistency
    await db.transaction(async (tx) => {
      await tx.insert(scanLogs).values({
        id: generateId(),
        passId: resolvedPassId,
        uid: attendeeUid,
        userName: attendeeName,
        scannedByUid,
        eventId,
        eventName,
        result: 'allowed',
        reason: '',
        timestamp: Date.now(),
      });
    });

    return jsonResponse({
      result: 'allowed',
      userName: attendeeName,
    });
  } catch (error) {
    console.error('[POST /api/scan]', error);
    return errorResponse('Internal server error', 500);
  }
}

// ── Helper ──
interface ScanLogInput {
  passId: string;
  uid: string;
  userName: string;
  scannedByUid: string;
  eventId: string;
  eventName: string;
  result: 'allowed' | 'denied' | 'already_checked_in';
  reason?: string;
}

async function logScan(data: ScanLogInput) {
  await db.insert(scanLogs).values({
    id: generateId(),
    ...data,
    reason: data.reason ?? '',
    timestamp: Date.now(),
  });
}
