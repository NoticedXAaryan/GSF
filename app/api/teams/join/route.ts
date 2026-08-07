import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers } from '@/lib/schema';
import { getSession } from '@/lib/api-helpers';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await req.json();
    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.inviteCode, inviteCode)
    });

    if (!team) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if user is already in the team
    const existingMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, team.id),
        eq(teamMembers.userId, session.user.id)
      )
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Add to team
    await db.insert(teamMembers).values({
      id: crypto.randomUUID(),
      teamId: team.id,
      userId: session.user.id,
      role: 'MEMBER',
      status: 'ACCEPTED'
    });

    return NextResponse.json({ success: true, teamId: team.id });
  } catch (error) {
    console.error('Join team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
