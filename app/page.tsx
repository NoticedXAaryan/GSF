import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { viewerFromSession } from "@/lib/landing/auth-routing";
import { loadPublishedSchedule } from "@/lib/landing/schedule-loader";
import {
  FESTIVAL_FAQS,
} from "@/lib/landing/content";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { LandingHighlights } from "@/components/landing/LandingHighlights";
import { HighlightsSection } from "@/components/landing/HighlightsSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { SponsorsSection } from "@/components/landing/SponsorsSection";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { CtaBand } from "@/components/landing/CtaBand";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { MotionProvider } from "@/components/landing/MotionProvider";
import { Reveal } from "@/components/landing/Reveal";

/**
 * Root landing page — async Server Component.
 * Sections: Hero → About → Featured Events → Highlights → Audience →
 *           Schedule → Partners → FAQ → CTA → Footer
 *
 * Removed: TabsSection (Festival Regions), SpeakersSection (commented out for future use)
 */
export default async function Page() {
  const [sessionResult, scheduleResult] = await Promise.allSettled([
    auth.api.getSession({ headers: await headers() }),
    loadPublishedSchedule(),
  ]);

  const session =
    sessionResult.status === "fulfilled" ? sessionResult.value : null;
  const viewer = viewerFromSession(session);

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

          {/* SpeakersSection — commented out for future enablement
          <Reveal>
            <SpeakersSection speakers={FESTIVAL_SPEAKERS} />
          </Reveal>
          */}

          <Reveal>
            <SponsorsSection />
          </Reveal>

          <Reveal>
            <section
              id="faq"
              aria-labelledby="faq-title"
              className="bg-[#08080a] bg-noise section-padding"
            >
              <div className="site-container">
                <header className="max-w-3xl">
                  <p className="mb-2 font-semibold uppercase tracking-widest text-accent">
                    Got questions?
                  </p>
                  <h2 id="faq-title" className="font-bold text-white">
                    Frequently Asked Questions
                  </h2>
                  <div
                    aria-hidden="true"
                    className="brand-rule mt-6 w-20 text-accent/40"
                  />
                  <p className="mt-6 text-lg text-white/60">
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
