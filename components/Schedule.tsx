'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface SubEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  type: string;
  status: string;
  capacity: number | null;
  currentRegistrations: number;
  coordinatorName: string;
  targetAudience: string;
  registrationStatus?: string;
}

function deriveRegistrationStatus(event: SubEvent): string | null {
  if (event.type !== 'registration' && event.type !== 'shortlisted') {
    return null;
  }
  if (event.status === 'archived') {
    return 'closed';
  }
  if (event.capacity === null) {
    return 'open';
  }
  if (event.currentRegistrations >= event.capacity) {
    return 'full';
  }
  return 'open';
}

function getRegistrationBadgeVariant(status: string): 'accepted' | 'pending' | 'default' {
  switch (status) {
    case 'open':
      return 'accepted'; // green
    case 'full':
      return 'pending'; // yellow
    case 'closed':
      return 'default'; // gray
    default:
      return 'default';
  }
}

function formatEventType(type: string): string {
  switch (type) {
    case 'open':
      return 'Open';
    case 'registration':
      return 'Registration';
    case 'restricted':
      return 'Restricted';
    case 'shortlisted':
      return 'Shortlisted';
    default:
      return type;
  }
}

interface ScheduleProps {
  events: SubEvent[];
}

export default function Schedule({ events }: ScheduleProps) {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);

  const filteredEvents = events
    .filter((event) => event.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <section id="schedule" className="bg-[#0a0a0a] py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Section heading */}
        <h2 className="font-display font-bold text-white text-3xl md:text-4xl lg:text-5xl tracking-tight">
          Programme Schedule
        </h2>
        <p className="mt-4 text-white/60 text-lg leading-relaxed max-w-2xl">
          Two days of innovation, learning, and networking. Toggle between days
          to explore the full programme.
        </p>

        {/* Day toggle buttons */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setActiveDay(1)}
            className={cn(
              'px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 rounded',
              activeDay === 1
                ? 'bg-accent-pink text-white'
                : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/80'
            )}
          >
            Day 1 (2 Sept)
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={cn(
              'px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 rounded',
              activeDay === 2
                ? 'bg-accent-pink text-white'
                : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/80'
            )}
          >
            Day 2 (3 Sept)
          </button>
        </div>

        {/* Events grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEvents.length === 0 && (
            <p className="text-white/40 col-span-full text-center py-12">
              No events scheduled for this day.
            </p>
          )}
          {filteredEvents.map((event) => {
            const regStatus = deriveRegistrationStatus(event);
            return (
              <div
                key={event.id}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-accent-pink/30"
              >
                {/* Header row: time + badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-mono text-xs text-accent-pink">
                    {event.startTime} – {event.endTime}
                  </span>
                  <Badge className="ml-auto">{formatEventType(event.type)}</Badge>
                  {regStatus && (
                    <Badge variant={getRegistrationBadgeVariant(regStatus)}>
                      {regStatus.charAt(0).toUpperCase() + regStatus.slice(1)}
                    </Badge>
                  )}
                </div>

                {/* Event name */}
                <h3 className="text-lg font-bold text-white leading-tight">
                  {event.name}
                </h3>

                {/* Details */}
                <div className="mt-3 space-y-1 text-sm text-white/50">
                  <p>
                    <span className="text-white/30">Venue:</span> {event.venue}
                  </p>
                  <p>
                    <span className="text-white/30">Coordinator:</span>{' '}
                    {event.coordinatorName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
