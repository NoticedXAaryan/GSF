'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Shield, ShieldAlert, ShieldBan, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

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
  enrollmentNumber: string;
  universityId: string;
  accountStatus: string;
  adminNotes: string;
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

function getStatusBadge(status: string) {
  switch (status) {
    case 'banned':
      return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">🚫 Banned</Badge>;
    case 'flagged':
      return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">⚠️ Flagged</Badge>;
    default:
      return null; // Don't show anything for 'active' — it's the default
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

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

  async function handleStatusChange(userId: string, newStatus: string, notes: string) {
    setUpdatingStatus(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accountStatus: newStatus, adminNotes: notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update status');
        return;
      }
      const data = await res.json();
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? {
          ...u,
          accountStatus: data.user.accountStatus,
          adminNotes: data.user.adminNotes,
          profileComplete: data.user.profileComplete,
        } : u))
      );
      setExpandedUser(null);
      setAdminNotesInput('');
    } catch {
      setError('Network error');
    } finally {
      setUpdatingStatus(null);
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
        description={`View, search, and manage user roles and restrictions. (${total} total users)`}
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
              <Card
                key={u.id}
                className={`animate-tile-in ${
                  u.accountStatus === 'banned' ? 'border-red-500/30 bg-red-500/5' :
                  u.accountStatus === 'flagged' ? 'border-amber-500/30 bg-amber-500/5' : ''
                }`}
              >
                <CardBody className="space-y-3">
                  {/* Main row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-fg truncate">{u.name}</h3>
                        <Badge className={getRoleBadgeClass(u.role)}>{u.role}</Badge>
                        {getStatusBadge(u.accountStatus)}
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
                        {u.organization && <span>🏫 {u.organization}</span>}
                        {u.collegeDept && <span>📚 {u.collegeDept}</span>}
                        {u.enrollmentNumber && <span>🎓 {u.enrollmentNumber}</span>}
                        {u.universityId && <span>🆔 {u.universityId}</span>}
                        <span>Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {/* Show admin notes if any */}
                      {u.adminNotes && (
                        <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-1 inline-block">
                          <AlertTriangle className="inline w-3 h-3 mr-1" />
                          Admin note: {u.adminNotes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Role selector */}
                      <div className="w-32">
                        <Select
                          label=""
                          options={ROLE_OPTIONS}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={updatingRole === u.id}
                        />
                      </div>
                      {/* Expand/collapse for actions */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (expandedUser === u.id) {
                            setExpandedUser(null);
                          } else {
                            setExpandedUser(u.id);
                            setAdminNotesInput(u.adminNotes || '');
                          }
                        }}
                      >
                        {expandedUser === u.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded action panel */}
                  {expandedUser === u.id && (
                    <div className="border-t border-border pt-3 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-fg-dim block mb-1">Admin Notes</label>
                        <Input
                          placeholder="Reason for flag/ban (visible to admins only)…"
                          value={adminNotesInput}
                          onChange={(e) => setAdminNotesInput(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {u.accountStatus !== 'active' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-green-400 hover:bg-green-500/10"
                            loading={updatingStatus === u.id}
                            onClick={() => handleStatusChange(u.id, 'active', adminNotesInput)}
                          >
                            <Shield className="w-4 h-4 mr-1" /> Restore to Active
                          </Button>
                        )}
                        {u.accountStatus !== 'flagged' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-amber-400 hover:bg-amber-500/10"
                            loading={updatingStatus === u.id}
                            onClick={() => handleStatusChange(u.id, 'flagged', adminNotesInput)}
                          >
                            <ShieldAlert className="w-4 h-4 mr-1" /> Flag (Force Re-verify)
                          </Button>
                        )}
                        {u.accountStatus !== 'banned' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-red-400 hover:bg-red-500/10"
                            loading={updatingStatus === u.id}
                            onClick={() => {
                              if (confirm(`Are you sure you want to ban ${u.name}? This will revoke their pass and block all festival access.`)) {
                                handleStatusChange(u.id, 'banned', adminNotesInput);
                              }
                            }}
                          >
                            <ShieldBan className="w-4 h-4 mr-1" /> Ban User
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-fg-dim">
                        {u.accountStatus === 'active' && '✅ User account is active and in good standing.'}
                        {u.accountStatus === 'flagged' && '⚠️ User is flagged — they must re-complete their profile before accessing events.'}
                        {u.accountStatus === 'banned' && '🚫 User is banned — their pass has been revoked and they cannot register or apply.'}
                      </p>
                    </div>
                  )}
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
