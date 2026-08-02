'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';

const COLLEGES = {
  "Parul College of Engineering and IT": [
    "B.Tech Computer Science & Engineering",
    "B.Tech AI & ML",
    "B.Tech Cyber Security",
    "B.Tech Data Science",
    "BCA",
    "BCA (Specializations)",
    "MCA"
  ],
  "Parul College of Management Studies": [
    "BBA",
    "BBA (Finance)",
    "BBA (Marketing)",
    "MBA"
  ],
  "Parul College of Nursing": [
    "GNM",
    "B.Sc Nursing",
    "M.Sc Nursing"
  ],
  "Parul College of Physiotherapy": [
    "Bachelor of Physiotherapy (BPT)",
    "MPT"
  ],
  "Parul College of Applied & Health Sciences": [
    "B.Sc Biotechnology",
    "B.Sc Microbiology",
    "B.Sc Medical Laboratory Technology",
    "B.Sc Anaesthesia & Operation Theatre Technology"
  ],
  "Parul College of Pharmacy": [
    "B.Pharm",
    "B.Pharm (Lateral Entry)",
    "M.Pharm"
  ],
  "Parul College of Hotel Management": [
    "BHMCT",
    "B.Sc Hospitality",
    "Diploma programmes"
  ]
};

const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Completed"
];

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
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <PageHeader
          eyebrow={isEditMode ? 'Profile' : 'Account setup'}
          title={isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
          description={isEditMode ? 'Update your details below.' : 'Fill in the details below to unlock festival registration and sub-event applications.'}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium text-fg">Profile Details</h2>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="mb-4 rounded-tile bg-magenta px-4 py-3 text-sm font-semibold text-void" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Read-only info */}
            <div className="space-y-3 rounded-tile bg-panel-alt p-4">
              <div>
                <p className="text-xs font-medium text-fg-dim uppercase tracking-wider">Name</p>
                <p className="text-sm text-fg">{user?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-fg-dim uppercase tracking-wider">Email</p>
                <p className="text-sm text-fg">{user?.email || '—'}</p>
              </div>
            </div>

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

            {/* College */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-fg">College *</label>
              <select
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setCourse(''); // Reset course when college changes
                }}
                className="flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a college</option>
                {Object.keys(COLLEGES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {fieldErrors.college && <p className="text-[13px] font-medium text-red-500">{fieldErrors.college}</p>}
            </div>

            {/* Course */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-fg">Course *</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={!college}
                className="flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a course</option>
                {college && COLLEGES[college as keyof typeof COLLEGES].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {fieldErrors.course && <p className="text-[13px] font-medium text-red-500">{fieldErrors.course}</p>}
            </div>

            {/* Semester */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-fg">Semester *</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="flex h-11 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select semester</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
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

            <Button type="submit" loading={submitting} className="w-full">
              {isEditMode ? 'Update Profile' : 'Complete Profile'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
