'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { authClient } from '@/lib/auth-client';
import { AnimatePresence, motion } from 'motion/react';

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT', href: '/#about' },
  { label: 'EVENTS', href: '/#events' },
  { label: 'GALLERY', href: '/#gallery' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isVolunteer } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* ── Fixed Top Bar ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          {/* Logo — text only, matching EVONTÉ "EVNT" style */}
          <Link href="/" className="font-display font-bold text-[22px] tracking-[0.12em] uppercase text-white">
            GSF<span className="text-accent-pink">.</span>
          </Link>

          {/* Center nav links — desktop */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-mono text-[11px] tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right — CTA */}
          <div className="hidden lg:flex items-center gap-5">
            {user ? (
              <>
                {isVolunteer && (
                  <Link
                    href="/volunteer"
                    className="font-mono text-[11px] tracking-[0.2em] text-accent-pink hover:text-white transition-colors"
                  >
                    SCANNER
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="font-mono text-[11px] tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                >
                  DASHBOARD
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-mono text-[11px] tracking-[0.2em] text-white/50 hover:text-accent-pink transition-colors"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                href="/register"
                className="border border-white/20 px-6 py-2.5 font-mono text-[11px] tracking-[0.2em] text-white hover:bg-accent-pink hover:border-accent-pink transition-all duration-300"
              >
                REGISTER
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col"
          >
            <div className="px-6 h-20 flex items-center justify-between">
              <span className="font-display font-bold text-[22px] tracking-[0.12em] uppercase text-white">
                GSF<span className="text-accent-pink">.</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 p-2">
                <X size={26} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl font-bold uppercase tracking-wider text-white/60 hover:text-accent-pink transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="px-6 pb-12 flex flex-col gap-4">
              {user ? (
                <>
                  {isVolunteer && (
                    <Link
                      href="/volunteer"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full text-center py-4 bg-accent-pink/10 text-accent-pink hover:bg-accent-pink/20 border-accent-pink/30"
                    >
                      SCANNER
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full text-center py-4"
                  >
                    DASHBOARD
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="text-center text-white/40 font-mono text-sm uppercase tracking-wider py-3"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-center py-4"
                >
                  REGISTER
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
