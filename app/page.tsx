import { headers } from "next/headers";
import { MessageCircle, ArrowRight } from "lucide-react";

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
          <AboutSection />
          <LandingHighlights />
          <HighlightsSection />
          <AudienceSection />
          <ScheduleSection schedule={schedule} />

          {/* SpeakersSection — commented out for future enablement
          <SpeakersSection speakers={FESTIVAL_SPEAKERS} />
          */}

          <SponsorsSection />

          <section
              id="faq"
              aria-labelledby="faq-title"
              className="relative overflow-hidden bg-canvas section-padding"
            >
              {/* Decorative Ambient Background Glows */}
              <div aria-hidden="true" className="absolute -top-[30%] -right-[10%] z-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
              <div aria-hidden="true" className="absolute -bottom-[20%] -left-[10%] z-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]" />

              <div className="site-container relative z-10">
                <div className="grid grid-cols-1 gap-12 desktop:grid-cols-12 desktop:gap-8">
                  <header className="desktop:col-span-5">
                    <p className="mb-3 font-bold uppercase tracking-widest text-primary">
                      Got questions?
                    </p>
                    <h2 id="faq-title" className="text-4xl font-extrabold tracking-tight text-ink tablet:text-5xl">
                      Frequently Asked Questions
                    </h2>
                    <div
                      aria-hidden="true"
                      className="brand-rule mt-8 w-24 text-accent/40"
                    />
                    <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-muted">
                      Everything you need to know about attending, registering, and
                      participating in the festival. Can&apos;t find your answer? Reach out to our team.
                    </p>

                    <div className="mt-12 max-w-sm rounded-2xl border border-surface-alt bg-surface/60 p-8 shadow-sm backdrop-blur-md">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageCircle size={24} aria-hidden="true" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-ink">Still have questions?</h3>
                      <p className="mt-2 text-ink-muted">
                        Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.
                      </p>
                      <a href="mailto:ecell@goa.paruluniversity.ac.in" className="group mt-6 inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary-strong">
                        Get in touch 
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </a>
                    </div>
                  </header>
                  <div className="desktop:col-span-7">
                    <FaqAccordion items={FESTIVAL_FAQS} />
                  </div>
                </div>
              </div>
            </section>

          <CtaBand viewer={viewer} />
        </MotionProvider>
      </main>
      <SiteFooter />
    </>
  );
}
