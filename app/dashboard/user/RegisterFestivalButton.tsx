'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RegisterFestivalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegister() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/user/register-festival', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Refresh the page to show the new pass
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-sm font-semibold text-void/70" role="alert">
          {error}
        </p>
      )}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-void px-5 py-2.5 text-sm font-bold tracking-tight text-lime transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Registering…' : 'Get my pass'}
      </button>
    </div>
  );
}
