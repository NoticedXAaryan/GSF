import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clearancePasses, events, applications, scanLogs, user } from '@/lib/schema';
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
    // Only volunteers, admins, or leads can scan
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
    if (passId) {
      [passData] = await db
        .select()
        .from(clearancePasses)
        .where(eq(clearancePasses.passId, passId.trim().toUpperCase()))
        .limit(1);
    } else if (qrToken) {
      [passData] = await db
        .select()
        .from(clearancePasses)
        .where(eq(clearancePasses.qrToken, qrToken))
        .limit(1);
    }

    if (!passData) {
      return jsonResponse({ result: 'denied', reason: 'Invalid pass or QR code' }, 404);
    }

    const resolvedPassId = passData.passId;

    // ── Check if pass is revoked ──
    if (passData.revoked) {
      await logScan({
        passId: resolvedPassId,
        uid: passData.uid,
        userName: passData.userName,
        scannedByUid,
        eventId,
        eventName: '',
        result: 'denied',
        reason: 'Pass has been revoked',
      });
      return jsonResponse({
        result: 'denied',
        reason: 'Pass has been revoked',
        user: { name: passData.userName, email: passData.userEmail },
      });
    }

    // ── Fetch event details ──
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    const eventName = event?.name ?? 'Unknown Event';
    const eventType = event?.type ?? 'open';

    // ── Fetch user profile ──
    const [userData] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeDept: user.collegeDept,
        year: user.year,
        organization: user.organization,
      })
      .from(user)
      .where(eq(user.id, passData.uid))
      .limit(1);

    // ── Open events: allow without application ──
    if (eventType === 'open') {
      const [existingCheck] = await db
        .select({ id: scanLogs.id })
        .from(scanLogs)
        .where(
          and(
            eq(scanLogs.uid, passData.uid),
            eq(scanLogs.eventId, eventId),
            eq(scanLogs.result, 'allowed')
          )
        )
        .limit(1);

      if (existingCheck) {
        await logScan({
          passId: resolvedPassId,
          uid: passData.uid,
          userName: passData.userName,
          scannedByUid,
          eventId,
          eventName,
          result: 'already_checked_in',
          reason: 'Already checked in',
        });
        return jsonResponse({
          result: 'already_checked_in',
          reason: 'Already checked in for this event',
          user: userData,
          event: eventName,
        });
      }

      await logScan({
        passId: resolvedPassId,
        uid: passData.uid,
        userName: passData.userName,
        scannedByUid,
        eventId,
        eventName,
        result: 'allowed',
      });
      return jsonResponse({ result: 'allowed', user: userData, event: eventName });
    }

    // ── Non-open events: require accepted application ──
    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.uid, passData.uid),
          eq(applications.subEventId, eventId)
        )
      )
      .limit(1);

    if (!application) {
      await logScan({
        passId: resolvedPassId,
        uid: passData.uid,
        userName: passData.userName,
        scannedByUid,
        eventId,
        eventName,
        result: 'denied',
        reason: 'No application found',
      });
      return jsonResponse({
        result: 'denied',
        reason: 'Not registered for this event',
        user: userData,
        event: eventName,
      });
    }

    if (application.status !== 'accepted') {
      await logScan({
        passId: resolvedPassId,
        uid: passData.uid,
        userName: passData.userName,
        scannedByUid,
        eventId,
        eventName,
        result: 'denied',
        reason: `Application status: ${application.status}`,
      });
      return jsonResponse({
        result: 'denied',
        reason: `Application status: ${application.status}`,
        user: userData,
        event: eventName,
      });
    }

    if (application.checkedIn) {
      await logScan({
        passId: resolvedPassId,
        uid: passData.uid,
        userName: passData.userName,
        scannedByUid,
        eventId,
        eventName,
        result: 'already_checked_in',
        reason: 'Already checked in',
      });
      return jsonResponse({
        result: 'already_checked_in',
        reason: 'Already checked in',
        user: userData,
        event: eventName,
        checkedInAt: application.checkedInAt,
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
        uid: passData.uid,
        userName: passData.userName,
        scannedByUid,
        eventId,
        eventName,
        result: 'allowed',
        reason: '',
        timestamp: Date.now(),
      });
    });

    return jsonResponse({ result: 'allowed', user: userData, event: eventName });
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
