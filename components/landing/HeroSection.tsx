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
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
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
      className="relative flex min-h-screen min-h-dvh items-center overflow-hidden bg-hero section-padding"
    >
      {/* Animated noise overlay for organic texture */}
      <div className="absolute inset-0 z-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <motion.div 
        className="site-container relative z-10 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p 
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-pill glass-panel px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-surface/90 shadow-lg"
        >
          <Sparkles aria-hidden="true" className="text-accent" size={16} />
          PIERC · Parul University · PU Goa
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          id="hero-title"
          className="mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-surface tablet:text-6xl desktop:text-7xl drop-shadow-2xl"
        >
          Goa Startup Festival <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-strong">2026</span>
        </motion.h1>

        {/* Triple rule from the logo */}
        <motion.div
          variants={itemVariants}
          aria-hidden="true"
          className="brand-rule mt-10 w-32 text-accent/50"
        />

        <motion.p variants={itemVariants} className="mt-10 max-w-2xl text-xl font-bold text-surface/90 tablet:text-2xl drop-shadow-md">
          Where Ideas Become Enterprises
        </motion.p>
        
        <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-lg text-surface/70 leading-relaxed">
          Two days of keynotes, workshops, competitions, and showcases bringing
          founders, investors, mentors, and students together in South Goa.
        </motion.p>

        {/* Date and venue (Glass Card) */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 flex flex-col items-center gap-4 text-sm font-bold text-surface tablet:flex-row tablet:gap-8 glass-panel px-8 py-5 rounded-2xl shadow-xl"
        >
          <span className="inline-flex items-center gap-2.5">
            <CalendarDays aria-hidden="true" className="text-accent" size={20} />
            2–3 September 2026
          </span>
          <span
            aria-hidden="true"
            className="hidden h-5 w-px bg-surface/20 tablet:block"
          />
          <span className="inline-flex items-center gap-2.5 text-center tablet:text-left">
            <MapPin aria-hidden="true" className="text-accent" size={20} />
            Parul University Goa Campus, Betul, South Goa
          </span>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="mt-12 flex w-full flex-col items-center gap-5 tablet:w-auto tablet:flex-row">
          <Link
            href={cta.href}
            className="group relative inline-flex min-h-touch min-w-touch w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-strong px-10 py-4 text-lg font-extrabold text-white shadow-[0_0_40px_rgba(216,31,38,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(216,31,38,0.6)] tablet:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{cta.label}</span>
            <ArrowRight
              aria-hidden="true"
              size={20}
              className="relative z-10 transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href="#schedule"
            className="glass-button inline-flex min-h-touch w-full items-center justify-center rounded-xl px-10 py-4 text-lg font-bold text-surface tablet:w-auto hover:text-accent transition-colors"
          >
            Explore Schedule
          </a>
        </motion.div>

        {/* Impact strip — unified glass panel */}
        <motion.div variants={itemVariants} className="mt-20 w-full max-w-4xl glass-panel rounded-3xl p-8 shadow-2xl">
          <dl className="grid w-full grid-cols-2 gap-8 desktop:grid-cols-4">
            {FESTIVAL_STATISTICS.map((statistic) => (
              <div key={statistic.label} className="text-center group">
                <dd className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 group-hover:to-accent transition-all duration-500">
                  {statistic.value}
                </dd>
                <dt className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-surface/50">
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
