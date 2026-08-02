import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import type { Viewer } from "@/lib/landing/auth-routing";

interface CtaBandProps {
  viewer: Viewer;
}

/**
 * Closing conversion band. Reuses the hero's scarlet field so the page opens
 * and closes on the brand colour.
 */
export function CtaBand({ viewer }: CtaBandProps) {
  const cta = viewer.authenticated
    ? { href: viewer.dashboardPath ?? "/dashboard/user", label: "Go to Dashboard" }
    : { href: "/signup", label: "Register Now" };

  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden bg-primary bg-noise section-padding"
    >
      <div className="site-container relative z-10 flex flex-col items-center text-center">
        <h2
          id="cta-title"
          className="max-w-3xl text-4xl font-extrabold tracking-tight text-surface tablet:text-5xl"
        >
          Two days. One room. The people building what&apos;s next.
        </h2>

        <div aria-hidden="true" className="brand-rule mt-8 w-24 text-surface/50" />

        <p className="mt-8 max-w-2xl text-lg text-surface/85">
          Registration is free for students of Parul University and PU Goa.
          Spots for showcases and competitions are limited.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm font-semibold text-surface tablet:flex-row tablet:gap-8">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="text-accent" size={18} />
            2–3 September 2026
          </span>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-surface/30 tablet:block"
          />
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" className="text-accent" size={18} />
            PU Goa Campus, Betul
          </span>
        </div>

        <div className="mt-12 flex w-full flex-col items-center gap-4 tablet:w-auto tablet:flex-row">
          <Link
            href={cta.href}
            className="group inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-md bg-surface px-8 py-4 text-lg font-extrabold text-primary shadow-lg transition-colors hover:bg-accent hover:text-ink tablet:w-auto"
          >
            {cta.label}
            <ArrowRight
              aria-hidden="true"
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href="#faq"
            className="inline-flex min-h-touch w-full items-center justify-center rounded-md border-2 border-surface/40 px-8 py-4 text-lg font-bold text-surface transition-colors hover:border-surface hover:bg-surface/10 tablet:w-auto"
          >
            Read the FAQ
          </a>
        </div>
      </div>
    </section>
  );
}
