import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers } from '@/lib/schema';
import { getSession } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

function generateRandomCode(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamName } = await req.json();
    if (!teamName) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Create team and team leader in a transaction
    const inviteCode = generateRandomCode(8);
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      const [team] = await tx.insert(teams).values({
        id: crypto.randomUUID(),
        name: teamName,
        teamLeaderId: session.user.id,
        inviteCode,
        createdAt: now,
      }).returning();

      await tx.insert(teamMembers).values({
        id: crypto.randomUUID(),
        teamId: team.id,
        userId: session.user.id,
        role: 'LEADER',
        status: 'ACCEPTED',
      });

      return team;
    });

    return NextResponse.json({ teamId: result.id, inviteCode: result.inviteCode });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all teams this user is a part of
    const userTeams = await db.query.teamMembers.findMany({
      where: eq(teamMembers.userId, session.user.id),
      with: {
        team: true
      }
    });

    return NextResponse.json(userTeams);
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
