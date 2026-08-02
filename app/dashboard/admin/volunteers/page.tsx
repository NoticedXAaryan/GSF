'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface EventOption {
  id: string;
  name: string;
}

interface DeskData {
  id: string;
  subEventId: string;
  subEventName: string;
  venue: string;
  assignedVolunteerUids: string[];
}

interface VolunteerUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminVolunteersPage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [volunteers, setVolunteers] = useState<VolunteerUser[]>([]);
  const [assignedUids, setAssignedUids] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign form state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VolunteerUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      setEvents(data.events?.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name })) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(fetchEvents, 0);
    return () => clearTimeout(id);
  }, [fetchEvents]);

  // Fetch volunteers assigned to selected event
  const fetchAssignedVolunteers = useCallback(async () => {
    if (!selectedEventId) {
      setAssignedUids([]);
      setVolunteers([]);
      return;
    }

    try {
      // Fetch users list to get volunteer names
      const res = await fetch(`/api/admin/users?limit=100&search=`);
      if (res.ok) {
        const data = await res.json();
        const allUsers = data.users || [];
        setVolunteers(allUsers.filter((u: VolunteerUser) =>
          ['Volunteer', 'Admin', 'Lead'].includes(u.role)
        ));
      }
    } catch {
      // Non-critical
    }
  }, [selectedEventId]);

  useEffect(() => {
    const id = window.setTimeout(fetchAssignedVolunteers, 0);
    return () => clearTimeout(id);
  }, [fetchAssignedVolunteers]);

  async function searchUsers() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?limit=10&search=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function handleAssign(userId: string) {
    if (!selectedEventId) {
      setError('Please select an event first');
      return;
    }
    setAssigning(userId);
    setError(null);
    try {
      const res = await fetch('/api/admin/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subEventId: selectedEventId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to assign volunteer');
        return;
      }
      setAssignedUids((prev) => [...prev, userId]);
      setSearchResults([]);
      setSearchQuery('');
    } catch {
      setError('Network error');
    } finally {
      setAssigning(null);
    }
  }

  async function handleRemove(userId: string) {
    if (!selectedEventId) return;
    setRemoving(userId);
    setError(null);
    try {
      const res = await fetch('/api/admin/volunteers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subEventId: selectedEventId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to remove volunteer');
        return;
      }
      setAssignedUids((prev) => prev.filter((id) => id !== userId));
    } catch {
      setError('Network error');
    } finally {
      setRemoving(null);
    }
  }

  const eventOptions = [{ value: '', label: 'Select an event…' }, ...events.map((e) => ({ value: e.id, label: e.name }))];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Volunteer Assignment"
        description="Assign volunteers to sub-events for check-in duties."
      />

      {error && (
        <div className="rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Event selector */}
      <div className="max-w-md">
        <Select
          label="Sub-Event"
          options={eventOptions}
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        />
      </div>

      {selectedEventId && (
        <>
          {/* Search & Assign */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-fg mb-3">Assign Volunteer</h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="Search user by name or email"
                    placeholder="Type to search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchUsers(); } }}
                  />
                </div>
                <Button size="sm" onClick={searchUsers} loading={searching}>
                  Search
                </Button>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-tile bg-panel-alt px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-fg truncate">{u.name}</p>
                        <p className="text-xs text-fg-dim">{u.email} · {u.role}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssign(u.id)}
                        loading={assigning === u.id}
                        disabled={assigning === u.id || assignedUids.includes(u.id)}
                      >
                        {assignedUids.includes(u.id) ? 'Assigned' : 'Assign'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Assigned volunteers */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-fg mb-3">
                Currently Assigned
              </h3>
              {assignedUids.length === 0 && volunteers.length === 0 ? (
                <p className="text-sm text-fg-dim">No volunteers assigned to this event yet.</p>
              ) : (
                <p className="text-sm text-fg-dim mb-2">
                  Use the search above to assign volunteers. Use &ldquo;Remove&rdquo; to unassign.
                </p>
              )}
              {volunteers.filter((v) => assignedUids.includes(v.id)).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-tile bg-panel-alt px-3 py-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">{v.name}</p>
                    <p className="text-xs text-fg-dim">{v.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(v.id)}
                    loading={removing === v.id}
                    disabled={removing === v.id}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
