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
    <div className="mt-4">
      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Registering...' : 'Register for Festival'}
      </button>
    </div>
  );
}
