'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, History, LogOut, Loader2, CheckCircle, XCircle, AlertTriangle, Search, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type Event = {
  id: string;
  name: string;
};

type ScanResult = {
  id: string; // just an arbitrary id for the list
  timestamp: Date;
  status: 'allowed' | 'denied' | 'already_checked_in';
  userName?: string;
  eventName: string;
  reason?: string;
};

export default function VolunteerDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventsLoading, setEventsLoading] = useState(true);
  
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  
  // Manual entry state
  const [manualToken, setManualToken] = useState('');
  
  // Current scan result (for the popup card)
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // 1. Auth check
  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/login');
      } else if (!['Volunteer', 'Admin', 'Lead'].includes(session.user.role)) {
        router.push('/dashboard/user');
      }
    }
  }, [session, isPending, router]);

  // 2. Fetch events
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setEventsLoading(false);
      }
    }
    
    if (session) {
      fetchEvents();
    }
  }, [session]);

  // 3. Clear current result after 5s
  useEffect(() => {
    if (currentResult) {
      const timer = setTimeout(() => {
        setCurrentResult(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentResult]);

  // 4. Scanner Lifecycle
  useEffect(() => {
    let mounted = true;
    
    const startScanner = async () => {
      if (activeTab !== 'scanner' || !selectedEventId || isProcessing) {
        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
            setIsScanning(false);
          } catch (err) {
            console.error('Error stopping scanner', err);
          }
        }
        return;
      }
      
      // We only start if it's not already scanning
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }
      
      if (!scannerRef.current.isScanning) {
        try {
          await scannerRef.current.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250 },
            handleScanSuccess,
            (errorMessage) => {
              // We ignore normal frame errors as they are frequent
            }
          );
          if (mounted) {
            setIsScanning(true);
            setCameraPermission(true);
            setScanError(null);
          }
        } catch (err: any) {
          console.error('Error starting scanner:', err);
          if (mounted) {
            setIsScanning(false);
            setCameraPermission(false);
            setScanError(err?.message || 'Failed to access camera.');
          }
        }
      }
    };
    
    // We delay starting slightly to ensure the DOM div is ready
    const timerId = setTimeout(() => {
      startScanner();
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timerId);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
        setIsScanning(false);
      }
    };
  }, [activeTab, selectedEventId, isProcessing]);

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return; // Prevent double scans
    
    await processToken(decodedText);
  };
  
  const processToken = async (token: string) => {
    if (!selectedEventId) {
      alert("Please select an event first.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token, eventId: selectedEventId })
      });
      
      const data = await res.json();
      
      const event = events.find(e => e.id === selectedEventId);
      
      const newResult: ScanResult = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        status: res.ok ? 'allowed' : (data.code === 'ALREADY_SCANNED' ? 'already_checked_in' : 'denied'),
        userName: data.user?.name || data.userName || 'Unknown User',
        eventName: event?.name || 'Unknown Event',
        reason: data.error || 'Access Denied',
      };
      
      // Add to history
      setScanHistory(prev => [newResult, ...prev]);
      
      // Show card
      setCurrentResult(newResult);
      
    } catch (err) {
      console.error('Scan error:', err);
      const newResult: ScanResult = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        status: 'denied',
        eventName: events.find(e => e.id === selectedEventId)?.name || 'Unknown',
        reason: 'Network or server error',
      };
      setScanHistory(prev => [newResult, ...prev]);
      setCurrentResult(newResult);
    } finally {
      setIsProcessing(false);
      setManualToken('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      processToken(manualToken.trim());
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 md:flex-row flex-col">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900">Volunteer</h1>
          <p className="text-sm text-zinc-500 mt-1 truncate">{session.user.name}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scanner' 
                ? 'bg-zinc-100 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <ScanLine className="h-5 w-5" />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-zinc-100 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <History className="h-5 w-5" />
            Scan History
          </button>
        </nav>
        
        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {activeTab === 'scanner' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-3xl font-bold text-zinc-900 mb-6">Scan Pass</h2>
            
            {/* Event Selector */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm mb-6">
              <label htmlFor="event-select" className="block text-sm font-medium text-zinc-700 mb-2">
                Scanning For Event
              </label>
              {eventsLoading ? (
                <div className="flex items-center gap-2 text-zinc-500 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading events...
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-red-600 py-2">No active events found.</p>
              ) : (
                <select
                  id="event-select"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  disabled={isProcessing}
                  className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm py-2 px-3 border outline-none disabled:opacity-50"
                >
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Result Popup */}
            <AnimatePresence>
              {currentResult && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  {currentResult.status === 'allowed' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                      <div className="bg-green-100 p-2 rounded-full mt-0.5">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-green-900">Checked In</h3>
                        <p className="text-green-800 mt-1">{currentResult.userName}</p>
                        <p className="text-green-700 text-sm mt-0.5">{currentResult.eventName}</p>
                      </div>
                    </div>
                  )}
                  {currentResult.status === 'already_checked_in' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                      <div className="bg-yellow-100 p-2 rounded-full mt-0.5">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-yellow-900">Already Checked In</h3>
                        <p className="text-yellow-800 mt-1">{currentResult.userName}</p>
                        <p className="text-yellow-700 text-sm mt-0.5">{currentResult.eventName}</p>
                      </div>
                    </div>
                  )}
                  {currentResult.status === 'denied' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                      <div className="bg-red-100 p-2 rounded-full mt-0.5">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-red-900">Access Denied</h3>
                        <p className="text-red-800 mt-1">{currentResult.reason}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanner Area */}
            <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg relative aspect-square sm:aspect-video flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 z-10 bg-zinc-900/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#E2B258]" />
                  <p className="font-medium text-lg">Processing scan...</p>
                </div>
              )}
              
              {cameraPermission === false && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <XCircle className="h-12 w-12 mb-3 text-red-500/80" />
                  <p className="font-medium text-white mb-2">Camera Access Denied</p>
                  <p className="text-sm max-w-xs">{scanError || 'Please allow camera permissions in your browser to use the scanner.'}</p>
                </div>
              )}
              
              {!selectedEventId && (
                <div className="absolute inset-0 z-10 bg-zinc-900/90 flex flex-col items-center justify-center text-zinc-400">
                  <Search className="h-10 w-10 mb-4 opacity-50" />
                  <p>Select an event to start scanning</p>
                </div>
              )}

              {/* The div where html5-qrcode mounts */}
              <div id="qr-reader" className="w-full h-full object-cover"></div>
            </div>

            {/* Manual Entry */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="h-5 w-5 text-zinc-400" />
                <h3 className="text-lg font-medium text-zinc-900">Manual Entry</h3>
              </div>
              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Pass ID or Token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  disabled={isProcessing || !selectedEventId}
                  className="flex-1 rounded-md border-zinc-300 shadow-sm focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm py-2.5 px-3 border outline-none disabled:opacity-50 disabled:bg-zinc-50"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !manualToken.trim() || !selectedEventId}
                  className="bg-zinc-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col w-full">
            <h2 className="font-serif text-3xl font-bold text-zinc-900 mb-6">Scan History</h2>
            <p className="text-zinc-500 mb-6 text-sm">Showing scans from this session.</p>
            
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              {scanHistory.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-zinc-900 mb-1">No history yet</p>
                  <p className="text-sm">Scans you perform will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-zinc-200">
                  {scanHistory.map((scan) => (
                    <li key={scan.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          scan.status === 'allowed' ? 'bg-green-100 text-green-600' :
                          scan.status === 'already_checked_in' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {scan.status === 'allowed' && <CheckCircle className="h-5 w-5" />}
                          {scan.status === 'already_checked_in' && <AlertTriangle className="h-5 w-5" />}
                          {scan.status === 'denied' && <XCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">
                            {scan.userName || scan.reason || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-zinc-500 mt-0.5">
                            <span>{scan.eventName}</span>
                            <span>•</span>
                            <time dateTime={scan.timestamp.toISOString()}>
                              {scan.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </time>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          scan.status === 'allowed' ? 'bg-green-100 text-green-800' :
                          scan.status === 'already_checked_in' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {scan.status === 'allowed' ? 'Allowed' : 
                           scan.status === 'already_checked_in' ? 'Already Checked In' : 'Denied'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
