"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import type { Viewer } from "@/lib/landing/auth-routing";
import { FESTIVAL_STATISTICS } from "@/lib/landing/content";
import { RocketImprints } from "./RocketImprints";

interface HeroSectionProps {
  viewer: Viewer;
}

const HERO_IMAGE = "/hero.jpg";

const TRACK_FILTERS = [
  { label: "Pitch Arena", href: "#featured-events" },
  { label: "Hackathon", href: "#featured-events" },
  { label: "Masterclasses", href: "#featured-events" },
  { label: "Showcase", href: "#featured-events" },
  { label: "Investor Panels", href: "#schedule" },
] as const;

const KNOCKOUT_CLASS =
  "bg-clip-text text-transparent bg-cover bg-center bg-no-repeat";

const KNOCKOUT_STYLE: React.CSSProperties = {
  backgroundImage: `url(${HERO_IMAGE})`,
  WebkitTextStroke: "1px rgba(0,0,0,0.14)",
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
};

export function HeroSection({ viewer }: HeroSectionProps) {
  const cta = viewer.authenticated
    ? { href: viewer.dashboardPath ?? "/dashboard/user", label: "Go to Dashboard" }
    : { href: "/signup", label: "Register Now" };

  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const background = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(216, 31, 38, 0.08), transparent 80%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!sectionRef.current) return;
    const { left, top } = sectionRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      id="hero"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-canvas min-h-screen"
    >
      {/* Reactive Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background }}
      />

      <RocketImprints />

      <div className="site-container relative z-10 pt-28 pb-14 tablet:pt-32 desktop:pt-40">
        <motion.div variants={container} initial="hidden" animate="visible">
          {/* ── Knockout headline ── */}
          <motion.h1
            variants={item}
            id="hero-title"
            className="mt-8 font-black uppercase leading-[0.84] tracking-[-0.03em] text-4xl tablet:text-5xl desktop:text-6xl"
          >
            {/* Accessible label, since the visible glyphs are image-filled */}
            <span className="sr-only">Goa Startup Festival 2026</span>

            <span
              aria-hidden="true"
              className={`block text-[clamp(3.25rem,15vw,11rem)] ${KNOCKOUT_CLASS}`}
              style={KNOCKOUT_STYLE}
            >
              Goa Startup
            </span>

            <span aria-hidden="true" className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span
                className={`text-[clamp(3.25rem,15vw,11rem)] ${KNOCKOUT_CLASS}`}
                style={KNOCKOUT_STYLE}
              >
                Festival
              </span>
              <span className="text-[clamp(2rem,7vw,5rem)] font-black tracking-tight text-accent-strong">
                2026
              </span>
            </span>
          </motion.h1>

          <motion.div
            variants={item}
            aria-hidden="true"
            className="brand-rule mt-8 w-24 text-accent/50"
          />

          {/* Copy + meta, two columns on desktop so the headline stays dominant */}
          <div className="mt-8 grid gap-8 desktop:grid-cols-[1.1fr_0.9fr] desktop:items-end">
            <div>
              <motion.p
                variants={item}
                className="max-w-xl text-lg font-bold text-ink tablet:text-xl"
              >
                Where ideas become enterprises — two days on the South Goa coast.
              </motion.p>

              <motion.p
                variants={item}
                className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted"
              >
                Keynotes, workshops, competitions, and showcases bringing founders,
                investors, mentors, and students into one room.
              </motion.p>

              {/* Track filter rail */}
              <motion.ul
                variants={item}
                aria-label="Programme tracks"
                className="mt-7 flex flex-wrap gap-2"
              >
                {TRACK_FILTERS.map((track) => (
                  <li key={track.label}>
                    <a
                      href={track.href}
                      className="inline-flex items-center rounded-pill border border-surface-alt bg-surface px-3.5 py-2 text-xs font-bold text-ink-muted transition-colors hover:border-accent hover:text-accent-strong shadow-sm"
                    >
                      {track.label}
                    </a>
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* Meta + actions */}
            <div className="desktop:pb-1">
              <motion.div
                variants={item}
                className="flex flex-col gap-3 text-sm font-bold text-ink tablet:flex-row tablet:items-center tablet:gap-6 desktop:flex-col desktop:items-start desktop:gap-3"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="text-accent-strong" size={18} />
                  2–3 September 2026
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" className="text-accent-strong" size={18} />
                  Parul University Goa Campus, Betul, South Goa
                </span>
              </motion.div>

              <motion.div
                variants={item}
                className="mt-7 flex flex-col items-stretch gap-3 tablet:flex-row tablet:items-center"
              >
                <Link
                  href={cta.href}
                  className="group inline-flex min-h-touch min-w-touch items-center justify-center gap-2 rounded-pill bg-primary px-8 py-4 text-base font-extrabold text-surface transition-colors hover:bg-primary-strong"
                >
                  {cta.label}
                  <ArrowRight
                    aria-hidden="true"
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <div className="flex gap-3">
                  <a
                    href="#schedule"
                    className="inline-flex min-h-touch items-center justify-center rounded-pill border border-surface-alt bg-surface px-8 py-4 text-base font-bold text-ink transition-colors hover:border-ink/20 hover:bg-surface-alt shadow-sm flex-1 tablet:flex-auto"
                  >
                    Explore Schedule
                  </a>
                  <a
                    href="/brochure.pdf"
                    download
                    className="inline-flex min-h-touch items-center justify-center rounded-pill border border-surface-alt bg-surface px-8 py-4 text-base font-bold text-ink transition-colors hover:border-ink/20 hover:bg-surface-alt shadow-sm flex-1 tablet:flex-auto"
                  >
                    Download Brochure
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Full-bleed photo band, echoing the editorial strip ── */}
      <motion.div
        variants={item}
        initial="hidden"
        animate="visible"
        aria-hidden="true"
        className="relative z-10 mt-4 h-[26vw] min-h-[150px] w-full bg-cover bg-center bg-no-repeat tablet:h-[22vw] tablet:max-h-[340px]"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
        }}
      />

      {/* ── Stats strip ── */}
      <div className="site-container relative z-10 pb-16 pt-10 tablet:pb-20">
        <motion.div
          variants={item}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-surface-alt bg-surface p-7 shadow-sm"
        >
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted desktop:text-left">
            PIERC track record
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-7 desktop:grid-cols-4">
            {FESTIVAL_STATISTICS.map((statistic) => (
              <div key={statistic.label} className="text-center desktop:text-left">
                <dd className="text-3xl font-black leading-none tracking-tighter text-ink tablet:text-4xl">
                  {statistic.value}
                </dd>
                <dt className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                  {statistic.label}
                </dt>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
