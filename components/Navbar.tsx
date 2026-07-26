'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { authClient } from '@/lib/auth-client';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none">
      <div className={`mx-auto w-full transition-all duration-300 pointer-events-auto ${
        scrolled ? 'py-0' : 'py-4 md:py-8 px-4 md:px-12'
      }`}>
        <div className={`flex items-center justify-between mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'bg-ink-deep/90 backdrop-blur-2xl border-b border-white/10 px-6 md:px-12 py-4' 
            : 'bg-transparent border-transparent max-w-7xl'
        }`}>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group min-h-[48px]">
            <div className="w-10 h-10 rounded-sm bg-hyper-cyan flex items-center justify-center group-hover:scale-95 transition-transform duration-300">
              <Rocket className="w-5 h-5 text-ink-navy" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block text-white">
              GSF <span className="text-hyper-cyan">2026</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-sm font-semibold tracking-wide text-white/50 hover:text-white transition-colors">HOME</Link>
            <Link href="/dashboard" className="text-sm font-semibold tracking-wide text-white/50 hover:text-white transition-colors">DASHBOARD</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold text-white"
                >
                  <UserCircle className="w-4 h-4 text-hyper-cyan" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 hover:text-signal-red hover:bg-signal-red/10 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center px-8 py-3 min-h-[48px] rounded-full bg-white text-ink-navy hover:bg-hyper-cyan transition-all duration-300 text-sm font-bold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
