'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { EventForm, type EventFormData } from '@/components/dashboard/EventForm';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface EventItem {
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
  registrationStatus: string;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'published': return 'bg-lime text-void';
    case 'draft': return 'bg-volt text-void';
    case 'archived': return 'bg-panel-alt text-fg-dim';
    default: return 'bg-panel-alt text-fg-dim';
  }
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

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
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
  }, []);

  // Kicked off a tick later so the effect body performs no synchronous state
  // update. `loading` already initialises to true, so this is not observable.
  useEffect(() => {
    const id = window.setTimeout(fetchEvents, 0);
    return () => clearTimeout(id);
  }, [fetchEvents]);

  async function handleCreate(data: EventFormData) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to create event');
        return;
      }
      setShowModal(false);
      fetchEvents();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(data: EventFormData) {
    if (!editingEvent) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to update event');
        return;
      }
      setEditingEvent(null);
      fetchEvents();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Programme desk"
        title="Event Management"
        description="Create, edit, and manage festival sub-events."
        action={<Button onClick={() => setShowModal(true)}>+ New Event</Button>}
      />

      {error && (
        <div className="rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-fg-dim">Loading events…</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-fg-dim py-4">
              No events created yet. Click &quot;+ New Event&quot; to get started.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="animate-tile-in">
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-fg">{event.name}</h3>
                      <Badge className={getStatusBadgeClass(event.status)}>{event.status}</Badge>
                      <Badge className={getTypeBadgeClass(event.type)}>{event.type}</Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-fg-dim line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-fg-dim">
                      <span>Day {event.day} — {event.date}</span>
                      <span>{event.startTime} – {event.endTime}</span>
                      <span>{event.venue}</span>
                      {event.capacity && <span>{event.currentRegistrations}/{event.capacity} registered</span>}
                      {event.coordinatorName && <span>Coordinator: {event.coordinatorName}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {event.type !== 'open' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => router.push(`/dashboard/admin/events/${event.id}/applications`)}
                      >
                        Applications
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingEvent(event)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>Create New Event</ModalHeader>
        <ModalBody>
          <EventForm
            event={null}
            onSubmit={handleCreate}
            onCancel={() => setShowModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingEvent} onClose={() => setEditingEvent(null)}>
        <ModalHeader>Edit Event</ModalHeader>
        <ModalBody>
          {editingEvent && (
            <EventForm
              event={{
                name: editingEvent.name,
                description: editingEvent.description,
                date: editingEvent.date,
                day: editingEvent.day,
                startTime: editingEvent.startTime,
                endTime: editingEvent.endTime,
                venue: editingEvent.venue,
                type: editingEvent.type as "open" | "registration" | "restricted" | "shortlisted",
                capacity: editingEvent.capacity,
                coordinatorName: editingEvent.coordinatorName,
                targetAudience: editingEvent.targetAudience,
                status: editingEvent.status as "draft" | "published" | "archived",
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingEvent(null)}
            />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
