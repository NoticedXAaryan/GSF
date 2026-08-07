import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { applications, ideaPitchData, reelPitchData, user } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/api-helpers';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { headers } from 'next/headers';
import JuryDashboardClient from './JuryDashboardClient';

export const dynamic = 'force-dynamic';

export default async function JuryDashboardPage({ params }: { params: Promise<{ eventId: string }> }) {
  const session = await getSession(await headers());
  if (!session) redirect('/login');
  if (session.user.role !== 'Admin' && session.user.role !== 'Lead') {
    redirect('/dashboard/user');
  }

  const { eventId } = await params;

  // Let's assume eventId is the slug like 'idea-pitch' or 'reel-pitch'
  // Or we fetch all applications for the given event ID.
  // To keep it robust, we'll fetch idea pitch data and reel pitch data
  // by event ID if we need to, but typically we query applications by subEventId.
  // Actually, we'll just fetch ALL idea pitches if eventId == 'idea-pitch', else reel pitches

  let apps: any[] = [];
  
  if (eventId === 'idea-pitch') {
    apps = await db
      .select({
        id: applications.id,
        userName: applications.userName,
        userEmail: applications.userEmail,
        status: applications.status,
        notes: applications.notes,
        teamName: ideaPitchData.teamName,
        ideaTitle: ideaPitchData.ideaTitle,
        ideaSummary: ideaPitchData.ideaSummary,
        problemSolution: ideaPitchData.problemSolution,
        teamMembers: ideaPitchData.teamMembers,
        pitchDeckUrl: ideaPitchData.pitchDeckUrl,
      })
      .from(applications)
      .innerJoin(ideaPitchData, eq(applications.id, ideaPitchData.applicationId));
  } else if (eventId === 'reel-pitch') {
    apps = await db
      .select({
        id: applications.id,
        userName: applications.userName,
        userEmail: applications.userEmail,
        status: applications.status,
        notes: applications.notes,
        instagramUrl: reelPitchData.instagramUrl,
        teamMembers: reelPitchData.teamMembers,
      })
      .from(applications)
      .innerJoin(reelPitchData, eq(applications.id, reelPitchData.applicationId));
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <PageHeader eyebrow="Jury" title="Evaluation Portal" description={`Evaluate submissions for ${eventId}`} />
      
      {apps.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-fg-dim border border-line rounded-md bg-panel">
          No applications found for this event.
        </div>
      ) : (
        <JuryDashboardClient applications={apps} eventType={eventId} />
      )}
    </div>
  );
}
