import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight, Sparkles } from "lucide-react";

import type { Viewer } from "@/lib/landing/auth-routing";
import { FESTIVAL_STATISTICS } from "@/lib/landing/content";

interface HeroSectionProps {
  viewer: Viewer;
}

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
      <div className="site-container relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <p className="inline-flex items-center gap-2 rounded-pill border border-surface/25 bg-surface/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-surface">
          <Sparkles aria-hidden="true" className="text-accent" size={16} />
          PIERC · Parul University · PU Goa
        </p>

        {/* Headline */}
        <h1
          id="hero-title"
          className="mt-8 max-w-4xl text-4xl font-extrabold leading-none tracking-tight text-surface tablet:text-5xl desktop:text-6xl"
        >
          Goa Startup Festival 2026
        </h1>

        {/* Triple rule from the logo */}
        <div
          aria-hidden="true"
          className="brand-rule mt-8 w-24 text-surface/50"
        />

        <p className="mt-8 max-w-2xl text-xl font-bold text-surface tablet:text-2xl">
          Where Ideas Become Enterprises
        </p>
        <p className="mt-4 max-w-2xl text-lg text-surface/80">
          Two days of keynotes, workshops, competitions, and showcases bringing
          founders, investors, mentors, and students together in South Goa.
        </p>

        {/* Date and venue */}
        <div className="mt-8 flex flex-col items-center gap-4 text-base font-semibold text-surface tablet:flex-row tablet:gap-8">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="text-accent" size={20} />
            2–3 September 2026
          </span>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-surface/30 tablet:block"
          />
          <span className="inline-flex items-center gap-2 text-center tablet:text-left">
            <MapPin aria-hidden="true" className="text-accent" size={20} />
            Parul University Goa Campus, Betul, South Goa
          </span>
        </div>

        {/* Actions */}
        <div className="mt-12 flex w-full flex-col items-center gap-4 tablet:w-auto tablet:flex-row">
          <Link
            href={cta.href}
            className="group inline-flex min-h-touch min-w-touch w-full items-center justify-center gap-2 rounded-md bg-surface px-8 py-4 text-lg font-extrabold text-primary shadow-lg transition-colors hover:bg-accent hover:text-ink tablet:w-auto"
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
            className="inline-flex min-h-touch w-full items-center justify-center rounded-md border-2 border-surface/40 px-8 py-4 text-lg font-bold text-surface transition-colors hover:border-surface hover:bg-surface/10 tablet:w-auto"
          >
            Explore Schedule
          </a>
        </div>

        {/* Impact strip — the incubator's track record, stated up front */}
        <dl className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-6 border-t border-surface/20 pt-8 desktop:grid-cols-4">
          {FESTIVAL_STATISTICS.map((statistic) => (
            <div key={statistic.label} className="text-center">
              <dd className="text-3xl font-extrabold leading-none text-surface">
                {statistic.value}
              </dd>
              <dt className="mt-2 text-xs font-semibold uppercase tracking-widest text-surface/70">
                {statistic.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
