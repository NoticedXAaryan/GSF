"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

function subscribeToMotionPreference(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getMotionPreferenceServer() {
  return false;
}

export default function Hero() {
  const { user } = useAuth();
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getMotionPreferenceServer
  );

  const fadeUp = reducedMotion
    ? { initial: {}, animate: {}, transition: {} }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" as const },
      };

  const fadeIn = (delay: number) =>
    reducedMotion
      ? { initial: {}, animate: {}, transition: {} }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, ease: "easeOut" as const, delay },
        };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0515] to-[#0a0a0a]"
        aria-hidden="true"
      />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.08)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 md:px-10 max-w-4xl mx-auto">
        {/* Heading */}
        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white"
        >
          Goa Startup Festival{" "}
          <span className="text-accent-pink">2026</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...fadeIn(0.5)}
          className="mt-4 md:mt-6 text-lg md:text-xl lg:text-2xl text-white/70 font-medium"
        >
          Where Ideas Become Enterprises
        </motion.p>

        {/* Date & Location */}
        <motion.div
          {...fadeIn(0.6)}
          className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm md:text-base text-white/60"
        >
          <span className="inline-flex items-center gap-2">
            <Calendar size={18} className="text-accent-pink" aria-hidden="true" />
            2–3 September 2026
          </span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={18} className="text-accent-pink" aria-hidden="true" />
            Parul University Goa Campus, Betul, South Goa
          </span>
        </motion.div>

        {/* CTA Button */}
        <motion.div {...fadeIn(0.7)} className="mt-8 md:mt-10">
          <Link href={user ? "/dashboard" : "/signup"}>
            <Button variant="primary" size="lg" className="px-8 md:px-10 text-base md:text-lg">
              {user ? "Go to Dashboard" : "Register Now"}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
