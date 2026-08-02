'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed';
import { PageHeader } from '@/components/dashboard/PageHeader';
import type { AnnouncementPriority } from '@/lib/types';

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: string;
  priority: AnnouncementPriority;
  createdAt: number;
  createdBy: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [priority, setPriority] = useState<string>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) throw new Error('Failed to load announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  // Kicked off a tick later so the effect body performs no synchronous state
  // update. `loading` already initialises to true, so this is not observable.
  useEffect(() => {
    const id = window.setTimeout(fetchAnnouncements, 0);
    return () => clearTimeout(id);
  }, [fetchAnnouncements]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          audience: audience.trim() || 'all',
          priority,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create announcement');
        return;
      }

      // Reset form and refresh
      setTitle('');
      setBody('');
      setAudience('all');
      setPriority('normal');
      setShowForm(false);
      fetchAnnouncements();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete');
        return;
      }
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Network error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Broadcast desk"
        title="Announcements"
        description="Create and manage announcements for attendees, volunteers, and specific events."
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Announcement'}
          </Button>
        }
      />

      {error && (
        <div className="rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-fg">New Announcement</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-4" noValidate>
              <Input
                label="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
                maxLength={200}
              />
              <div>
                <label htmlFor="ann-body" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">
                  Message *
                </label>
                <textarea
                  id="ann-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your announcement…"
                  maxLength={5000}
                  rows={4}
                  className="w-full rounded-tile border border-line bg-panel-alt px-4 py-3 text-sm font-medium text-fg placeholder:text-fg-dim/70 focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="all, Volunteer, event-id…"
                />
                <Select
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
              <Button type="submit" loading={submitting}>
                Publish Announcement
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-fg-dim">Loading announcements…</p>
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-fg-dim py-4">No announcements yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id} className="animate-tile-in">
              <CardBody className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-fg">{ann.title}</h3>
                      <Badge className={
                        ann.priority === 'high' ? 'bg-magenta text-void' :
                        ann.priority === 'normal' ? 'bg-azure text-void' :
                        'bg-panel-alt text-fg-dim'
                      }>
                        {ann.priority}
                      </Badge>
                      <Badge className="bg-panel-alt text-fg-dim">
                        {ann.audience}
                      </Badge>
                    </div>
                    <p className="text-sm text-fg-dim mt-1">{ann.body}</p>
                    <p className="text-xs text-fg-dim mt-1">
                      {new Date(ann.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(ann.id)}
                    loading={deletingId === ann.id}
                    disabled={deletingId === ann.id}
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
