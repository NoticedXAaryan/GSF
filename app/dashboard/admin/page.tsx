"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Calendar, Users as UsersIcon, Megaphone, 
  LogOut, Loader2, Check, X, Plus, Search, MapPin, Clock, MoreVertical, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'events' | 'users' | 'announcements'>('overview');
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/dashboard');
    } else if (session && (session.user.role ?? '') !== 'Admin' && (session.user.role ?? '') !== 'Lead') {
      router.push('/dashboard/user');
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-[#050505] text-white z-50">
        <div className="p-6">
          <div className="text-xl font-serif tracking-tight font-bold flex items-center mb-10">
            <span className="w-5 h-5 rounded-full bg-white block mr-1"></span>
            <span className="w-5 h-5 rounded-full bg-white block -ml-2.5 mix-blend-multiply opacity-50"></span>
            <span className="ml-2">Admin Portal</span>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'applications', icon: FileText, label: 'Applications' },
              { id: 'events', icon: Calendar, label: 'Events' },
              { id: 'users', icon: UsersIcon, label: 'Users' },
              { id: 'announcements', icon: Megaphone, label: 'Announcements' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors w-full px-4 py-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
          <div className="flex items-center space-x-3 px-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white overflow-hidden relative border border-white/20">
              <span className="font-bold">{session.user.name?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{session.user.name}</div>
              <div className="text-xs text-gray-400">{session.user.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-[#050505] text-white px-6 pt-12 pb-4 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif">Admin Portal</h1>
            <p className="text-sm text-gray-400">{session.user.role}</p>
          </div>
          <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden relative border border-white/20">
             <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" />}
          {activeTab === 'applications' && <ApplicationsTab key="applications" />}
          {activeTab === 'events' && <EventsTab key="events" />}
          {activeTab === 'users' && <UsersTab key="users" />}
          {activeTab === 'announcements' && <AnnouncementsTab key="announcements" />}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-gray-800 pb-safe z-50 overflow-x-auto">
        <div className="flex items-center h-16 min-w-max px-2 space-x-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'applications', icon: FileText, label: 'Apps' },
            { id: 'events', icon: Calendar, label: 'Events' },
            { id: 'users', icon: UsersIcon, label: 'Users' },
            { id: 'announcements', icon: Megaphone, label: 'Announce' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// OVERVIEW TAB
// ----------------------------------------------------------------------
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-black mb-1">Overview</h2>
        <p className="text-sm text-gray-500">Platform statistics and metrics.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Events', value: stats.totalEvents },
            { label: 'Applications', value: stats.totalApplications },
            { label: 'Passes', value: stats.totalPasses },
            { label: 'Check-Ins', value: stats.totalCheckIns },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-sm text-gray-500 font-medium mb-2">{stat.label}</div>
              <div className="text-3xl font-serif text-black">{stat.value || 0}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">Failed to load statistics.</div>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// APPLICATIONS TAB
// ----------------------------------------------------------------------
function ApplicationsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-black mb-1">Pending Applications</h2>
        <p className="text-sm text-gray-500">Review and approve student requests per event.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : events.length > 0 ? (
        <div className="space-y-8">
          {events.map(event => (
            <EventApplicationsSection key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">No events found.</div>
      )}
    </motion.div>
  );
}

function EventApplicationsSection({ event }: { event: any }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${event.id}/applications?status=pending`)
      .then(res => res.json())
      .then(data => {
        setApps(data.applications || data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [event.id]);

  const handleAction = async (appId: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/events/${event.id}/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status, notes: '' })
      });
      if (res.ok) {
        setApps(apps.filter(a => a.id !== appId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Loading {event.name}...</div>;
  }

  if (apps.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-serif text-lg text-black">{event.name || event.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-gray-500 uppercase tracking-widest text-[10px] font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Applicant</th>
              <th className="px-6 py-4">Applied</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{app.user?.name || app.name || 'Unknown'}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{app.user?.email || app.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => handleAction(app.id, 'accepted')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction(app.id, 'rejected')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// EVENTS TAB
// ----------------------------------------------------------------------
function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name'),
      date: formData.get('date'),
      venue: formData.get('venue'),
      capacity: Number(formData.get('capacity')),
      status: formData.get('status')
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowForm(false);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-serif text-black mb-1">Manage Events</h2>
          <p className="text-sm text-gray-500">Create and monitor events.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Create Event'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input name="name" required className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="Enter name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input name="date" type="datetime-local" required className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input name="venue" required className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="Location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input name="capacity" type="number" required className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              Save Event
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:border-gray-300 transition-colors">
              <button 
                onClick={() => handleArchive(event.id)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                title="Archive Event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <h3 className="font-serif text-xl text-black mb-4 pr-6 leading-tight">{event.name || event.title}</h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</div>
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {event.venue || event.location}</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> Status: {event.status || 'unknown'}</div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Capacity</span>
                  <span className="text-sm font-medium text-black">{event.attendees || 0} / {event.capacity}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${((event.attendees || 0) / event.capacity) > 0.9 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(((event.attendees || 0) / event.capacity) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// USERS TAB
// ----------------------------------------------------------------------
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-black mb-1">Manage Users</h2>
        <p className="text-sm text-gray-500">View and update user roles.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-widest text-[10px] font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Lead">Lead</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// ANNOUNCEMENTS TAB
// ----------------------------------------------------------------------
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchAnnouncements = () => {
    fetch('/api/admin/announcements')
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data.announcements || data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get('title'),
      body: formData.get('body'),
      audience: formData.get('audience') || 'all',
      priority: formData.get('priority') || 'normal'
    };

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowForm(false);
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-serif text-black mb-1">Announcements</h2>
          <p className="text-sm text-gray-500">Broadcast messages to users.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'New Broadcast'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" required className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
            <textarea name="body" required rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="Write your message..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select name="audience" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm">
                <option value="all">All Users</option>
                <option value="attendees">Attendees Only</option>
                <option value="volunteers">Volunteers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              Send Broadcast
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
              <button 
                onClick={() => handleDelete(ann.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete Announcement"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${ann.priority === 'urgent' || ann.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {ann.priority || 'normal'}
                </span>
                <span className="text-xs text-gray-500">
                  {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Just now'}
                </span>
              </div>
              <h3 className="font-serif text-lg text-black mb-2">{ann.title}</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{ann.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">No announcements found.</div>
      )}
    </motion.div>
  );
}
