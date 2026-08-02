import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc, or, inArray, sql } from 'drizzle-orm';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  user,
  clearancePasses,
  applications,
  events,
  announcements,
  desks,
} from '@/lib/schema';
import {
  BentoCard,
  Eyebrow,
  Metric,
  ProgressBar,
  Hairline,
  IconChip,
  Chip,
  MiniBars,
} from '@/components/ui/bento';
import { RegisterFestivalButton } from './RegisterFestivalButton';
import {
  Ticket,
  FileText,
  Calendar,
  Megaphone,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

/**
 * Attendee dashboard home — bento layout.
 *
 * Structure mirrors the design language: oversized greeting, an onboarding
 * progress strip, then a grid of discrete accent-filled blocks each carrying a
 * single idea (pass, applications, schedule, announcements).
 */
export default async function AttendeeDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [
    userProfileResult,
    passResult,
    userApplications,
    publishedEventsResult,
    volunteerDesks,
  ] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        role: user.role,
        profileComplete: user.profileComplete,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
      
    db
      .select({ passId: clearancePasses.passId })
      .from(clearancePasses)
      .where(eq(clearancePasses.uid, userId))
      .limit(1),
      
    db
      .select({
        status: applications.status,
        subEventId: applications.subEventId,
        eventName: events.name,
        eventDate: events.date,
      })
      .from(applications)
      .leftJoin(events, eq(applications.subEventId, events.id))
      .where(eq(applications.uid, userId))
      .orderBy(desc(applications.appliedAt)),
      
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(eq(events.status, 'published')),
      
    db
      .select({ subEventId: desks.subEventId })
      .from(desks)
      .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`),
  ]);

  const userProfile = userProfileResult[0];
  if (!userProfile) redirect('/login');

  const pass = passResult[0];
  const publishedEvents = publishedEventsResult[0]?.count ?? 0;

  const totalApplications = userApplications.length;
  const acceptedApplications = userApplications.filter((a) => a.status === 'accepted').length;
  const pendingApplications = userApplications.filter((a) => a.status === 'pending').length;

  // Announcements targeted at this viewer
  const acceptedEventIds = userApplications
    .filter((a) => a.status === 'accepted')
    .map((a) => a.subEventId);

  const allEventIds = [
    ...new Set([...acceptedEventIds, ...volunteerDesks.map((d) => d.subEventId)]),
  ];

  const audienceConditions = [
    eq(announcements.audience, 'all'),
    eq(announcements.audience, userProfile.role),
  ];
  if (allEventIds.length > 0) {
    audienceConditions.push(inArray(announcements.audience, allEventIds));
  }

  const recentAnnouncements = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      priority: announcements.priority,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .where(or(...audienceConditions))
    .orderBy(desc(announcements.createdAt))
    .limit(3);

  const isProfileComplete = userProfile.profileComplete ?? false;
  const hasPass = !!pass;
  const hasApplied = totalApplications > 0;

  // Onboarding completion across three checkpoints
  const steps = [
    { label: 'Profile', done: isProfileComplete },
    { label: 'Registered', done: hasPass },
    { label: 'Applied', done: hasApplied },
  ];
  const completed = steps.filter((s) => s.done).length;
  const completion = Math.round((completed / steps.length) * 100);

  const firstName = userProfile.name.split(' ')[0];
  const nextEvent = userApplications.find((a) => a.status === 'accepted' && a.eventName);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------- Greeting ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-1 pt-1">
        <div>
          <Eyebrow>Your festival</Eyebrow>
          <h1 className="mt-1 text-4xl font-bold leading-none tracking-tighter lg:text-5xl">
            Hi, {firstName}
          </h1>
        </div>
        <Chip>{userProfile.role}</Chip>
      </div>

      {/* ---------- Onboarding progress ---------- */}
      <BentoCard index={0}>
        <div className="flex items-baseline justify-between">
          <Eyebrow>Setup progress</Eyebrow>
          <Metric className="text-2xl">{completion}%</Metric>
        </div>
        <ProgressBar value={completion} className="mt-3" label="Festival setup progress" />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {steps.map((s) => (
            <span
              key={s.label}
              className={cnStep(s.done)}
            >
              <CheckCircle2
                className={`h-3.5 w-3.5 ${s.done ? 'text-primary' : 'text-fg-dim/40'}`}
                aria-hidden="true"
              />
              {s.label}
            </span>
          ))}
        </div>
      </BentoCard>

      {/* ---------- Action prompts ---------- */}
      {!isProfileComplete && (
        <BentoCard tone="volt" index={1}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Eyebrow tone="volt">Action needed</Eyebrow>
              <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight">
                Complete your profile
              </h2>
              <p className="mt-1 max-w-md text-sm text-surface/90">
                Add your details to unlock festival registration and sub-event
                applications.
              </p>
            </div>
            <IconChip tone="volt">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>
          <Link
            href="/dashboard/user/complete-profile"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-bold tracking-tight text-secondary transition-opacity hover:opacity-90"
          >
            Complete profile
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </BentoCard>
      )}

      {isProfileComplete && !hasPass && (
        <BentoCard tone="lime" index={1}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Eyebrow tone="lime">One step left</Eyebrow>
              <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight">
                Register for the festival
              </h2>
              <p className="mt-1 max-w-md text-sm text-surface/90">
                Claim your digital pass and start applying to sub-events.
              </p>
            </div>
            <IconChip tone="lime">
              <Ticket className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>
          <div className="mt-4">
            <RegisterFestivalButton />
          </div>
        </BentoCard>
      )}

      {/* ---------- Bento grid ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Pass — wide feature tile */}
        <BentoCard
          tone={hasPass ? 'lime' : 'panel'}
          className="col-span-2 flex flex-col justify-between"
          index={2}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow tone={hasPass ? 'lime' : 'panel'}>Festival pass</Eyebrow>
              <Metric className="mt-2">{hasPass ? pass.passId : 'Not issued'}</Metric>
            </div>
            <IconChip tone={hasPass ? 'lime' : 'panel'}>
              <Ticket className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>
          <Hairline tone={hasPass ? 'lime' : 'panel'} className="my-4" />
          {hasPass ? (
            <Link
              href="/dashboard/user/pass"
              className="inline-flex items-center gap-2 self-start rounded-full bg-surface px-4 py-2 text-xs font-bold tracking-tight text-primary transition-opacity hover:opacity-90"
            >
              Show QR
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <p className="text-sm text-fg-dim">
              Register for the festival to get your pass.
            </p>
          )}
        </BentoCard>

        {/* Applications */}
        <BentoCard tone="magenta" className="flex flex-col justify-between" index={3}>
          <div className="flex items-start justify-between gap-2">
            <Eyebrow tone="magenta">Applications</Eyebrow>
            <IconChip tone="magenta">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>
          <Metric className="mt-4 text-4xl">{totalApplications}</Metric>
          <div className="mt-3 space-y-1 text-xs font-semibold text-surface/90">
            <p>{acceptedApplications} accepted</p>
            <p>{pendingApplications} pending</p>
          </div>
          <Link
            href="/dashboard/user/applications"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-tight text-surface"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </BentoCard>

        {/* Schedule */}
        <BentoCard tone="azure" className="flex flex-col justify-between" index={4}>
          <div className="flex items-start justify-between gap-2">
            <Eyebrow tone="azure">Events live</Eyebrow>
            <IconChip tone="azure">
              <Calendar className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>
          <Metric className="mt-4 text-4xl">{publishedEvents}</Metric>
          <MiniBars
            tone="azure"
            data={[4, 7, 5, 9, 6, 8, 10]}
            className="mt-3"
          />
          <Link
            href="/dashboard/user/schedule"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-tight text-surface"
          >
            Browse
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </BentoCard>

        {/* Next accepted event */}
        <BentoCard tone="panel" className="col-span-2 flex flex-col justify-between" index={5}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Eyebrow>Next up for you</Eyebrow>
              {nextEvent ? (
                <>
                  <h3 className="mt-2 truncate text-xl font-bold tracking-tight">
                    {nextEvent.eventName}
                  </h3>
                  {nextEvent.eventDate && (
                    <p className="mt-1 text-sm text-fg-dim">{nextEvent.eventDate}</p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-fg-dim">
                  No accepted sub-events yet. Apply from the schedule to reserve
                  your spot.
                </p>
              )}
            </div>
            <IconChip>
              <Calendar className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>
          {nextEvent && <Chip tone="panel" className="mt-4 self-start">Accepted</Chip>}
        </BentoCard>

        {/* Announcements */}
        <BentoCard tone="inverse" className="col-span-2 flex flex-col justify-between" index={6}>
          <div className="flex items-start justify-between gap-3">
            <Eyebrow tone="inverse">
              Announcements ({recentAnnouncements.length})
            </Eyebrow>
            <IconChip tone="inverse">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
            </IconChip>
          </div>

          {recentAnnouncements.length === 0 ? (
            <p className="mt-4 text-sm text-on-inverse/60">Nothing new right now.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {recentAnnouncements.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      a.priority === 'high'
                        ? 'bg-primary-strong'
                        : a.priority === 'normal'
                          ? 'bg-primary'
                          : 'bg-on-inverse/40'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium">{a.title}</span>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/dashboard/user/announcements"
            className="mt-5 inline-flex items-center justify-between rounded-full bg-on-inverse/10 px-4 py-2.5 text-xs font-bold tracking-tight transition-colors hover:bg-on-inverse/15"
          >
            Open announcements
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </BentoCard>
      </div>
    </div>
  );
}

/** Step chip class helper — keeps the JSX above readable. */
function cnStep(done: boolean): string {
  return [
    'inline-flex items-center gap-1.5 text-xs font-semibold tracking-tight',
    done ? 'text-fg' : 'text-fg-dim',
  ].join(' ');
}
