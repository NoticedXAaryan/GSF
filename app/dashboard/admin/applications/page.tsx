'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface QueueItem {
  id: string;
  uid: string;
  subEventId: string;
  userName: string;
  userEmail: string;
  status: string;
  notes: string | null;
  appliedAt: number;
  decidedAt: number | null;
  eventName: string | null;
  eventDate: string | null;
  eventDay: number | null;
  eventVenue: string | null;
  eventCapacity: number | null;
  eventRegistrations: number | null;
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
] as const;

const DECISION_OPTIONS = [
  { value: 'accepted', label: 'Accept' },
  { value: 'waitlisted', label: 'Waitlist' },
  { value: 'rejected', label: 'Reject' },
];

function statusClass(status: string): string {
  switch (status) {
    case 'accepted': return 'bg-lime text-void';
    case 'pending': return 'bg-volt text-void';
    case 'waitlisted': return 'bg-azure text-void';
    case 'rejected': return 'bg-panel-alt text-fg-dim';
    default: return 'bg-panel-alt text-fg-dim';
  }
}

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminApplicationQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Review modal
  const [reviewing, setReviewing] = useState<QueueItem | null>(null);
  const [decision, setDecision] = useState('accepted');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications?status=${status}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load applications');
      }
      const data = await res.json();
      setItems(data.applications || []);
      setCounts(data.counts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const id = window.setTimeout(fetchQueue, 0);
    return () => clearTimeout(id);
  }, [fetchQueue]);

  /** Decisions are written through the per-event endpoint that owns the emails. */
  async function decide(app: QueueItem, newStatus: string, notes = '') {
    setBusyId(app.id);
    setError(null);
    try {
      const res = await fetch(`/api/events/${app.subEventId}/applications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id, status: newStatus, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update application');
        return false;
      }
      // Drop it from the list when it no longer matches the active filter
      if (status !== 'all' && newStatus !== status) {
        setItems((prev) => prev.filter((a) => a.id !== app.id));
      } else {
        setItems((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
        );
      }
      setCounts((prev) => ({
        ...prev,
        [app.status]: Math.max(0, (prev[app.status] ?? 0) - 1),
        [newStatus]: (prev[newStatus] ?? 0) + 1,
      }));
      return true;
    } catch {
      setError('Network error');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview() {
    if (!reviewing) return;
    setSubmitting(true);
    const ok = await decide(reviewing, decision, decisionNotes.trim());
    setSubmitting(false);
    if (ok) setReviewing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review desk"
        title="Applications"
        description="Accept, waitlist, or reject applicants across every event from one place."
        action={
          <Button size="sm" variant="secondary" onClick={fetchQueue}>
            Refresh
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          const n = tab.value === 'all' ? undefined : counts[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`rounded-full px-4 py-2 text-xs font-bold tracking-tight transition-colors ${
                active ? 'bg-primary text-surface' : 'bg-panel-alt text-fg-dim hover:text-fg'
              }`}
            >
              {tab.label}
              {n !== undefined && n > 0 && (
                <span className={active ? 'ml-1.5 opacity-80' : 'ml-1.5 opacity-70'}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-fg-dim">Loading applications…</p>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardBody>
            <p className="py-8 text-center text-fg-dim">
              {status === 'pending'
                ? 'Nothing waiting on you. New applications to approval-gated events land here.'
                : `No ${status} applications.`}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((app) => (
            <Card key={app.id} className="animate-tile-in">
              <CardBody>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-fg">{app.userName}</h3>
                      <Badge className={statusClass(app.status)}>{app.status}</Badge>
                    </div>
                    <p className="text-sm text-fg-dim">{app.userEmail}</p>

                    <p className="mt-1.5 text-sm font-medium text-fg">
                      {app.eventName ?? 'Unknown event'}
                      {app.eventDay ? (
                        <span className="text-fg-dim"> · Day {app.eventDay}</span>
                      ) : null}
                      {app.eventCapacity ? (
                        <span className="text-fg-dim">
                          {' '}· {app.eventRegistrations ?? 0}/{app.eventCapacity} seats
                        </span>
                      ) : null}
                    </p>

                    {app.notes && (
                      <p className="mt-1.5 text-sm italic text-fg-dim">
                        &ldquo;{app.notes}&rdquo;
                      </p>
                    )}
                    <p className="mt-1 text-xs text-fg-dim">Applied {fmt(app.appliedAt)}</p>
                  </div>

                  <div className="flex flex-shrink-0 flex-wrap gap-2">
                    {app.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => decide(app, 'accepted')}
                          loading={busyId === app.id}
                          disabled={busyId === app.id}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => decide(app, 'rejected')}
                          loading={busyId === app.id}
                          disabled={busyId === app.id}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setReviewing(app);
                        setDecision(app.status === 'pending' ? 'accepted' : app.status);
                        setDecisionNotes('');
                      }}
                    >
                      {app.status === 'pending' ? 'Review' : 'Change'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Review modal — decision + note that goes out in the email */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title="Update Application"
      >
        {reviewing && (
          <div className="space-y-4">
            <div className="rounded-tile bg-panel-alt p-3">
              <p className="text-sm font-semibold text-fg">{reviewing.userName}</p>
              <p className="text-xs text-fg-dim">{reviewing.userEmail}</p>
              <p className="mt-2 text-xs font-medium text-fg">
                {reviewing.eventName ?? 'Unknown event'}
              </p>
              {reviewing.notes && (
                <p className="mt-2 text-sm italic text-fg-dim">
                  &ldquo;{reviewing.notes}&rdquo;
                </p>
              )}
            </div>

            <Select
              label="Decision"
              options={DECISION_OPTIONS}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />

            <div>
              <label
                htmlFor="queue-notes"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim"
              >
                Note to applicant (optional)
              </label>
              <textarea
                id="queue-notes"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Included in the status email…"
                maxLength={1000}
                rows={3}
                className="w-full rounded-tile border border-line bg-panel-alt px-4 py-3 text-sm font-medium text-fg placeholder:text-fg-dim/70 transition-colors focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setReviewing(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={submitReview} loading={submitting}>
                Save Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
