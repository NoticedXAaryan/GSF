"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { AnimatePresence, motion } from "motion/react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Schedule", href: "#schedule" },
  { label: "FAQ", href: "#faq" },
];

const HEADER_HEIGHT = 80;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: sessionData, isPending } = useSession();

  const isAuthenticated = !isPending && !!sessionData?.user;

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Only handle hash links for on-page sections
      if (!href.startsWith("#")) return;
      e.preventDefault();
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const top =
          target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
        window.scrollTo({ top, behavior: "smooth" });
      }
      closeMobileMenu();
    },
    [closeMobileMenu]
  );

  return (
    <>
      {/* Fixed Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo / Title */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-gray-900 min-h-[44px] min-w-[44px] flex items-center"
          >
            GSF 2026
          </Link>

          {/* Desktop Navigation Links (hidden below 1024px) */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Links */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-accent-pink text-white text-sm font-medium px-5 min-h-[44px] hover:bg-accent-pink/90 transition-colors duration-200 shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Icon */}
          <button
            className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Overlay Header */}
            <div className="px-4 sm:px-6 h-20 flex items-center justify-between border-b border-gray-200/60">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                GSF 2026
              </span>
              <button
                onClick={closeMobileMenu}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Overlay Navigation Links */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-2xl font-semibold text-gray-900 hover:text-accent-pink transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Overlay Auth Section */}
            <div className="px-6 pb-10 flex flex-col gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center rounded-md bg-accent-pink text-white text-base font-medium py-3 px-5 min-h-[44px] hover:bg-accent-pink/90 transition-colors duration-200 shadow-sm w-full"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="text-center text-base font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center justify-center rounded-md bg-accent-pink text-white text-base font-medium py-3 px-5 min-h-[44px] hover:bg-accent-pink/90 transition-colors duration-200 shadow-sm w-full"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
