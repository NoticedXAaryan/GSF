"use client";

import { useState } from "react";
import {
  selectScheduleDay,
  projectEventCard,
  type ScheduleEvent,
  type EventDay,
} from "@/lib/landing/schedule";
import { EventCard } from "./EventCard";

interface ScheduleExplorerProps {
  events: ScheduleEvent[];
}

export function ScheduleExplorer({ events }: ScheduleExplorerProps) {
  const [activeDay, setActiveDay] = useState<EventDay>(1);

  const dayEvents = selectScheduleDay(events, activeDay);
  const cards = dayEvents.map(projectEventCard);

  return (
    <div>
      {/* Day toggle controls */}
      <div className="flex gap-3" role="group" aria-label="Schedule day selector">
        <button
          type="button"
          onClick={() => setActiveDay(1)}
          aria-pressed={activeDay === 1}
          className={`rounded-pill px-6 py-2 text-sm font-semibold transition-colors ${
            activeDay === 1
              ? "bg-primary text-surface"
              : "bg-surface-alt text-ink-muted hover:bg-surface-alt/80"
          }`}
        >
          Day 1 (2 Sept)
        </button>
        <button
          type="button"
          onClick={() => setActiveDay(2)}
          aria-pressed={activeDay === 2}
          className={`rounded-pill px-6 py-2 text-sm font-semibold transition-colors ${
            activeDay === 2
              ? "bg-primary text-surface"
              : "bg-surface-alt text-ink-muted hover:bg-surface-alt/80"
          }`}
        >
          Day 2 (3 Sept)
        </button>
      </div>

      {/* Event cards grid */}
      {cards.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">
          No events scheduled for this day.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2">
          {cards.map((card) => (
            <EventCard key={card.id} event={card} />
          ))}
        </div>
      )}
    </div>
  );
}
