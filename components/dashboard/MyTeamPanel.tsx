'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Plus, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MyTeamPanel() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!teamName) {
      setError('Team name is required');
      return;
    }

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName })
      });
      
      if (res.ok) {
        setTeamName('');
        setSuccess('Team created successfully!');
        fetchTeams();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create team');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!inviteCode) {
      setError('Invite code is required');
      return;
    }

    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });
      
      if (res.ok) {
        setInviteCode('');
        setSuccess('Joined team successfully!');
        fetchTeams();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join team');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="rounded-bento border border-line bg-panel p-6 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text">My Teams</h2>
          <p className="text-sm text-text-muted">Manage your teams and invites.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
      </div>

      {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /> {success}</div>}

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-md border border-line p-4">
          <h3 className="font-medium text-text">Create a Team</h3>
          <form onSubmit={handleCreateTeam} className="flex gap-2">
            <Input 
              placeholder="Team Name" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <Button type="submit" size="sm" className="shrink-0 px-2"><Plus className="h-4 w-4" /></Button>
          </form>
        </div>

        <div className="space-y-4 rounded-md border border-line p-4">
          <h3 className="font-medium text-text">Join a Team</h3>
          <form onSubmit={handleJoinTeam} className="flex gap-2">
            <Input 
              placeholder="Invite Code (e.g. A1B2C3D4)" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <Button type="submit" size="sm" variant="ghost" className="shrink-0 px-2"><LinkIcon className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-text">Your Teams</h3>
        {loading ? (
          <p className="text-sm text-text-muted">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-text-muted">You don&apos;t have a team yet.</p>
        ) : (
          <div className="space-y-3">
            {teams.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border border-line bg-background p-4">
                <div>
                  <div className="font-medium text-text">{t.team.name}</div>
                  <div className="text-xs text-text-muted">Role: {t.role}</div>
                </div>
                {t.role === 'LEADER' && (
                  <div className="text-right">
                    <div className="text-xs font-medium text-text-muted uppercase">Invite Code</div>
                    <div className="font-mono text-sm font-bold tracking-widest text-primary">{t.team.inviteCode}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
