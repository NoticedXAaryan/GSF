"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Users, Settings, Plus, Check, X, Search, ChevronRight, MoreVertical, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'applications'>('applications');

  const applications = [
    { id: 1, name: 'Rahul Desai', studentId: 'PU-2026-0834', event: 'Startup Idea Competition', status: 'pending', appliedAt: '2 hours ago' },
    { id: 2, name: 'Sneha Patel', studentId: 'PU-2026-0512', event: 'Startup Idea Competition', status: 'pending', appliedAt: '3 hours ago' },
    { id: 3, name: 'Karan Singh', studentId: 'PU-2026-0921', event: 'Masterclass 1', status: 'pending', appliedAt: '5 hours ago' },
    { id: 4, name: 'Anjali Verma', studentId: 'PU-2026-0344', event: 'Fireside Chat', status: 'pending', appliedAt: '1 day ago' },
  ];

  const events = [
    { id: 1, title: 'Inaugural Ceremony & Signature Talk 1', date: '2nd Sept 2026', time: '10:00 AM', location: 'Seminar Hall', attendees: 145, capacity: 200 },
    { id: 2, title: 'Startup Ecosystem Connect & Masterclass 1', date: '2nd Sept 2026', time: '11:45 AM', location: 'VC Office / Room 2', attendees: 45, capacity: 50 },
    { id: 3, title: 'Startup Idea Competition Final Pitching', date: '3rd Sept 2026', time: '11:30 AM', location: 'Seminar Hall', attendees: 12, capacity: 20 },
  ];

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
            <button 
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'applications' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span className="font-medium text-sm">Applications</span>
              </div>
              <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">12</span>
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'events' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium text-sm">Manage Events</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white overflow-hidden relative border border-white/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">System Admin</div>
              <div className="text-xs text-gray-400">Management</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-[#050505] text-white px-6 pt-12 pb-4 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif">Admin Portal</h1>
            <p className="text-sm text-gray-400">Management</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden relative border border-white/20">
             <Settings className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'applications' ? (
            <motion.div 
              key="applications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                 <div>
                   <h2 className="text-2xl font-serif text-black mb-1">Pending Applications</h2>
                   <p className="text-sm text-gray-500">Review and approve student requests to join events.</p>
                 </div>
                 
                 <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm shadow-sm"
                    />
                 </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-widest text-[10px] font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Event Requested</th>
                        <th className="px-6 py-4">Applied</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{app.name}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{app.studentId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                              {app.event}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs">
                            {app.appliedAt}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {applications.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No pending applications.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                 <div>
                   <h2 className="text-2xl font-serif text-black mb-1">Manage Events</h2>
                   <p className="text-sm text-gray-500">Create and monitor event capacities.</p>
                 </div>
                 
                 <button className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Event</span>
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:border-gray-300 transition-colors">
                       <button className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                       
                       <h3 className="font-serif text-xl text-black mb-4 pr-6 leading-tight">{event.title}</h3>
                       
                       <div className="space-y-2 text-sm text-gray-600 mb-6">
                          <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> {event.date}</div>
                          <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {event.time}</div>
                          <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {event.location}</div>
                       </div>
                       
                       <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Capacity</span>
                             <span className="text-sm font-medium text-black">{event.attendees} / {event.capacity}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${event.attendees / event.capacity > 0.9 ? 'bg-red-500' : 'bg-green-500'}`}
                               style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-gray-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('applications')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'applications' ? 'text-white' : 'text-gray-500'}`}
          >
            <div className="relative">
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#050505]"></span>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest">Approvals</span>
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'events' ? 'text-white' : 'text-gray-500'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Events</span>
          </button>
        </div>
      </div>
    </div>
  );
}
