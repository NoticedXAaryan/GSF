'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface ApplicationItem {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  status: string;
  appliedAt: number;
  notes: string | null;
  decidedBy: string | null;
  decidedAt: number | null;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'rejected', label: 'Rejected' },
];

const DECISION_OPTIONS = [
  { value: 'accepted', label: 'Accept' },
  { value: 'waitlisted', label: 'Waitlist' },
  { value: 'rejected', label: 'Reject' },
];

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'accepted': return 'bg-lime text-void';
    case 'pending': return 'bg-volt text-void';
    case 'waitlisted': return 'bg-azure text-void';
    case 'rejected': return 'bg-panel-alt text-fg-dim';
    default: return 'bg-panel-alt text-fg-dim';
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [eventName, setEventName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Decision modal state
  const [decisionModal, setDecisionModal] = useState<{ app: ApplicationItem } | null>(null);
  const [decisionStatus, setDecisionStatus] = useState('accepted');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParam = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/events/${eventId}/applications${filterParam}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load applications');
      }
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [eventId, statusFilter]);

  const fetchEventName = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEventName(data.event?.name || 'Unknown Event');
      }
    } catch {
      // Non-critical
    }
  }, [eventId]);

  useEffect(() => {
    const id = window.setTimeout(fetchEventName, 0);
    return () => clearTimeout(id);
  }, [fetchEventName]);

  useEffect(() => {
    const id = window.setTimeout(fetchApplications, 0);
    return () => clearTimeout(id);
  }, [fetchApplications]);

  function openDecisionModal(app: ApplicationItem) {
    setDecisionModal({ app });
    setDecisionStatus('accepted');
    setDecisionNotes('');
  }

  async function submitDecision() {
    if (!decisionModal) return;
    setDecisionSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/applications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: decisionModal.app.id,
          status: decisionStatus,
          notes: decisionNotes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update application');
        return;
      }

      // Update local state
      setApplications((prev) =>
        prev.map((a) =>
          a.id === decisionModal.app.id ? { ...a, status: decisionStatus } : a
        )
      );
      setDecisionModal(null);
    } catch {
      setError('Network error');
    } finally {
      setDecisionSubmitting(false);
    }
  }

  async function quickDecision(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/applications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status, notes: '' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update');
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
    } catch {
      setError('Network error');
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eventName || 'Event'}
        title="Review Applications"
        description={`${applications.length} total · ${pendingCount} pending · ${acceptedCount} accepted`}
        action={
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/admin/events')}>
            ← Back to Events
          </Button>
        }
      />

      {/* Status Filter */}
      <div className="flex gap-3 items-end flex-wrap">
        <div className="w-48">
          <Select
            label="Filter by status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <Button size="sm" variant="secondary" onClick={fetchApplications}>
          Refresh
        </Button>
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
      ) : applications.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-fg-dim py-8">
              No applications found{statusFilter ? ` with status "${statusFilter}"` : ''}.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="animate-tile-in">
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-fg">{app.userName}</h3>
                      <Badge className={getStatusBadgeClass(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-fg-dim">{app.userEmail}</p>
                    {app.notes && (
                      <p className="mt-1 text-sm text-fg-dim italic">
                        &ldquo;{app.notes}&rdquo;
                      </p>
                    )}
                    <p className="mt-1 text-xs text-fg-dim">
                      Applied: {formatDate(app.appliedAt)}
                      {app.decidedAt && ` · Decided: ${formatDate(app.decidedAt)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => quickDecision(app.id, 'accepted')}
                          loading={updatingId === app.id}
                          disabled={updatingId === app.id}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => quickDecision(app.id, 'rejected')}
                          loading={updatingId === app.id}
                          disabled={updatingId === app.id}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openDecisionModal(app)}
                        >
                          Review
                        </Button>
                      </>
                    )}
                    {app.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openDecisionModal(app)}
                      >
                        Change Status
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        open={!!decisionModal}
        onClose={() => setDecisionModal(null)}
        title="Update Application"
      >
        {decisionModal && (
          <div className="space-y-4">
            <div className="rounded-tile bg-panel-alt p-3">
              <p className="text-sm font-semibold text-fg">{decisionModal.app.userName}</p>
              <p className="text-xs text-fg-dim">{decisionModal.app.userEmail}</p>
              {decisionModal.app.notes && (
                <p className="mt-2 text-sm text-fg-dim italic">&ldquo;{decisionModal.app.notes}&rdquo;</p>
              )}
            </div>

            <Select
              label="Decision"
              options={DECISION_OPTIONS}
              value={decisionStatus}
              onChange={(e) => setDecisionStatus(e.target.value)}
            />

            <div>
              <label htmlFor="decision-notes" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">
                Notes (optional)
              </label>
              <textarea
                id="decision-notes"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Optional note to the applicant…"
                maxLength={1000}
                rows={3}
                className="w-full rounded-tile border border-line bg-panel-alt px-4 py-3 text-sm font-medium text-fg placeholder:text-fg-dim/70 focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setDecisionModal(null)} disabled={decisionSubmitting}>
                Cancel
              </Button>
              <Button onClick={submitDecision} loading={decisionSubmitting}>
                Submit Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
