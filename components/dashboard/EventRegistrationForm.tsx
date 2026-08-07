import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { getEventSlug } from '@/lib/validateRegistration';

interface EventRegistrationFormProps {
  eventName: string;
  isApplying: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  error: string | null;
}

export function EventRegistrationForm({ eventName, isApplying, onCancel, onSubmit, error }: EventRegistrationFormProps) {
  const eventSlug = getEventSlug(eventName);
  
  // Generic fields
  const [notes, setNotes] = useState('');
  
  // Event-specific state
  const [teamMembers, setTeamMembers] = useState<string[]>(['']);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [teamName, setTeamName] = useState('');
  const [ideaSummary, setIdeaSummary] = useState('');
  const [problemSolution, setProblemSolution] = useState('');
  
  const [instagramUrl, setInstagramUrl] = useState('');
  const [acknowledgedRules, setAcknowledgedRules] = useState(false);
  
  const [sessions, setSessions] = useState<string[]>([]);
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const isReelPitch = eventSlug === 'reel-pitch';
  const isIdeaPitch = eventSlug === 'idea-pitch';
  const isMasterclass = eventSlug === 'masterclass';
  const isEcosystemConnect = eventSlug === 'ecosystem-connect';

  // Load draft
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch(`/api/events/${eventSlug}/draft`);
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            if (data.notes) setNotes(data.notes);
            if (data.teamMembers) setTeamMembers(data.teamMembers);
            if (data.ideaTitle) setIdeaTitle(data.ideaTitle);
            if (data.teamName) setTeamName(data.teamName);
            if (data.ideaSummary) setIdeaSummary(data.ideaSummary);
            if (data.problemSolution) setProblemSolution(data.problemSolution);
            if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
            if (data.acknowledgedRules) setAcknowledgedRules(data.acknowledgedRules);
            if (data.sessions) setSessions(data.sessions);
            if (data.pitchDeckUrl) setPitchDeckUrl(data.pitchDeckUrl);
          }
        }
      } catch (err) {
        console.error('Failed to load draft', err);
      } finally {
        setDraftLoaded(true);
      }
    }
    loadDraft();
  }, [eventSlug]);

  // Save draft
  useEffect(() => {
    if (!draftLoaded) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      let payload: any = { notes };
      if (isIdeaPitch) payload = { ...payload, teamName, ideaTitle, ideaSummary, problemSolution, teamMembers, pitchDeckUrl };
      if (isReelPitch) payload = { ...payload, instagramUrl, teamMembers, acknowledgedRules };
      if (isMasterclass) payload = { ...payload, sessions };

      try {
        await fetch(`/api/events/${eventSlug}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Failed to save draft', err);
      }
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [notes, teamMembers, ideaTitle, teamName, ideaSummary, problemSolution, instagramUrl, acknowledgedRules, sessions, pitchDeckUrl, draftLoaded, isIdeaPitch, isReelPitch, isMasterclass, eventSlug]);


  if (isEcosystemConnect) {
    return (
      <div className="py-4 text-center">
        <p className="text-magenta font-bold">This is a closed-door session.</p>
        <p className="text-fg-dim text-sm mt-2">Registration is by invite only.</p>
        <div className="flex justify-end gap-3 pt-6">
          <Button variant="secondary" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...teamMembers];
    newMembers[index] = value;
    setTeamMembers(newMembers);
  };

  const handleSessionToggle = (session: string) => {
    setSessions(prev => 
      prev.includes(session) 
        ? prev.filter(s => s !== session) 
        : [...prev, session]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let payload: any = { notes };
    
    if (isIdeaPitch) {
      payload = { ...payload, teamName, ideaTitle, ideaSummary, problemSolution, teamMembers, pitchDeckUrl };
    } else if (isReelPitch) {
      payload = { ...payload, instagramUrl, teamMembers, acknowledgedRules };
    } else if (isMasterclass) {
      payload = { ...payload, sessions };
    }
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <p className="text-sm text-fg-dim">This event has limited capacity. Please briefly explain why you want to attend.</p>
      
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-fg">Why do you want to apply? *</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          className="flex min-h-[80px] w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="e.g. I am very interested in learning more about..."
        />
      </div>

      {isIdeaPitch && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-fg">Team Name *</label>
            <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-fg">Startup Idea Title *</label>
            <input type="text" required value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-fg">Idea Summary *</label>
            <textarea required value={ideaSummary} onChange={e => setIdeaSummary(e.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-fg">Problem & Solution *</label>
            <textarea required value={problemSolution} onChange={e => setProblemSolution(e.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-fg">Pitch Deck (PDF/PPT, Max 5MB)</label>
            {pitchDeckUrl ? (
              <div className="flex items-center justify-between p-3 rounded-md bg-panel border border-line">
                <a href={pitchDeckUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">View Uploaded Deck</a>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPitchDeckUrl('')}>Remove</Button>
              </div>
            ) : (
              <input 
                type="file" 
                accept=".pdf,.ppt,.pptx"
                disabled={uploading}
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  setUploading(true);
                  try {
                    const file = e.target.files[0];
                    if (file.size > 5_000_000) {
                      alert('File too large (Max 5MB)');
                      return;
                    }
                    const formData = new FormData();
                    formData.append('pitchDeck', file);
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    if (res.ok) {
                      const { url } = await res.json();
                      setPitchDeckUrl(url);
                    } else {
                      alert('Upload failed');
                    }
                  } catch (err) {
                    console.error('Upload error', err);
                  } finally {
                    setUploading(false);
                  }
                }} 
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-surface hover:file:opacity-90" 
              />
            )}
          </div>
        </>
      )}

      {isReelPitch && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-fg">Instagram Reel URL *</label>
          <input type="url" required value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="https://instagram.com/..." />
          <p className="text-xs text-fg-dim mt-1">Must be a public post, collab with @paruluniversitygoa and @pierc_pu. Tech specs: 60-90s, MP4 (9:16), Min 1080x1920, Max 250MB.</p>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="rules" checked={acknowledgedRules} onChange={e => setAcknowledgedRules(e.target.checked)} required />
            <label htmlFor="rules" className="text-xs text-fg">I acknowledge the tech specs and rules.</label>
          </div>
        </div>
      )}

      {(isReelPitch || isIdeaPitch) && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-fg">Team Members (Max 3)</label>
          {teamMembers.map((member, i) => (
            <input 
              key={i} 
              type="text" 
              required
              value={member}
              placeholder={`Member ${i+1} Name`}
              className="w-full rounded-md border border-line bg-panel px-3 py-2 mb-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              onChange={(e) => handleMemberChange(i, e.target.value)}
            />
          ))}
          {teamMembers.length < 3 && (
            <button type="button" onClick={() => setTeamMembers([...teamMembers, ''])} className="text-xs font-bold tracking-tight text-lime hover:underline mt-1">
              + Add Member
            </button>
          )}
        </div>
      )}

      {isMasterclass && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-fg">Select Sessions to Attend *</label>
          <div className="space-y-2 mt-2">
            {['Session 1: Understanding the Startup Lifecycle', 'Session 2: The Art of Idea Generation', 'Session 3: Design Thinking for Startups', 'Session 4: Build a Winning Business Model'].map((session) => (
              <div key={session} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id={session} 
                  checked={sessions.includes(session)}
                  onChange={() => handleSessionToggle(session)}
                />
                <label htmlFor={session} className="text-xs text-fg">{session}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-magenta">{error}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isApplying}>Cancel</Button>
        <Button type="submit" loading={isApplying} disabled={isApplying || (isMasterclass && sessions.length === 0)}>Submit Application</Button>
      </div>
    </form>
  );
}
