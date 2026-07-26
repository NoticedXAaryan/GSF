'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { authClient } from '@/lib/auth-client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  LogOut,
  QrCode,
  CalendarDays,
  User,
  Building2,
  Mail,
  Phone,
  Loader2,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface PassData {
  passId: string;
  qrToken: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [passData, setPassData] = useState<PassData | null>(null);
  const showProfileForm = user && !user.profileComplete;
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '',
    collegeDept: '',
    year: '',
    organization: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);



  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to complete profile');
        return;
      }

      setPassData({ passId: data.passId, qrToken: data.qrToken });
      // Refresh session to get updated user data
      window.location.reload();
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-runway-gold" />
      </div>
    );
  }

  if (!user) return null;

  // ── Profile completion form ──
  if (showProfileForm) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-24 pb-16 px-6 max-w-lg mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-runway-gold/10 flex items-center justify-center">
                <User className="w-6 h-6 text-runway-gold" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Complete Your Profile</h1>
                <p className="text-sm text-white/40">
                  Welcome, {user.name}! Fill in your details to get your access pass.
                </p>
              </div>
            </div>

            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Department / Branch
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Computer Science"
                  value={profileForm.collegeDept}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, collegeDept: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Year
                  </label>
                  <select
                    className="input-field"
                    value={profileForm.year}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, year: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Organization
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Parul University"
                    value={profileForm.organization}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, organization: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="btn-primary w-full mt-6"
              >
                {profileLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Get My Access Pass'
                )}
              </button>
            </form>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Main Dashboard ──
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome, <span className="text-gradient-gold">{user.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-white/40">
              Your GSF 2026 dashboard — access pass, events, and announcements.
            </p>
          </div>
          <button onClick={handleSignOut} className="btn-secondary text-sm">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Access Pass Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <QrCode className="w-5 h-5 text-runway-gold" />
              <h2 className="font-display font-bold text-lg">Access Pass</h2>
            </div>

            {user.passId ? (
              <>
                <div className="bg-white p-5 rounded-lg flex flex-col items-center mb-5">
                  <QRCodeSVG value={user.passId} size={180} />
                  <div className="mt-3 font-mono text-xs text-ink-navy tracking-widest">
                    {user.passId}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-white/40">
                    <User className="w-3.5 h-3.5" />
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-white/40">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    <span className="badge badge-accepted">{user.role}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-white/30 py-8">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No pass generated yet</p>
              </div>
            )}
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Info */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-runway-gold" />
                <h2 className="font-display font-bold text-lg">Profile</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">
                    Department
                  </span>
                  <p className="mt-0.5">{user.collegeDept || '—'}</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Year</span>
                  <p className="mt-0.5">{user.year || '—'}</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">
                    Organization
                  </span>
                  <p className="mt-0.5">{user.organization || '—'}</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">
                    Email
                  </span>
                  <p className="mt-0.5 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-runway-gold" />
                <h2 className="font-display font-bold text-lg">Next Steps</h2>
              </div>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex gap-3">
                  <span className="text-runway-gold font-bold">01</span>
                  Save your QR code — you&apos;ll need it for entry.
                </li>
                <li className="flex gap-3">
                  <span className="text-runway-gold font-bold">02</span>
                  Check the event schedule and register for masterclasses.
                </li>
                <li className="flex gap-3">
                  <span className="text-runway-gold font-bold">03</span>
                  Arrive by 9:00 AM on Day 1 for check-in at the venue.
                </li>
                <li className="flex gap-3">
                  <span className="text-runway-gold font-bold">04</span>
                  Bring your university ID card for verification.
                </li>
              </ul>
            </div>

            {/* Quick Info */}
            <div className="card-flat p-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-white/30" />
                <h3 className="font-display font-semibold text-sm text-white/40 uppercase tracking-wider">
                  Event Details
                </h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/30 text-xs">Dates</span>
                  <p className="font-medium">Sept 2–3, 2026</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs">Venue</span>
                  <p className="font-medium">Parul University, Goa</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs">Check-in Opens</span>
                  <p className="font-medium">8:30 AM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
