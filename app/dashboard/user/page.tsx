"use client";

import { useState } from 'react';
import Image from 'next/image';
import { QrCode, Calendar, CheckCircle2, Clock, MapPin, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'qr'>('events');

  const openEvents = [
    { id: 1, title: 'Inaugural Ceremony & Signature Talk', date: '2nd Sept, 10:00 AM', location: 'Seminar Hall', status: 'open' },
    { id: 2, title: 'Startup Idea Competition', date: '3rd Sept, 11:30 AM', location: 'Seminar Hall', status: 'open' },
  ];

  const appliedEvents = [
    { id: 3, title: 'Startup Ecosystem Connect & Masterclass', date: '2nd Sept, 11:45 AM', location: 'VC Office', status: 'approved' },
    { id: 4, title: 'Fireside Chat with Investors', date: '2nd Sept, 2:30 PM', location: 'Seminar Hall', status: 'pending' },
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
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'events' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium text-sm">My Events</span>
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'qr' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <QrCode className="w-5 h-5" />
              <span className="font-medium text-sm">My Pass</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden relative">
              <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" fill className="object-cover" alt="Profile" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Alex Student</div>
              <div className="text-xs text-gray-500">Computer Science</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white px-6 pt-12 pb-4 border-b border-gray-200 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-black">Hello, Alex</h1>
            <p className="text-sm text-gray-500">Ready for Startup Fest?</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative border border-gray-200">
             <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" fill className="object-cover" alt="Profile" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'events' ? (
            <motion.div 
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-10">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Your Applications</h2>
                <div className="space-y-4">
                  {appliedEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="font-serif text-lg text-black mb-1">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {event.date}</span>
                          <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {event.location}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                        {event.status === 'approved' ? (
                           <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center">
                             <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
                           </div>
                        ) : (
                           <div className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium flex items-center">
                             <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                           </div>
                        )}
                        {event.status === 'approved' && (
                           <button onClick={() => setActiveTab('qr')} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                              <QrCode className="w-4 h-4" />
                           </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Open Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm group hover:border-gray-300 transition-colors cursor-pointer flex flex-col justify-between min-h-[160px]">
                      <div>
                        <h3 className="font-serif text-lg text-black mb-2">{event.title}</h3>
                        <div className="space-y-1 text-xs text-gray-500 mb-4">
                          <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {event.date}</div>
                          <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {event.location}</div>
                        </div>
                      </div>
                      <button className="w-full py-2.5 bg-black text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors mt-auto">
                        Apply to Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="qr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center max-w-md mx-auto pt-4 md:pt-12"
            >
              <div className="w-full bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white" />
                
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden relative mb-4">
                    <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" fill className="object-cover" alt="Profile" referrerPolicy="no-referrer" />
                  </div>
                  
                  <h2 className="text-2xl font-serif text-black mb-1">Alex Student</h2>
                  <p className="text-sm text-gray-500 mb-8">alex.s@student.parul.ac.in</p>
                  
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm inline-block mb-8">
                     <Image 
                       src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                       width={200} 
                       height={200} 
                       alt="Personal QR Code" 
                       className="opacity-90"
                     />
                  </div>
                  
                  <div className="space-y-3 text-left bg-gray-50 rounded-2xl p-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Student ID</span>
                      <span className="font-medium text-gray-900">PU-2026-0492</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Mobile</span>
                      <span className="font-medium text-gray-900">+91 98765 43210</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Access Level</span>
                      <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">Approved (2 Events)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-6 max-w-xs leading-relaxed">
                Show this QR code to the volunteers at the venue to mark your attendance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'events' ? 'text-black' : 'text-gray-400'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Events</span>
          </button>
          <button 
            onClick={() => setActiveTab('qr')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'qr' ? 'text-black' : 'text-gray-400'}`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
