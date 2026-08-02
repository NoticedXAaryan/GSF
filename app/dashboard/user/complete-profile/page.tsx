'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [collegeDept, setCollegeDept] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-fg-dim">Loading…</p>
      </div>
    );
  }

  if (user?.profileComplete) {
    router.replace('/dashboard/user');
    return null;
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
          collegeDept: collegeDept.trim(),
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
          eyebrow="Account setup"
          title="Complete Your Profile"
          description="Fill in the details below to unlock festival registration and sub-event applications."
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

            {/* College/Department */}
            <Input
              label="College / Department"
              name="collegeDept"
              value={collegeDept}
              onChange={(e) => setCollegeDept(e.target.value)}
              placeholder="e.g., Computer Science & Engineering"
              maxLength={100}
            />

            <Button type="submit" loading={submitting} className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
