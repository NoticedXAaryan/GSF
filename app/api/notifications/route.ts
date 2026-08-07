import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/schema';
import { getSession } from '@/lib/api-helpers';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.uid, session.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 20
    });

    return NextResponse.json(userNotifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (id) {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
    } else {
      // Mark all as read
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.uid, session.user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
