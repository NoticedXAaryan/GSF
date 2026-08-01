import { NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user, desks, events } from '@/lib/schema';
import { assignVolunteerSchema } from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  parseBody,
  requireLead,
  generateId,
} from '@/lib/api-helpers';

const ASSIGNABLE_ROLES = new Set(['Volunteer', 'Lead', 'Admin']);

export async function POST(request: NextRequest) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Lead access required.', 403);
    }

    const parsed = await parseBody(request, assignVolunteerSchema);
    if (parsed.error) return parsed.error;

    const { userId, subEventId } = parsed.data;

    // Verify the user exists and has an assignable role
    const [targetUser] = await db
      .select({ id: user.id, name: user.name, role: user.role })
      .from(user)
      .where(eq(user.id, userId));

    if (!targetUser || !ASSIGNABLE_ROLES.has(targetUser.role)) {
      return errorResponse('User does not have an assignable role', 400);
    }

    // Find or create a desk for this sub-event
    let [desk] = await db
      .select()
      .from(desks)
      .where(eq(desks.subEventId, subEventId));

    if (!desk) {
      // Fetch event details for the desk
      const [event] = await db
        .select({ id: events.id, name: events.name, venue: events.venue })
        .from(events)
        .where(eq(events.id, subEventId));

      if (!event) {
        return errorResponse('Sub-event not found', 404);
      }

      const [newDesk] = await db
        .insert(desks)
        .values({
          id: generateId(),
          subEventId,
          subEventName: event.name,
          venue: event.venue,
          assignedVolunteerUids: [],
        })
        .returning();

      desk = newDesk;
    }

    // Check if user is already assigned
    if (desk.assignedVolunteerUids && desk.assignedVolunteerUids.includes(userId)) {
      return errorResponse('Volunteer is already assigned to that Sub_Event', 409);
    }

    // Add userId to the assignedVolunteerUids array
    const [updatedDesk] = await db
      .update(desks)
      .set({
        assignedVolunteerUids: sql`array_append(${desks.assignedVolunteerUids}, ${userId})`,
      })
      .where(eq(desks.id, desk.id))
      .returning();

    return jsonResponse({ desk: updatedDesk });
  } catch (error) {
    console.error('[POST /api/admin/volunteers]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Lead access required.', 403);
    }

    let body: { userId?: string; subEventId?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    const { userId, subEventId } = body;

    if (!userId || !subEventId) {
      return errorResponse('userId and subEventId are required', 400);
    }

    // Find the desk for this sub-event
    const [desk] = await db
      .select()
      .from(desks)
      .where(eq(desks.subEventId, subEventId));

    if (!desk) {
      return errorResponse('Desk not found for this sub-event', 404);
    }

    // Remove userId from the assignedVolunteerUids array
    const [updatedDesk] = await db
      .update(desks)
      .set({
        assignedVolunteerUids: sql`array_remove(${desks.assignedVolunteerUids}, ${userId})`,
      })
      .where(eq(desks.id, desk.id))
      .returning();

    return jsonResponse({ success: true, desk: updatedDesk });
  } catch (error) {
    console.error('[DELETE /api/admin/volunteers]', error);
    return errorResponse('Internal server error', 500);
  }
}
