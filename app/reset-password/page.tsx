'use client';

import { useState, Suspense } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Rocket, ArrowLeft, Loader2, Lock, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || (!token ? 'Invalid or missing reset token.' : ''));
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token. Please request a new link.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: formData.password,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to reset password.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative py-12">
      {/* Background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,229,192,0.04)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="card-flat p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-runway-gold/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-runway-gold" />
            </div>
            <div>
              <span className="font-display font-bold text-lg">
                GSF <span className="text-runway-gold">2026</span>
              </span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold mt-6 mb-2">
            Set New Password
          </h1>
          <p className="text-sm text-white/40 mb-8">
            Create a new, strong password for your account.
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-signal-red/10 border border-signal-red/20"
            >
              <p className="text-sm text-signal-red">{error}</p>
            </motion.div>
          )}

          {/* Success */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <div className="p-4 rounded-lg bg-success/10 border border-success/20 mb-6">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm text-success font-medium">Password Reset Complete</p>
                <p className="text-xs text-success/70 mt-1">
                  Your password has been successfully updated.
                </p>
              </div>
              <Link href="/login" className="btn-primary w-full py-3 flex justify-center">
                Sign In Now
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    required
                    className="input-field w-full pl-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={!token}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    required
                    className="input-field w-full pl-10"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={!token}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !token}
                className="btn-primary w-full py-3 mt-4 flex justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-runway-gold" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
