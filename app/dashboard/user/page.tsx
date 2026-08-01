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
import { PassCard, ApplicationList, AnnouncementFeed } from '@/components/dashboard';
import { RegisterFestivalButton } from './RegisterFestivalButton';

/**
 * Attendee Dashboard — Server Component
 * Fetches user profile, pass, applications, and announcements server-side.
 * Composes with PassCard, ApplicationList, and AnnouncementFeed components.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.5, 9.6
 */
export default async function AttendeeDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch user profile
  const [userProfile] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      collegeDept: user.collegeDept,
      profileComplete: user.profileComplete,
      passId: user.passId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userProfile) {
    redirect('/login');
  }

  // Fetch clearance pass
  const [pass] = await db
    .select({
      passId: clearancePasses.passId,
      qrToken: clearancePasses.qrToken,
      issuedAt: clearancePasses.issuedAt,
    })
    .from(clearancePasses)
    .where(eq(clearancePasses.uid, userId))
    .limit(1);

  // Fetch applications joined with events
  const userApplications = await db
    .select({
      id: applications.id,
      subEventId: applications.subEventId,
      status: applications.status,
      appliedAt: applications.appliedAt,
      eventName: events.name,
      eventDate: events.date,
      eventVenue: events.venue,
      eventType: events.type,
    })
    .from(applications)
    .leftJoin(events, eq(applications.subEventId, events.id))
    .where(eq(applications.uid, userId))
    .orderBy(desc(applications.appliedAt));

  // Fetch announcements targeted at this user
  const userRole = userProfile.role;

  // Get sub-event IDs from accepted applications
  const acceptedAppEventIds = userApplications
    .filter((app) => app.status === 'accepted')
    .map((app) => app.subEventId);

  // Get sub-event IDs where user is assigned as volunteer
  const volunteerDesks = await db
    .select({ subEventId: desks.subEventId })
    .from(desks)
    .where(sql`${userId} = ANY(${desks.assignedVolunteerUids})`);

  const assignedEventIds = volunteerDesks.map((d) => d.subEventId);

  // Combine all sub-event IDs
  const allEventIds = [...new Set([...acceptedAppEventIds, ...assignedEventIds])];

  // Build audience filter
  const audienceConditions = [
    eq(announcements.audience, 'all'),
    eq(announcements.audience, userRole),
  ];

  if (allEventIds.length > 0) {
    audienceConditions.push(inArray(announcements.audience, allEventIds));
  }

  const userAnnouncements = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      priority: announcements.priority,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .where(or(...audienceConditions))
    .orderBy(desc(announcements.createdAt));

  // Determine dashboard state
  const isProfileComplete = userProfile.profileComplete ?? false;
  const hasPass = !!pass;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {userProfile.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your festival dashboard — pass, applications, and announcements.
        </p>
      </div>

      {/* Profile Completion Prompt */}
      {!isProfileComplete && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-medium text-amber-900">
            Complete Your Profile
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            You need to complete your profile before you can register for the
            festival and apply to sub-events.
          </p>
          <Link
            href="/dashboard/user/complete-profile"
            className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Festival Registration Prompt */}
      {isProfileComplete && !hasPass && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-lg font-medium text-blue-900">
            Register for the Festival
          </h2>
          <p className="mt-1 text-sm text-blue-700">
            Your profile is complete. Register now to get your digital pass and
            apply to sub-events.
          </p>
          <RegisterFestivalButton />
        </div>
      )}

      {/* Pass Card */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-3">My Pass</h2>
        <PassCard
          pass={pass ?? null}
          userName={userProfile.name}
          userRole={userProfile.role}
        />
      </section>

      {/* Applications */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          My Applications
        </h2>
        <ApplicationList
          applications={userApplications.map((app) => ({
            id: app.id,
            subEventId: app.subEventId,
            status: app.status as "pending" | "accepted" | "waitlisted" | "rejected",
            appliedAt: app.appliedAt,
            eventName: app.eventName,
            eventDate: app.eventDate,
            eventVenue: app.eventVenue,
            eventType: app.eventType,
          }))}
        />
      </section>

      {/* Announcements */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          Announcements
        </h2>
        <AnnouncementFeed
          announcements={userAnnouncements.map((ann) => ({
            id: ann.id,
            title: ann.title,
            body: ann.body,
            priority: ann.priority,
            createdAt: ann.createdAt,
          }))}
        />
      </section>
    </div>
  );
}
