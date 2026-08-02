'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string | null;
  userName: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  collegeDept: string;
  year: string;
  enrollmentNumber: string;
  universityId: string;
  role: string;
  passId: string;
}

export function ProfileSettingsModal({ isOpen, onClose, currentImage, userName }: ProfileSettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch profile data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(async () => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setEditName(data.user.name || '');
          setEditPhone(data.user.phone || '');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be less than 2MB'); return; }

    setError(null);
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const { error: updateError } = await authClient.updateUser({ image: base64String });
        if (updateError) {
          setError(updateError.message || 'Failed to update image');
        } else {
          setSuccess('Image updated');
          router.refresh();
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to process image');
      setIsUploading(false);
    }
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: updateError } = await authClient.updateUser({ name: editName.trim() });
      if (updateError) {
        setError(updateError.message || 'Failed to update name');
        return;
      }
      setSuccess('Profile updated');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Profile Settings">
      <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {currentImage ? (
              <Image src={currentImage} alt={userName} width={80} height={80} className="h-20 w-20 rounded-full object-cover transition-opacity group-hover:opacity-75" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime text-2xl font-bold text-void transition-opacity group-hover:opacity-75">{userName.charAt(0).toUpperCase()}</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-panel/80">
                <Loader2 className="h-5 w-5 animate-spin text-lime" />
              </div>
            )}
          </div>
          <p className="text-xs text-fg-dim">Click to change photo</p>
        </div>

        {error && <div className="rounded-tile bg-magenta px-3 py-2 text-sm font-semibold text-void" role="alert">{error}</div>}
        {success && <div className="rounded-tile bg-lime px-3 py-2 text-sm font-semibold text-void" role="status">{success}</div>}

        {loading ? (
          <div className="text-center py-8"><p className="text-fg-dim">Loading profile…</p></div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Editable name */}
            <Input label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />

            {/* Read-only fields */}
            <div className="space-y-3 rounded-tile bg-panel-alt p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Email</p>
                <p className="text-sm text-fg">{profile.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Role</p>
                <p className="text-sm text-fg capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Phone</p>
                <p className="text-sm text-fg">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">College</p>
                <p className="text-sm text-fg">{profile.organization || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Course</p>
                <p className="text-sm text-fg">{profile.collegeDept || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Semester</p>
                <p className="text-sm text-fg">{profile.year || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Enrollment Number</p>
                <p className="text-sm text-fg">{profile.enrollmentNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">University ID</p>
                <p className="text-sm text-fg">{profile.universityId || '—'}</p>
              </div>
              {profile.passId && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Pass ID</p>
                  <p className="text-sm text-fg font-mono">{profile.passId}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
              <Button variant="secondary" onClick={onClose} disabled={saving}>Close</Button>
            </div>
          </div>
        ) : null}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </Modal>
  );
}
