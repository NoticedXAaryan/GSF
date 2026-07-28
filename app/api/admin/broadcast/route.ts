import { NextRequest } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, applications, announcements } from '@/lib/schema';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireAdmin,
  generateId,
} from '@/lib/api-helpers';
import { sendBroadcast } from '@/lib/email';
import { z } from 'zod';

const broadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  body: z.string().min(1, 'Body is required').max(10000, 'Body is too long'),
  audience: z.string().min(1, 'Audience is required'),
});

/**
 * POST /api/admin/broadcast
 * Send a mass email to targeted audiences.
 * Audience formats:
 *   - "all"              → all registered users
 *   - "role:<RoleName>"  → users with the specified role (e.g. "role:Volunteer")
 *   - "event:<eventId>"  → users who applied to the specified event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const parsed = await parseBody(request, broadcastSchema);
    if (parsed.error) return parsed.error;

    const { subject, body: htmlBody, audience } = parsed.data;

    let recipients: string[] = [];

    if (audience === 'all') {
      const users = await db.select({ email: user.email }).from(user);
      recipients = users.map((u) => u.email);
    } else if (audience.startsWith('role:')) {
      const roleName = audience.substring(5);
      const users = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.role, roleName));
      recipients = users.map((u) => u.email);
    } else if (audience.startsWith('event:')) {
      const eventId = audience.substring(6);
      const apps = await db
        .select({ uid: applications.uid })
        .from(applications)
        .where(eq(applications.subEventId, eventId));

      const userIds = apps.map((a) => a.uid);
      if (userIds.length > 0) {
        const users = await db
          .select({ email: user.email })
          .from(user)
          .where(inArray(user.id, userIds));
        recipients = users.map((u) => u.email);
      }
    } else {
      return errorResponse(
        'Invalid audience format. Use "all", "role:<name>", or "event:<id>".',
        400
      );
    }

    // Deduplicate
    recipients = [...new Set(recipients)];

    if (recipients.length === 0) {
      return errorResponse('No recipients found for the selected audience', 404);
    }

    // ── Send emails (batched internally) ──
    const result = await sendBroadcast(recipients, subject, htmlBody);

    // ── Log as an in-app announcement ──
    const [announcement] = await db
      .insert(announcements)
      .values({
        id: generateId(),
        title: subject,
        body: htmlBody,
        audience,
        priority: 'normal',
        createdAt: Date.now(),
        createdBy: session.user.id,
      })
      .returning();

    return jsonResponse(
      {
        sent: result.sent,
        failed: result.failed,
        totalRecipients: recipients.length,
        announcement,
      },
      201
    );
  } catch (error) {
    console.error('[POST /api/admin/broadcast]', error);
    return errorResponse('Internal server error', 500);
  }
}
