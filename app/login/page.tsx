'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Rocket, ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setError('');

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch {
      setError('Sign in failed. Please try again.');
      setLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingEmail(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid email or password.');
        setLoadingEmail(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred during sign in.');
      setLoadingEmail(false);
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
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
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
            Welcome Back
          </h1>
          <p className="text-sm text-white/40 mb-8">
            Sign in to access your pass and dashboard.
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

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  className="input-field w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-runway-gold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  required
                  className="input-field w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loadingEmail || loadingGoogle}
              className="btn-primary w-full py-3 mt-2 flex justify-center"
            >
              {loadingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-ink-card px-2 text-white/30 uppercase tracking-widest">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingEmail}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingGoogle ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-runway-gold hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
