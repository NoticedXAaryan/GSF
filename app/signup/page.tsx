"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { signUp, signIn } from '@/lib/auth-client';

const validImages = {
  hero: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=1920',
  audience: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
};

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard/user');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard/user',
      });
    } catch {
      setError('Google sign-up failed. Please try again.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#050505]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={validImages.hero}
          alt="Background"
          fill
          className="object-cover opacity-20 blur-[2px] mix-blend-luminosity scale-105"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/70 via-[#1a0505]/60 to-[#050505]/80" />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl bg-[#ffffff] text-black rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl"
      >
        {/* Left Side - Image */}
        <div className="relative w-full md:w-[45%] h-64 md:h-auto p-4 hidden md:block">
          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
            <Image
              src={validImages.audience}
              alt="Startup Fest Audience"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors mb-10 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>

            <div className="mb-8">
              <p className="text-sm font-medium text-gray-900 mb-2">Get Your Pass for</p>
              <h1 className="text-4xl md:text-5xl font-serif leading-[1.1] tracking-tight text-black">
                Goa Startup Fest
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleEmailSignup}>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full bg-[#F5F5F5] border-transparent rounded-xl px-5 py-4 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm disabled:opacity-50"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full bg-[#F5F5F5] border-transparent rounded-xl px-5 py-4 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm disabled:opacity-50"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full bg-[#F5F5F5] border-transparent rounded-xl px-5 py-4 pr-12 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-1 text-sm">
                <span className="text-gray-500">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Log in
                  </Link>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-200 text-black py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center bg-black text-white py-4 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-8 flex items-center">
            <div className="text-2xl font-serif tracking-tight text-black mr-4 font-bold flex items-center">
              <span className="w-6 h-6 rounded-full bg-black block mr-1"></span>
              <span className="w-6 h-6 rounded-full bg-black block -ml-3 mix-blend-multiply opacity-50"></span>
              <span className="ml-2 tracking-tighter">pierc</span>
            </div>
            <div className="text-[10px] text-gray-600 border-l border-gray-300 pl-4 leading-tight">
              Parul Innovation &<br />Entrepreneurship Research Centre
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
