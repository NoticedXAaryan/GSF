import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrationDrafts } from '@/lib/schema';
import { getSession } from '@/lib/api-helpers';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function PUT(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await req.json();

    const now = Date.now();

    // Upsert draft
    const existingDraft = await db.query.registrationDrafts.findFirst({
      where: and(
        eq(registrationDrafts.uid, session.user.id),
        eq(registrationDrafts.eventId, eventId)
      )
    });

    if (existingDraft) {
      await db.update(registrationDrafts)
        .set({
          data: body,
          updatedAt: now,
        })
        .where(eq(registrationDrafts.id, existingDraft.id));
    } else {
      await db.insert(registrationDrafts).values({
        id: crypto.randomUUID(),
        uid: session.user.id,
        eventId,
        data: body,
        updatedAt: now,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;

    const draft = await db.query.registrationDrafts.findFirst({
      where: and(
        eq(registrationDrafts.uid, session.user.id),
        eq(registrationDrafts.eventId, eventId)
      )
    });

    if (!draft) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: draft.data });
  } catch (error) {
    console.error('Get draft error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
