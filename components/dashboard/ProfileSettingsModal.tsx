'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { authClient, redirectAfterSignOut } from '@/lib/auth-client';
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

import { VALID_COLLEGES, VALID_COURSES, VALID_SEMESTERS, COURSE_TO_COLLEGE } from '@/lib/constants/colleges';
export function ProfileSettingsModal({ isOpen, onClose, currentImage, userName }: ProfileSettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editEnrollment, setEditEnrollment] = useState('');
  const [editUniversityId, setEditUniversityId] = useState('');

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
          setEditCollege(data.user.organization || '');
          setEditCourse(data.user.collegeDept || '');
          setEditSemester(data.user.year || '');
          setEditEnrollment(data.user.enrollmentNumber || '');
          setEditUniversityId(data.user.universityId || '');
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
      // Update name via authClient
      if (editName.trim() !== profile?.name) {
        const { error: nameError } = await authClient.updateUser({ name: editName.trim() });
        if (nameError) {
          setError(nameError.message || 'Failed to update name');
          setSaving(false);
          return;
        }
      }

      // Update profile fields via PATCH
      const profileUpdate: Record<string, string> = {};
      if (editPhone.trim() !== (profile?.phone || '')) profileUpdate.phone = editPhone.trim();
      if (editCollege.trim() !== (profile?.organization || '')) profileUpdate.college = editCollege.trim();
      if (editCourse.trim() !== (profile?.collegeDept || '')) profileUpdate.course = editCourse.trim();
      if (editSemester.trim() !== (profile?.year || '')) profileUpdate.semester = editSemester.trim();
      if (editEnrollment.trim() !== (profile?.enrollmentNumber || '')) profileUpdate.enrollmentNumber = editEnrollment.trim();
      if (editUniversityId.trim() !== (profile?.universityId || '')) profileUpdate.universityId = editUniversityId.trim();

      if (Object.keys(profileUpdate).length > 0) {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileUpdate),
        });

        if (!res.ok) {
          const data = await res.json();
          const errString = data.details && Array.isArray(data.details) ? data.details.join(', ') : data.error;
          setError(errString || 'Failed to update profile');
          setSaving(false);
          return;
        }

        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
        }
      }

      setSuccess('Profile updated');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }


  const selectClass = "flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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

            {/* Read-only email and role */}
            <div className="space-y-3 rounded-tile bg-panel-alt p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Email</p>
                <p className="text-sm text-fg">{profile.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Role</p>
                <p className="text-sm text-fg capitalize">{profile.role}</p>
              </div>
              {profile.passId && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Pass ID</p>
                  <p className="text-sm text-fg font-mono">{profile.passId}</p>
                </div>
              )}
            </div>

            {/* Editable profile fields */}
            <div className="space-y-4">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+919876543210"
                maxLength={15}
              />

              {/* College */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">College</label>
                <select
                  value={editCollege}
                  onChange={(e) => {
                    setEditCollege(e.target.value);
                    setEditCourse('');
                  }}
                  className={selectClass}
                >
                  <option value="">Select a college</option>
                  {Array.from(VALID_COLLEGES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Course */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">Course</label>
                <select
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  disabled={!editCollege}
                  className={selectClass}
                >
                  <option value="">Select a course</option>
                  {Array.from(VALID_COURSES).filter(c => COURSE_TO_COLLEGE[c] === editCollege).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">Semester</label>
                <select
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select semester</option>
                  {Array.from(VALID_SEMESTERS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Enrollment Number */}
              <Input
                label="Enrollment Number"
                name="enrollmentNumber"
                value={editEnrollment}
                onChange={(e) => setEditEnrollment(e.target.value)}
                placeholder="GA21XXXXXX"
                maxLength={30}
              />

              {/* University ID */}
              <Input
                label="University ID Number"
                name="universityId"
                value={editUniversityId}
                onChange={(e) => setEditUniversityId(e.target.value)}
                placeholder="e.g. 2101234567"
                maxLength={20}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex gap-3">
                <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
                <Button variant="secondary" onClick={onClose} disabled={saving}>Close</Button>
              </div>
              <Button 
                variant="secondary" 
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10 lg:hidden"
                onClick={async () => {
                  await authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        redirectAfterSignOut('/login');
                      }
                    }
                  });
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : null}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </Modal>
  );
}
