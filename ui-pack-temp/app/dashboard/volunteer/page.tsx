"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ScanLine, History, Users, CheckCircle2, Search, Calendar, ChevronDown, Camera, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
  const [selectedEvent, setSelectedEvent] = useState('Inaugural Ceremony');
  const [isScanning, setIsScanning] = useState(false);

  const scanHistory = [
    { id: 1, name: 'Alex Student', time: '10:05 AM', status: 'verified', studentId: 'PU-2026-0492' },
    { id: 2, name: 'Priya Sharma', time: '10:02 AM', status: 'verified', studentId: 'PU-2026-0128' },
    { id: 3, name: 'Rahul Desai', time: '09:58 AM', status: 'verified', studentId: 'PU-2026-0834' },
    { id: 4, name: 'Neha Gupta', time: '09:55 AM', status: 'rejected', studentId: 'PU-2026-0211' },
  ];

  const handleScanMock = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('Mock: Scanned successfully! Alex Student verified for Inaugural Ceremony.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          <div className="text-xl font-serif tracking-tight text-black font-bold flex items-center mb-10">
            <span className="w-5 h-5 rounded-full bg-black block mr-1"></span>
            <span className="w-5 h-5 rounded-full bg-black block -ml-2.5 mix-blend-multiply opacity-50"></span>
            <span className="ml-2">Volunteer Portal</span>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('scanner')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'scanner' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ScanLine className="w-5 h-5" />
              <span className="font-medium text-sm">Scanner</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'history' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <History className="w-5 h-5" />
              <span className="font-medium text-sm">Scan History</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden relative">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">John Vol</div>
              <div className="text-xs text-gray-500 text-purple-600 font-medium">Core Team</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white px-6 pt-12 pb-4 border-b border-gray-200 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-black">Volunteer</h1>
            <p className="text-sm text-gray-500">Scan & Verify</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center overflow-hidden relative border border-purple-100">
             <User className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-2xl mx-auto h-full min-h-[calc(100vh-140px)] md:min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'scanner' ? (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="mb-6 relative z-10">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">Current Event</label>
                <div className="relative">
                  <select 
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none font-medium shadow-sm"
                  >
                    <option value="Inaugural Ceremony">Inaugural Ceremony & Signature Talk 1</option>
                    <option value="Startup Ecosystem">Startup Ecosystem Connect</option>
                    <option value="Idea Competition">Idea Competition Final</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-[2rem] overflow-hidden relative shadow-2xl flex items-center justify-center">
                  
                  {isScanning ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                       <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                       <p className="text-white text-sm font-medium">Verifying Pass...</p>
                    </div>
                  ) : (
                    <>
                      {/* Fake camera feed background */}
                      <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center" />
                      
                      {/* Scanner Frame */}
                      <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-3xl overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                         <div className="w-full h-[2px] bg-green-400 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(74,222,128,1)]" />
                         
                         {/* Corner accents */}
                         <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
                         <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
                         <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
                         <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={handleScanMock}
                  disabled={isScanning}
                  className="mt-8 bg-black text-white px-8 py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tap to Scan (Demo)</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-serif text-black mb-1">Scan History</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-widest">Event: {selectedEvent}</p>
                 </div>
                 <div className="text-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[80px]">
                   <div className="text-2xl font-serif font-medium text-black leading-none mb-1">128</div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest">Checked In</div>
                 </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name or ID..." 
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm shadow-sm"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {scanHistory.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                           {record.status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-current rounded-full relative"><div className="absolute w-[2px] h-[12px] bg-current transform rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>}
                         </div>
                         <div>
                           <div className="font-medium text-sm text-gray-900">{record.name}</div>
                           <div className="text-xs text-gray-500">{record.studentId}</div>
                         </div>
                      </div>
                      <div className="text-xs text-gray-400 font-medium">{record.time}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                  <button className="text-xs font-medium text-gray-500 uppercase tracking-widest hover:text-black transition-colors">Load More</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'scanner' ? 'text-black' : 'text-gray-400'}`}
          >
            <ScanLine className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Scan</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'history' ? 'text-black' : 'text-gray-400'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">History</span>
          </button>
        </div>
      </div>
    </div>
  );
}
