'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Modal } from '@/components/ui/Modal';

interface ScheduleEvent {
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
  registrationStatus: 'open' | 'full' | 'closed';
  targetAudience: string;
  coordinatorName: string;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case 'open': return 'bg-lime text-void';
    case 'registration': return 'bg-azure text-void';
    case 'restricted': return 'bg-volt text-void';
    case 'shortlisted': return 'bg-magenta text-void';
    default: return 'bg-panel-alt text-fg-dim';
  }
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Group events by start time for the timeline view */
function getTimeSlots(events: ScheduleEvent[]): { time: string; events: ScheduleEvent[] }[] {
  const grouped = new Map<string, ScheduleEvent[]>();
  const sorted = [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  for (const event of sorted) {
    const key = event.startTime;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(event);
  }
  return Array.from(grouped.entries()).map(([time, evts]) => ({ time, events: evts }));
}

export default function UserSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [appliedEventIds, setAppliedEventIds] = useState<Set<string>>(new Set());
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyEventId, setApplyEventId] = useState<string | null>(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to load events');
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    async function fetchMyApplications() {
      try {
        const res = await fetch('/api/user/applications');
        if (res.ok) {
          const data = await res.json();
          const ids = new Set<string>(
            (data.applications || []).map((a: { subEventId: string }) => a.subEventId)
          );
          setAppliedEventIds(ids);
        }
      } catch { /* Non-critical */ }
    }
    fetchMyApplications();
  }, []);

  function openApplyModal(eventId: string) {
    setApplyEventId(eventId);
    setApplyNotes('');
    setApplyError(null);
    setApplyResult(null);
    setApplyModalOpen(true);
  }

  async function submitApplication() {
    if (!applyEventId) return;
    if (!applyNotes.trim()) {
      setApplyError('Please provide a reason for applying.');
      return;
    }
    setApplyError(null);
    setApplyingId(applyEventId);
    try {
      const res = await fetch(`/api/events/${applyEventId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: applyNotes.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyResult({ id: applyEventId, message: 'Applied successfully!', success: true });
        setAppliedEventIds((prev) => new Set([...prev, applyEventId]));
        setApplyModalOpen(false);
      } else {
        setApplyError(data.error || 'Failed to apply');
      }
    } catch {
      setApplyError('Network error');
    } finally {
      setApplyingId(null);
    }
  }

  const days = [...new Set(events.map((e) => e.day))].sort((a, b) => a - b);
  const filteredEvents = selectedDay !== null ? events.filter((e) => e.day === selectedDay) : events;
  const timeSlots = getTimeSlots(filteredEvents);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader eyebrow="What's on" title="Schedule" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-bento border border-line bg-panel" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader eyebrow="What's on" title="Schedule" />
        <div className="rounded-bento bg-magenta p-6 text-center text-void">
          <p className="text-sm font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="What's on"
        title="Schedule"
        description="Browse all events and apply to those that require registration."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {days.length > 1 && (
            <>
              <button onClick={() => setSelectedDay(null)} className={`rounded-full px-4 py-2 text-xs font-bold tracking-tight transition-colors ${selectedDay === null ? 'bg-lime text-void' : 'bg-panel-alt text-fg-dim hover:text-fg'}`}>All Days</button>
              {days.map((day) => (
                <button key={day} onClick={() => setSelectedDay(day)} className={`rounded-full px-4 py-2 text-xs font-bold tracking-tight transition-colors ${selectedDay === day ? 'bg-lime text-void' : 'bg-panel-alt text-fg-dim hover:text-fg'}`}>Day {day}</button>
              ))}
            </>
          )}
        </div>
        <div className="flex rounded-full border border-line overflow-hidden">
          <button onClick={() => setViewMode('timeline')} className={`px-4 py-2 text-xs font-bold tracking-tight transition-colors ${viewMode === 'timeline' ? 'bg-lime text-void' : 'bg-panel text-fg-dim hover:text-fg'}`}>Timeline</button>
          <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-xs font-bold tracking-tight transition-colors ${viewMode === 'grid' ? 'bg-lime text-void' : 'bg-panel text-fg-dim hover:text-fg'}`}>Grid</button>
        </div>
      </div>

      {/* Events */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-bento border border-line bg-panel p-10 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-panel-alt">
            <CalendarDays className="h-6 w-6 text-fg-dim" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold tracking-tight">Nothing scheduled</h2>
          <p className="mt-1 text-sm text-fg-dim">No events available{selectedDay !== null ? ` for Day ${selectedDay}` : ''}.</p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* ──── TIMELINE VIEW ──── */
        <div className="space-y-0">
          {timeSlots.map((slot, slotIdx) => (
            <div key={slot.time} className="relative flex gap-4">
              {/* Time column */}
              <div className="flex flex-col items-center w-20 shrink-0 pt-1">
                <span className="text-sm font-bold text-fg whitespace-nowrap">{formatTime(slot.time)}</span>
                <span className="text-[10px] text-fg-dim">{slot.events.length} event{slot.events.length > 1 ? 's' : ''}</span>
              </div>
              {/* Connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="h-3 w-3 rounded-full bg-lime border-2 border-panel mt-1.5" />
                {slotIdx < timeSlots.length - 1 && <div className="w-0.5 flex-1 bg-line min-h-[40px]" />}
              </div>
              {/* Events */}
              <div className="flex-1 pb-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {slot.events.map((event) => (
                    <TimelineCard key={event.id} event={event} appliedEventIds={appliedEventIds} applyingId={applyingId} applyResult={applyResult} onApply={openApplyModal} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ──── GRID VIEW ──── */
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredEvents.map((event, i) => (
            <GridCard key={event.id} event={event} index={i} appliedEventIds={appliedEventIds} applyingId={applyingId} applyResult={applyResult} onApply={openApplyModal} />
          ))}
        </div>
      )}

      {/* Application Modal */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="Event Application">
        <div className="space-y-4 py-4">
          <p className="text-sm text-fg-dim">This event has limited capacity. Please briefly explain why you want to attend.</p>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-fg">Why do you want to apply? *</label>
            <textarea
              id="notes"
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. I am very interested in learning more about..."
            />
            {applyError && <p className="text-xs font-medium text-red-500">{applyError}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setApplyModalOpen(false)} disabled={applyingId !== null}>Cancel</Button>
            <Button onClick={submitApplication} loading={applyingId !== null} disabled={applyingId !== null}>Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ──── Timeline Event Card ──── */
function TimelineCard({ event, appliedEventIds, applyingId, applyResult, onApply }: {
  event: ScheduleEvent;
  appliedEventIds: Set<string>;
  applyingId: string | null;
  applyResult: { id: string; message: string; success: boolean } | null;
  onApply: (id: string) => void;
}) {
  return (
    <article className="flex flex-col justify-between rounded-bento border border-line bg-panel p-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize tracking-tight ${getTypeBadgeClass(event.type)}`}>{event.type}</span>
          {event.registrationStatus === 'full' && <span className="rounded-full bg-panel-alt px-2.5 py-1 text-[11px] font-bold tracking-tight text-fg-dim">Full</span>}
        </div>
        <h3 className="mt-2 text-base font-bold leading-tight tracking-tight">{event.name}</h3>
        {event.description && <p className="mt-1 line-clamp-2 text-xs text-fg-dim">{event.description}</p>}
      </div>
      <div className="mt-3 space-y-1 text-xs font-medium text-fg-dim">
        <p className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" aria-hidden="true" />{formatTime(event.startTime)} – {formatTime(event.endTime)}</p>
        <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />{event.venue}</p>
        {event.capacity && <p className="flex items-center gap-1.5"><Users className="h-3 w-3 shrink-0" aria-hidden="true" />{event.currentRegistrations}/{event.capacity}</p>}
      </div>
      {event.type !== 'open' && event.registrationStatus === 'open' && (
        <div className="mt-3">
          {appliedEventIds.has(event.id) ? (
            <span className="inline-flex w-full items-center justify-center rounded-md bg-panel-alt px-3 py-1.5 text-xs font-semibold text-fg-dim">✓ Applied</span>
          ) : (
            <Button size="sm" className="w-full" onClick={() => onApply(event.id)} loading={applyingId === event.id} disabled={applyingId === event.id}>Apply</Button>
          )}
          {applyResult?.id === event.id && <p className={`mt-1 text-center text-xs font-semibold ${applyResult.success ? 'text-lime' : 'text-magenta'}`} role="status">{applyResult.message}</p>}
        </div>
      )}
    </article>
  );
}

/* ──── Grid Event Card ──── */
function GridCard({ event, index, appliedEventIds, applyingId, applyResult, onApply }: {
  event: ScheduleEvent;
  index: number;
  appliedEventIds: Set<string>;
  applyingId: string | null;
  applyResult: { id: string; message: string; success: boolean } | null;
  onApply: (id: string) => void;
}) {
  return (
    <article className="flex animate-tile-in flex-col justify-between rounded-bento border border-line bg-panel p-5" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize tracking-tight ${getTypeBadgeClass(event.type)}`}>{event.type}</span>
          {event.registrationStatus === 'full' && <span className="rounded-full bg-panel-alt px-2.5 py-1 text-[11px] font-bold tracking-tight text-fg-dim">Full</span>}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-tight tracking-tight">{event.name}</h3>
        {event.description && <p className="mt-1.5 line-clamp-2 text-sm text-fg-dim">{event.description}</p>}
      </div>
      <div className="mt-4 space-y-1.5 text-xs font-medium text-fg-dim">
        <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />Day {event.day} — {event.date}</p>
        <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{formatTime(event.startTime)} – {formatTime(event.endTime)}</p>
        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{event.venue}</p>
        {event.capacity && <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{event.currentRegistrations}/{event.capacity} registered</p>}
      </div>
      {event.type !== 'open' && event.registrationStatus === 'open' && (
        <div className="mt-4">
          {appliedEventIds.has(event.id) ? (
            <span className="inline-flex w-full items-center justify-center rounded-md bg-panel-alt px-4 py-2 text-sm font-semibold text-fg-dim">✓ Applied</span>
          ) : (
            <Button size="sm" className="w-full" onClick={() => onApply(event.id)} loading={applyingId === event.id} disabled={applyingId === event.id}>Apply</Button>
          )}
          {applyResult?.id === event.id && <p className={`mt-2 text-center text-xs font-semibold ${applyResult.success ? 'text-lime' : 'text-magenta'}`} role="status">{applyResult.message}</p>}
        </div>
      )}
    </article>
  );
}
