'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

import type { Viewer } from "@/lib/landing/auth-routing";
import { MobileNavigationController } from "./MobileNavigationController";
import { cn } from "@/lib/utils";

export interface SiteHeaderProps {
  viewer: Viewer;
}

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Events", href: "#featured-events" },
  { label: "Schedule", href: "#schedule" },
  { label: "Partners", href: "#partners-title" },
  { label: "FAQ", href: "#faq" },
] as const;

export function SiteHeader({ viewer }: SiteHeaderProps) {
  // states: "top", "floating", "hidden"
  const [navState, setNavState] = useState<"top" | "floating" | "hidden">("top");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    
    if (latest <= 40) {
      setNavState("top");
    } else if (latest > previous && latest > 100) {
      // Scrolling down
      setNavState("hidden");
    } else if (latest < previous) {
      // Scrolling up
      setNavState("floating");
    }
  });

  const isScrolled = navState === "floating";
  const isHidden = navState === "hidden";

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
      <motion.header 
        initial={false}
        animate={{
          width: isScrolled ? "min(95%, 65rem)" : "100%",
          y: isHidden ? -100 : (isScrolled ? 16 : 0),
          borderRadius: isScrolled ? "999px" : "0px",
          backgroundColor: isScrolled ? "rgba(8, 8, 10, 0.95)" : "rgba(8, 8, 10, 0.8)",
          boxShadow: isScrolled ? "0 20px 40px -10px rgba(0,0,0,0.5)" : "none",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "pointer-events-auto border border-transparent backdrop-blur-xl transition-colors overflow-hidden",
          isScrolled ? "border-white/10" : "border-b-white/10"
        )}
      >
        {/* Brand hairline echoing the logo's scarlet field */}
        <motion.span 
          aria-hidden="true" 
          animate={{ opacity: isScrolled ? 0 : 1 }}
          className="absolute inset-x-0 top-0 h-1.5 bg-primary" 
        />
        
        <div className={cn(
          "site-container flex items-center justify-between gap-4 transition-all duration-300",
          isScrolled ? "h-14 px-6" : "h-20 px-4 tablet:px-8"
        )}>
          {/* Logo / Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo.png"
              alt="Goa Startup Festival 2026"
              className={cn(
                "w-auto object-contain transition-all duration-300",
                isScrolled ? "h-7" : "h-10 tablet:h-12"
              )}
            />
            <span className="sr-only">GSF 2026</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden desktop:flex items-center gap-8"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "group relative font-bold transition-colors hover:text-accent",
                  isScrolled ? "text-xs text-white/80 py-1" : "text-sm text-white/60 py-2"
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                />
              </a>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden desktop:flex items-center gap-4">
            {viewer.authenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 group"
                aria-label="Dashboard"
              >
                {viewer.image ? (
                  <img
                    src={viewer.image}
                    alt=""
                    aria-hidden="true"
                    className={cn(
                      "rounded-pill object-cover border border-surface-alt group-hover:border-primary transition-all duration-300",
                      isScrolled ? "h-7 w-7" : "h-9 w-9"
                    )}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "flex items-center justify-center rounded-pill bg-primary text-surface border border-primary/20 transition-all duration-300",
                      isScrolled ? "h-7 w-7 text-xs font-bold" : "h-9 w-9 text-sm font-bold"
                    )}
                  >
                    {viewer.name ? viewer.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "font-bold transition-colors hover:text-primary",
                    isScrolled ? "text-xs text-ink" : "text-sm text-ink-muted"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    "inline-flex items-center justify-center rounded-full bg-primary font-bold text-surface shadow-sm transition-colors hover:bg-primary-strong",
                    isScrolled ? "px-4 py-1.5 text-xs" : "px-6 py-2.5 text-sm"
                  )}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger trigger */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            className="desktop:hidden flex items-center justify-center min-h-touch min-w-touch text-ink-muted transition-colors hover:text-ink"
            data-mobile-nav-trigger
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <MobileNavigationController viewer={viewer} />
    </div>
  );
}
