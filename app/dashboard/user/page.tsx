"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Calendar, FileText, QrCode, Megaphone, LogOut, Loader2, MapPin, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

type TabType = 'events' | 'applications' | 'pass' | 'announcements';

interface EventData {
  id: string;
  name: string;
  description: string;
  date: string;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  type: string;
  targetAudience: string;
  capacity: number | null;
  currentRegistrations: number;
  status: string;
}

interface ApplicationData {
  id: string;
  uid: string;
  subEventId: string;
  userName: string;
  userEmail: string;
  status: string;
  appliedAt: number;
  eventName?: string;
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    collegeDept: string;
    year: string;
    organization: string;
    passId: string;
    profileComplete: boolean;
  };
  clearancePass: {
    passId: string;
    qrToken: string;
    issuedAt: number;
    revoked: boolean;
  } | null;
  applications: ApplicationData[];
}

interface AnnouncementData {
  id: string;
  title: string;
  body: string;
  audience: string;
  priority: string;
  createdAt: number;
}

export default function UserDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', collegeDept: '' });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Events state
  const [events, setEvents] = useState<EventData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  useEffect(() => {
    if (isPending || !session) return;
    let ignore = false;

    async function loadAll() {
      try {
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok && !ignore) {
          const data = await profileRes.json();
          setProfile(data);
          setShowProfileForm(!data.user.profileComplete);
        }
      } catch {
        console.error('Failed to fetch profile');
      }

      try {
        const [eventsRes, appsRes, announcementsRes] = await Promise.all([
          fetch('/api/events?status=published'),
          fetch('/api/user/applications'),
          fetch('/api/announcements'),
        ]);

        if (!ignore) {
          if (eventsRes.ok) { const data = await eventsRes.json(); setEvents(data.events || data); }
          if (appsRes.ok) { const data = await appsRes.json(); setApplications(data.applications || data); }
          if (announcementsRes.ok) { const data = await announcementsRes.json(); setAnnouncements(data.announcements || data); }
        }
      } catch {
        if (!ignore) setError('Failed to load dashboard data');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAll();
    return () => { ignore = true; };
  }, [isPending, session]);

  // Profile completion
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileForm.phone || profileForm.phone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }
    setProfileSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete profile');
      }

      // Issue festival pass
      const passRes = await fetch('/api/user/register-festival', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!passRes.ok) {
        const data = await passRes.json();
        console.warn('Pass issuance:', data.error);
      }

      // Refresh profile data
      const profileRes = await fetch('/api/user/profile');
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setShowProfileForm(!data.user.profileComplete);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setProfileSubmitting(false);
    }
  }

  // Apply to event
  async function handleApply(eventId: string) {
    setApplyingTo(eventId);
    setError('');
    try {
      const res = await fetch(`/api/events/${eventId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to apply');
      }
      // Refresh applications
      const appsRes = await fetch('/api/user/applications');
      if (appsRes.ok) {
        setApplications(await appsRes.json());
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply';
      setError(message);
    } finally {
      setApplyingTo(null);
    }
  }

  function isApplied(eventId: string) {
    return applications.some((a) => a.subEventId === eventId);
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      accepted: 'bg-green-50 text-green-700',
      pending: 'bg-yellow-50 text-yellow-700',
      rejected: 'bg-red-50 text-red-700',
      waitlisted: 'bg-orange-50 text-orange-700',
      not_eligible: 'bg-gray-100 text-gray-600',
    };
    const icons: Record<string, React.ReactNode> = {
      accepted: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
      pending: <Clock className="w-3.5 h-3.5 mr-1" />,
      rejected: <XCircle className="w-3.5 h-3.5 mr-1" />,
      waitlisted: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  }

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const tabs = [
    { id: 'events' as TabType, label: 'Events', icon: Calendar },
    { id: 'applications' as TabType, label: 'My Applications', icon: FileText },
    { id: 'pass' as TabType, label: 'My Pass', icon: QrCode },
    { id: 'announcements' as TabType, label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          <div className="text-xl font-serif tracking-tight text-black font-bold flex items-center mb-10">
            <span className="w-5 h-5 rounded-full bg-black block mr-1"></span>
            <span className="w-5 h-5 rounded-full bg-black block -ml-2.5 mix-blend-multiply opacity-50"></span>
            <span className="ml-2">Startup Fest</span>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
              {session.user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{session.user.name}</div>
              <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push('/login') } })}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white px-6 pt-12 pb-4 border-b border-gray-200 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-black">Hello, {session.user.name?.split(' ')[0]}</h1>
            <p className="text-sm text-gray-500">Ready for Startup Fest?</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
            {session.user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Profile Completion Banner */}
        {showProfileForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8"
          >
            <h2 className="text-xl font-serif text-black mb-2">Complete Your Profile</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in your details to get your digital festival pass.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">College / Department</label>
                <input
                  type="text"
                  value={profileForm.collegeDept}
                  onChange={(e) => setProfileForm({ ...profileForm, collegeDept: e.target.value })}
                  placeholder="e.g. Computer Science, Parul University"
                  className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={profileSubmitting}
                className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {profileSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Profile & Get Pass'}
              </button>
            </form>
          </motion.div>
        )}

        {error && !showProfileForm && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Events Tab */}
            {activeTab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Upcoming Events</h2>
                {events.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No events available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[180px]">
                        <div>
                          <h3 className="font-serif text-lg text-black mb-2">{event.name}</h3>
                          <div className="space-y-1 text-xs text-gray-500 mb-4">
                            <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Day {event.day} — {event.startTime} - {event.endTime}</div>
                            <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {event.venue}</div>
                            {event.capacity && (
                              <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {event.currentRegistrations}/{event.capacity} registered</div>
                            )}
                          </div>
                          {event.type === 'open' && (
                            <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[11px] font-medium">Open — No registration needed</span>
                          )}
                        </div>
                        {(event.type === 'registration' || event.type === 'shortlisted') && (
                          <button
                            onClick={() => handleApply(event.id)}
                            disabled={isApplied(event.id) || applyingTo === event.id}
                            className={`w-full py-2.5 rounded-xl text-xs font-medium uppercase tracking-widest mt-4 transition-colors ${
                              isApplied(event.id)
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                          >
                            {applyingTo === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : isApplied(event.id) ? (
                              'Applied'
                            ) : (
                              'Apply to Join'
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <motion.div key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Your Applications</h2>
                {applications.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No applications yet. Browse events and apply!</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                          <h3 className="font-serif text-lg text-black mb-1">{app.eventName || 'Event'}</h3>
                          <div className="text-xs text-gray-500">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0">{getStatusBadge(app.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Pass Tab */}
            {activeTab === 'pass' && (
              <motion.div key="pass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-col items-center max-w-md mx-auto pt-4 md:pt-8">
                {profile?.clearancePass ? (
                  <div className="w-full bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto rounded-full bg-black flex items-center justify-center text-white text-xl font-serif font-bold mb-4">
                        {session.user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <h2 className="text-2xl font-serif text-black mb-1">{session.user.name}</h2>
                      <p className="text-sm text-gray-500 mb-6">{session.user.email}</p>

                      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm inline-block mb-6">
                        <QRCodeSVG value={profile.clearancePass.qrToken} size={200} level="H" />
                      </div>

                      <div className="text-lg font-mono font-bold text-black tracking-widest mb-6">
                        {profile.clearancePass.passId}
                      </div>

                      <div className="space-y-3 text-left bg-gray-50 rounded-2xl p-5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Role</span>
                          <span className="font-medium text-gray-900">{profile.user.role}</span>
                        </div>
                        {profile.user.phone && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-900">{profile.user.phone}</span>
                          </div>
                        )}
                        {profile.user.collegeDept && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Dept</span>
                            <span className="font-medium text-gray-900">{profile.user.collegeDept}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Issued</span>
                          <span className="font-medium text-gray-900">
                            {new Date(profile.clearancePass.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-gray-700 mb-2">No Pass Yet</h3>
                    <p className="text-sm text-gray-500">Complete your profile to get your digital festival pass.</p>
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-6 max-w-xs leading-relaxed">
                  Show this QR code to the volunteers at the venue to mark your attendance.
                </p>
              </motion.div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Announcements</h2>
                {announcements.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No announcements yet.</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-serif text-lg text-black">{ann.title}</h3>
                          {ann.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-medium uppercase">Urgent</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{ann.body}</p>
                        <div className="text-xs text-gray-400">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                activeTab === tab.id ? 'text-black' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium uppercase tracking-widest">{tab.label.replace('My ', '')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
