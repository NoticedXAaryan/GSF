import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Schedule from '@/components/Schedule';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

/**
 * Derive registration status for an event:
 * - "closed" if the event is archived
 * - "open" if no capacity limit or currentRegistrations < capacity
 * - "full" if currentRegistrations >= capacity
 */
function deriveRegistrationStatus(event: {
  status: string;
  capacity: number | null;
  currentRegistrations: number | null;
}): 'open' | 'full' | 'closed' {
  if (event.status === 'archived') return 'closed';
  if (!event.capacity) return 'open';
  const current = event.currentRegistrations ?? 0;
  return current >= event.capacity ? 'full' : 'open';
}

export default async function Page() {
  // Fetch published events ordered by day, startTime (server-side)
  const publishedEvents = await db
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      date: events.date,
      day: events.day,
      startTime: events.startTime,
      endTime: events.endTime,
      venue: events.venue,
      type: events.type,
      status: events.status,
      capacity: events.capacity,
      currentRegistrations: events.currentRegistrations,
      coordinatorName: events.coordinatorName,
      targetAudience: events.targetAudience,
    })
    .from(events)
    .where(eq(events.status, 'published'))
    .orderBy(asc(events.day), asc(events.startTime));

  // Derive registrationStatus for each event
  const eventsWithStatus = publishedEvents.map((event) => ({
    ...event,
    description: event.description ?? '',
    currentRegistrations: event.currentRegistrations ?? 0,
    coordinatorName: event.coordinatorName ?? '',
    targetAudience: event.targetAudience ?? 'all',
    registrationStatus: deriveRegistrationStatus(event),
  }));

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Schedule events={eventsWithStatus} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
