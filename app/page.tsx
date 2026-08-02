import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { viewerFromSession } from "@/lib/landing/auth-routing";
import { loadPublishedSchedule } from "@/lib/landing/schedule-loader";
import {
  FESTIVAL_SPEAKERS,
  FESTIVAL_SPONSOR_TIERS,
  FESTIVAL_FAQS,
} from "@/lib/landing/content";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { TabsSection } from "@/components/landing/TabsSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { CtaBand } from "@/components/landing/CtaBand";
import { LandingHighlights } from "@/components/landing/LandingHighlights";
import { HighlightsSection } from "@/components/landing/HighlightsSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { SpeakersSection } from "@/components/landing/SpeakersSection";
import { SponsorsSection } from "@/components/landing/SponsorsSection";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { MotionProvider } from "@/components/landing/MotionProvider";
import { Reveal } from "@/components/landing/Reveal";

/**
 * Root landing page — async Server Component.
 *
 * Loads session and schedule independently so a failure in either does not
 * prevent the page shell from rendering. Session failure degrades to an
 * anonymous viewer; schedule failure is handled by ScheduleSection's
 * unavailable state.
 *
 * Requirements: 2.1–2.7, 3.1–3.10, 4.1–4.5, 5.1–5.4, 6.1–6.6,
 *              7.1–7.5, 8.1–8.5, 9.1–9.6, 10.1–10.6, 14.1, 14.2, 14.5
 */
export default async function Page() {
  // Load session and schedule independently — neither failure crashes the page.
  const [sessionResult, scheduleResult] = await Promise.allSettled([
    auth.api.getSession({ headers: await headers() }),
    loadPublishedSchedule(),
  ]);

  // Derive the minimal serializable viewer from the session.
  // Session failure → anonymous viewer (no crash, no session data leaked).
  const session =
    sessionResult.status === "fulfilled" ? sessionResult.value : null;
  const viewer = viewerFromSession(session);

  // Schedule failure → unavailable state (handled by ScheduleSection).
  const schedule =
    scheduleResult.status === "fulfilled"
      ? scheduleResult.value
      : { state: "unavailable" as const, events: [] as [], message: "Event data is temporarily unavailable." };

  return (
    <>
      <SiteHeader viewer={viewer} />
      <main>
        <HeroSection viewer={viewer} />

        <MotionProvider>
          <Reveal>
            <AboutSection />
          </Reveal>

          <Reveal>
            <TabsSection />
          </Reveal>

          <Reveal>
            <LandingHighlights />
          </Reveal>

          <Reveal>
            <HighlightsSection />
          </Reveal>

          <Reveal>
            <AudienceSection />
          </Reveal>

          <Reveal>
            <ScheduleSection schedule={schedule} />
          </Reveal>

          <Reveal>
            <SpeakersSection speakers={FESTIVAL_SPEAKERS} />
          </Reveal>

          <Reveal>
            <SponsorsSection tiers={FESTIVAL_SPONSOR_TIERS} />
          </Reveal>

          <Reveal>
            <section
              id="faq"
              aria-labelledby="faq-title"
              className="bg-canvas section-padding"
            >
              <div className="site-container">
                <header className="max-w-3xl">
                  <p className="mb-2 font-semibold uppercase tracking-widest text-primary">
                    Got questions?
                  </p>
                  <h2 id="faq-title" className="font-bold">
                    Frequently Asked Questions
                  </h2>
                  <div
                    aria-hidden="true"
                    className="brand-rule mt-6 w-20 text-primary/40"
                  />
                  <p className="mt-6 text-lg text-ink-muted">
                    Everything you need to know about attending, registering, and
                    participating in the festival.
                  </p>
                </header>
                <div className="mt-12">
                  <FaqAccordion items={FESTIVAL_FAQS} />
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <CtaBand viewer={viewer} />
          </Reveal>
        </MotionProvider>
      </main>
      <SiteFooter />
    </>
  );
}
