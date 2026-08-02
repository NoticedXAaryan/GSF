'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface UserItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  phone: string;
  collegeDept: string;
  year: string;
  organization: string;
  passId: string;
  profileComplete: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'Attendee', label: 'Attendee' },
  { value: 'Volunteer', label: 'Volunteer' },
  { value: 'Faculty', label: 'Faculty' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Lead', label: 'Lead' },
];

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'Admin': return 'bg-magenta text-void';
    case 'Lead': return 'bg-magenta text-void';
    case 'Volunteer': return 'bg-azure text-void';
    case 'Faculty': return 'bg-volt text-void';
    default: return 'bg-panel-alt text-fg-dim';
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [offset, search]);

  // Kicked off a tick later so the effect body performs no synchronous state
  // update. `loading` already initialises to true, so this is not observable.
  useEffect(() => {
    const id = window.setTimeout(fetchUsers, 0);
    return () => clearTimeout(id);
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingRole(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update role');
        return;
      }
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      setError('Network error');
    } finally {
      setUpdatingRole(null);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    fetchUsers();
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform admin"
        title="User Management"
        description={`View, search, and manage user roles. (${total} total users)`}
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>

      {error && (
        <div className="rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-fg-dim">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-fg-dim py-4">No users found.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* User Cards */}
          <div className="space-y-3">
            {users.map((u) => (
              <Card key={u.id} className="animate-tile-in">
                <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-fg truncate">{u.name}</h3>
                      <Badge className={getRoleBadgeClass(u.role)}>{u.role}</Badge>
                      {u.profileComplete && (
                        <Badge className="bg-lime text-void">Profile Complete</Badge>
                      )}
                      {u.passId && (
                        <Badge className="bg-azure text-void">Pass: {u.passId}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-fg-dim truncate">{u.email}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-fg-dim">
                      {u.phone && <span>📱 {u.phone}</span>}
                      {u.collegeDept && <span>🏫 {u.collegeDept}</span>}
                      <span>Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <Select
                      label=""
                      options={ROLE_OPTIONS}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingRole === u.id}
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-fg-dim">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
