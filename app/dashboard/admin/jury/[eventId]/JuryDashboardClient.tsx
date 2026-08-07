'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Check, X, Clock, ExternalLink } from 'lucide-react';

export default function JuryDashboardClient({ applications, eventType }: { applications: any[], eventType: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(applications[0]?.id || null);
  const [apps, setApps] = useState(applications);
  const [loading, setLoading] = useState(false);

  const selectedApp = apps.find(a => a.id === selectedId);

  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status } : a));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden border border-line rounded-md bg-panel">
      {/* Pane 1: List */}
      <div className="w-1/3 border-r border-line overflow-y-auto bg-background">
        <div className="p-4 border-b border-line sticky top-0 bg-background z-10">
          <h3 className="font-semibold text-fg">Submissions ({apps.length})</h3>
        </div>
        <div className="divide-y divide-line">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => setSelectedId(app.id)}
              className={cn(
                "w-full text-left p-4 hover:bg-panel-alt transition-colors focus:outline-none",
                selectedId === app.id && "bg-panel-alt border-l-2 border-primary"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-fg truncate pr-2">
                  {eventType === 'idea-pitch' ? app.ideaTitle : app.userName}
                </div>
                <StatusIcon status={app.status} />
              </div>
              <div className="text-xs text-fg-dim truncate">
                {eventType === 'idea-pitch' ? app.teamName : `Team: ${app.teamMembers?.join(', ')}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pane 2: Details */}
      <div className="w-2/3 flex flex-col bg-panel">
        {selectedApp ? (
          <>
            <div className="p-6 border-b border-line overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold text-fg mb-4">
                {eventType === 'idea-pitch' ? selectedApp.ideaTitle : 'Reel Pitch Submission'}
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                <div>
                  <div className="text-fg-dim mb-1 font-medium">Applicant</div>
                  <div className="text-fg">{selectedApp.userName}</div>
                  <div className="text-fg-dim text-xs">{selectedApp.userEmail}</div>
                </div>
                <div>
                  <div className="text-fg-dim mb-1 font-medium">Team</div>
                  <div className="text-fg">{eventType === 'idea-pitch' ? selectedApp.teamName : 'N/A'}</div>
                  <div className="text-fg-dim text-xs">{selectedApp.teamMembers?.length || 0} members</div>
                </div>
              </div>

              {eventType === 'idea-pitch' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-fg mb-2 uppercase tracking-wide">Idea Summary</h4>
                    <p className="text-sm text-fg-dim whitespace-pre-wrap bg-background p-4 rounded-md border border-line">
                      {selectedApp.ideaSummary}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-fg mb-2 uppercase tracking-wide">Problem & Solution</h4>
                    <p className="text-sm text-fg-dim whitespace-pre-wrap bg-background p-4 rounded-md border border-line">
                      {selectedApp.problemSolution}
                    </p>
                  </div>
                  {selectedApp.pitchDeckUrl && (
                    <div>
                      <h4 className="text-sm font-semibold text-fg mb-2 uppercase tracking-wide">Attachments</h4>
                      <a 
                        href={selectedApp.pitchDeckUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-line rounded-md text-sm font-medium hover:bg-panel-alt transition-colors"
                      >
                        View Pitch Deck <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {eventType === 'reel-pitch' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-fg mb-2 uppercase tracking-wide">Instagram Reel</h4>
                    <a 
                      href={selectedApp.instagramUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-line rounded-md text-sm font-medium hover:bg-panel-alt transition-colors text-primary"
                    >
                      {selectedApp.instagramUrl} <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Pane 3: Evaluation Actions (Sticky Bottom) */}
            <div className="p-4 border-t border-line bg-background flex items-center justify-between">
              <div className="text-sm font-medium">
                Current Status: <span className="uppercase ml-2 font-bold">{selectedApp.status}</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="text-magenta hover:bg-magenta/10 hover:text-magenta border-magenta/20"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={loading || selectedApp.status === 'rejected'}
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button 
                  className="bg-lime hover:bg-lime/90 text-void"
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={loading || selectedApp.status === 'accepted'}
                >
                  <Check className="w-4 h-4 mr-2" /> Accept / Shortlist
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-fg-dim">
            Select an application to view details
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'accepted') return <div className="bg-lime/20 text-lime px-2 py-0.5 rounded text-[10px] font-bold uppercase">Accepted</div>;
  if (status === 'rejected') return <div className="bg-magenta/20 text-magenta px-2 py-0.5 rounded text-[10px] font-bold uppercase">Rejected</div>;
  return <div className="bg-volt/20 text-volt px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending</div>;
}
