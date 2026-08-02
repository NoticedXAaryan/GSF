"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { Viewer } from "@/lib/landing/auth-routing";
import { FESTIVAL_STATISTICS } from "@/lib/landing/content";

interface HeroSectionProps {
  viewer: Viewer;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function HeroSection({ viewer }: HeroSectionProps) {
  const cta = viewer.authenticated
    ? { href: viewer.dashboardPath ?? "/dashboard/user", label: "Go to Dashboard" }
    : { href: "/signup", label: "Register Now" };

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-screen min-h-dvh items-center overflow-hidden bg-[#08080a] bg-noise section-padding"
    >
      <motion.div
        className="site-container relative z-10 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/80"
        >
          <Sparkles aria-hidden="true" className="text-accent" size={16} />
          PIERC · Parul University · PU Goa
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          id="hero-title"
          className="mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-white tablet:text-6xl desktop:text-7xl"
        >
          Goa Startup Festival{" "}
          <span className="text-accent">2026</span>
        </motion.h1>

        {/* Brand rule */}
        <motion.div
          variants={itemVariants}
          aria-hidden="true"
          className="brand-rule mt-10 w-32 text-accent/50"
        />

        <motion.p
          variants={itemVariants}
          className="mt-10 max-w-2xl text-xl font-bold text-white/90 tablet:text-2xl"
        >
          Where Ideas Become Enterprises
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-2xl text-lg text-white/60 leading-relaxed"
        >
          Two days of keynotes, workshops, competitions, and showcases bringing
          founders, investors, mentors, and students together in South Goa.
        </motion.p>

        {/* Date and venue */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-bold text-white tablet:flex-row tablet:gap-8"
        >
          <span className="inline-flex items-center gap-2.5">
            <CalendarDays aria-hidden="true" className="text-accent" size={20} />
            2–3 September 2026
          </span>
          <span aria-hidden="true" className="hidden h-5 w-px bg-white/20 tablet:block" />
          <span className="inline-flex items-center gap-2.5 text-center tablet:text-left">
            <MapPin aria-hidden="true" className="text-accent" size={20} />
            Parul University Goa Campus, Betul, South Goa
          </span>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex w-full flex-col items-center gap-5 tablet:w-auto tablet:flex-row"
        >
          <Link
            href={cta.href}
            className="group inline-flex min-h-touch min-w-touch w-full items-center justify-center gap-2 rounded-xl bg-primary px-10 py-4 text-lg font-extrabold text-white transition-all hover:bg-primary-strong tablet:w-auto"
          >
            {cta.label}
            <ArrowRight
              aria-hidden="true"
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href="#schedule"
            className="inline-flex min-h-touch w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-10 py-4 text-lg font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10 tablet:w-auto"
          >
            Explore Schedule
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-20 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8"
        >
          <dl className="grid w-full grid-cols-2 gap-8 desktop:grid-cols-4">
            {FESTIVAL_STATISTICS.map((statistic) => (
              <div key={statistic.label} className="text-center">
                <dd className="text-4xl font-black tracking-tighter text-white">
                  {statistic.value}
                </dd>
                <dt className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                  {statistic.label}
                </dt>
              </div>
            ))}
          </dl>
        </motion.div>
      </motion.div>
    </section>
  );
}
