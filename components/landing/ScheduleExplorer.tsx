"use client";

import { useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import {
  selectScheduleDay,
  type ScheduleEvent,
  type EventDay,
} from "@/lib/landing/schedule";

interface ScheduleExplorerProps {
  events: ScheduleEvent[];
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getTypeBadge(type: string): { bg: string; label: string } {
  switch (type) {
    case "open": return { bg: "bg-[#c3f53c] text-[#0a0a0b]", label: "Open" };
    case "registration": return { bg: "bg-[#3b7bff] text-white", label: "Registration" };
    case "shortlisted": return { bg: "bg-[#ff4d96] text-white", label: "Shortlisted" };
    case "restricted": return { bg: "bg-[#f0ff42] text-[#0a0a0b]", label: "Restricted" };
    default: return { bg: "bg-white/10 text-white/60", label: type };
  }
}

export function ScheduleExplorer({ events }: ScheduleExplorerProps) {
  const [activeDay, setActiveDay] = useState<EventDay>(1);

  const dayEvents = selectScheduleDay(events, activeDay);

  // Group by time slot
  const timeSlots = groupByTime(dayEvents);

  return (
    <div>
      {/* Day toggle */}
      <div className="flex gap-3" role="group" aria-label="Schedule day selector">
        <button
          type="button"
          onClick={() => setActiveDay(1)}
          aria-pressed={activeDay === 1}
          className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
            activeDay === 1
              ? "bg-accent text-[#0a0a0b]"
              : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          Day 1 — 2 Sept
        </button>
        <button
          type="button"
          onClick={() => setActiveDay(2)}
          aria-pressed={activeDay === 2}
          className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
            activeDay === 2
              ? "bg-accent text-[#0a0a0b]"
              : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          Day 2 — 3 Sept
        </button>
      </div>

      {/* Timeline */}
      {dayEvents.length === 0 ? (
        <p className="mt-12 text-center text-white/50">
          No events scheduled for this day yet.
        </p>
      ) : (
        <div className="mt-10 space-y-0">
          {timeSlots.map((slot, idx) => (
            <div key={slot.time} className="relative flex gap-3 tablet:gap-5">
              {/* Time */}
              <div className="flex flex-col items-center w-16 tablet:w-24 shrink-0 pt-1">
                <span className="text-xs tablet:text-sm font-bold text-white whitespace-nowrap">
                  {formatTime(slot.time)}
                </span>
              </div>
              {/* Connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="h-3 w-3 rounded-full bg-accent border-2 border-[#0d0d0f] mt-1.5" />
                {idx < timeSlots.length - 1 && (
                  <div className="w-0.5 flex-1 bg-white/10 min-h-[40px]" />
                )}
              </div>
              {/* Cards */}
              <div className="flex-1 pb-6 min-w-0">
                <div className="grid gap-3 grid-cols-1 tablet:grid-cols-2">
                  {slot.events.map((event) => {
                    const badge = getTypeBadge(event.type);
                    return (
                      <article
                        key={event.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 tablet:p-5 transition-all hover:border-accent/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h4 className="mt-3 text-base font-bold text-white leading-tight">
                          {event.name}
                        </h4>
                        <div className="mt-3 space-y-1 text-xs text-white/50">
                          <p className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {formatTime(event.startTime)} – {formatTime(event.endTime)}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {event.venue}
                          </p>
                          {event.capacity && (
                            <p className="flex items-center gap-1.5">
                              <Users className="h-3 w-3" aria-hidden="true" />
                              {event.registrationStatus === "full"
                                ? "Full"
                                : `${event.currentRegistrations}/${event.capacity}`}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByTime(
  events: ScheduleEvent[]
): { time: string; events: ScheduleEvent[] }[] {
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const map = new Map<string, ScheduleEvent[]>();
  for (const e of sorted) {
    if (!map.has(e.startTime)) map.set(e.startTime, []);
    map.get(e.startTime)!.push(e);
  }
  return Array.from(map.entries()).map(([time, evts]) => ({ time, events: evts }));
}
