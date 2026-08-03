'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';

import { VALID_COLLEGES, VALID_COURSES, VALID_SEMESTERS, COURSE_TO_COLLEGE } from '@/lib/constants/colleges';

export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profileLoaded, setProfileLoaded] = useState(false);

  const isEditMode = user?.profileComplete ?? false;

  const [accountStatus, setAccountStatus] = useState<string>('active');

  // Pre-populate fields from existing profile data when editing
  useEffect(() => {
    if (!isEditMode || profileLoaded) return;
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.user) {
          setPhone(data.user.phone || '');
          setCollege(data.user.organization || '');
          setCourse(data.user.collegeDept || '');
          setSemester(data.user.year || '');
          setEnrollmentNumber(data.user.enrollmentNumber || '');
          setUniversityId(data.user.universityId || '');
          setAccountStatus(data.user.accountStatus || 'active');
        }
      } catch { /* non-critical */ }
      setProfileLoaded(true);
    }, 0);
    return () => clearTimeout(id);
  }, [isEditMode, profileLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-fg-dim">Loading…</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Basic client-side validation
    const errors: Record<string, string> = {};
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }
    if (!college) errors.college = 'Please select a college';
    if (!course) errors.course = 'Please select a course';
    if (!semester) errors.semester = 'Please select your semester';
    if (!enrollmentNumber.trim() || !/^GA/i.test(enrollmentNumber.trim())) {
      errors.enrollmentNumber = 'Enrollment number is required and must start with GA';
    }
    if (!universityId.trim() || !/^\d+$/.test(universityId.trim())) {
      errors.universityId = 'University ID is required and must be numbers only';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: trimmedPhone,
          college: college.trim(),
          course: course.trim(),
          semester: semester.trim(),
          enrollmentNumber: enrollmentNumber.trim().toUpperCase(),
          universityId: universityId.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join(', '));
        } else {
          setError(data.error || 'Failed to update profile');
        }
        return;
      }

      // Profile completed — redirect to dashboard
      router.push('/dashboard/user');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <PageHeader
          eyebrow={isEditMode ? 'Profile' : 'Account setup'}
          title={isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
          description={isEditMode ? 'Update your details below.' : 'Fill in the details below to unlock festival registration and sub-event applications.'}
        />
      </div>

      {accountStatus === 'flagged' && (
        <div className="mb-6 rounded-tile bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-400 font-medium" role="alert">
          ⚠️ Your account has been flagged by an administrator. Please review and update your details to restore your active status.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Read-only info & helpful text */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-base font-medium text-fg">Account Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-fg-dim uppercase tracking-wider">Name</p>
                  <p className="text-sm font-semibold text-fg mt-1">{user?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-fg-dim uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-fg mt-1">{user?.email || '—'}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="rounded-tile bg-primary/10 border border-primary/20 p-4">
            <h4 className="text-sm font-bold text-primary mb-1">Why do we need this?</h4>
            <p className="text-xs text-primary/80 leading-relaxed">
              Your details are required to generate your personalized festival pass and to ensure smooth check-ins across different sub-events and venues.
            </p>
          </div>
        </div>

        {/* Right Column: Editable Form */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <h2 className="text-base font-medium text-fg">Academic Information</h2>
            </CardHeader>
            <CardBody>
              {error && (
                <div className="mb-6 rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Phone */}
                <Input
                  label="Phone Number *"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  error={fieldErrors.phone}
                  maxLength={15}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* College */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg">College *</label>
                    <select
                      value={college}
                      onChange={(e) => {
                        setCollege(e.target.value);
                        setCourse(''); // Reset course when college changes
                      }}
                      className="flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a college</option>
                      {Array.from(VALID_COLLEGES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {fieldErrors.college && <p className="text-[13px] font-medium text-red-500">{fieldErrors.college}</p>}
                  </div>

                  {/* Course */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg">Course *</label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      disabled={!college}
                      className="flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select Course</option>
                      {Array.from(VALID_COURSES).filter(c => COURSE_TO_COLLEGE[c] === college).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {fieldErrors.course && <p className="text-xs text-magenta">{fieldErrors.course}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Semester */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg">Semester *</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select Semester</option>
                      {Array.from(VALID_SEMESTERS).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {fieldErrors.semester && <p className="text-[13px] font-medium text-red-500">{fieldErrors.semester}</p>}
                  </div>

                  {/* Enrollment Number */}
                  <Input
                    label="Enrollment Number *"
                    name="enrollmentNumber"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="GA21XXXXXX"
                    error={fieldErrors.enrollmentNumber}
                    maxLength={30}
                  />
                </div>

                {/* University ID */}
                <Input
                  label="University ID Number *"
                  name="universityId"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="e.g. 2101234567"
                  error={fieldErrors.universityId}
                  maxLength={20}
                />

                <div className="pt-4 border-t border-line mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" loading={submitting} className="w-full sm:w-auto px-8">
                    {isEditMode ? 'Update Profile' : 'Complete Profile'}
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary" 
                    className="w-full sm:w-auto px-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 sm:hidden"
                    onClick={async () => {
                      try {
                        const { authClient } = await import('@/lib/auth-client');
                        await authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => {
                              window.location.href = '/login';
                            }
                          }
                        });
                      } catch (err) {
                        console.error('Sign out failed', err);
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
