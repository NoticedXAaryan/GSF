import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/landing/SiteFooter";
import { SpeakersSection } from "@/components/landing/SpeakersSection";
import { SponsorsSection } from "@/components/landing/SponsorsSection";
import type { Speaker, SponsorTier } from "@/lib/landing/content";

const speaker = (overrides: Partial<Speaker> = {}): Speaker => ({ id: "speaker", fullName: "Speaker Name", title: "Founder", organization: "Example Ventures", photo: null, ...overrides });
const sponsor = (id: string) => ({ id, name: id, logo: { src: "/logo.png", width: 1109, height: 421, alt: `${id} logo` } });

describe("SpeakersSection", () => {
  it("omits empty content and renders a responsive, lazy-image grid", () => {
    const emptySpeakers: readonly Speaker[] = [];
    const announcedSpeakers: readonly Speaker[] = [speaker()];
    expect(renderToStaticMarkup(<SpeakersSection speakers={emptySpeakers} />)).toBe("");
    const html = renderToStaticMarkup(<SpeakersSection speakers={announcedSpeakers} />);
    expect(html).toContain("grid-cols-2");
    expect(html).toContain("tablet:grid-cols-3");
    expect(html).toContain("desktop:grid-cols-4");
    expect(html).toContain("/images/speaker-placeholder.svg");
    expect(html).toContain('width="512"');
    expect(html).toContain('height="512"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain("aspect-square");
  });

  it("truncates overlong display values while preserving their full labels", () => {
    const fullName = "A".repeat(51);
    const title = "B".repeat(61);
    const organization = "C".repeat(61);
    const announcedSpeakers: readonly Speaker[] = [speaker({ fullName, title, organization })];
    const html = renderToStaticMarkup(<SpeakersSection speakers={announcedSpeakers} />);
    expect(html).toContain(`${"A".repeat(49)}…`);
    expect(html).toContain(`${"B".repeat(59)}…`);
    expect(html).toContain(`${"C".repeat(59)}…`);
    expect(html).toContain(`title="${fullName}"`);
    expect(html).toContain(`aria-label="${organization}"`);
  });
});

describe("SponsorsSection and SiteFooter", () => {
  it("renders the static partner links with uniform explicit-size images", () => {
    const html = renderToStaticMarkup(<SponsorsSection />);
    expect(html).toContain("Parul University Vadodara");
    expect(html).toContain("Parul University Goa");
    expect(html).toContain("PIERC");
    expect(html.match(/<img/g)).toHaveLength(3);
  });

  it("renders the semantic responsive footer with exact links, contact, and attribution", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain("<footer");
    expect(html).toContain("tablet:grid-cols-3");
    expect(html).toContain("Goa Startup Festival 2026");
    expect(html).toContain("Jointly organized by PIERC, Parul University &amp; PU Goa");
    for (const [label, href] of [["About", "#about"], ["Schedule", "#schedule"], ["Register", "/signup"], ["Login", "/login"]]) {
      expect(html).toContain(`href="${href}"`);
      expect(html).toContain(`>${label}</a>`);
    }
    expect(html).toContain('href="mailto:ecell@goa.paruluniversity.ac.in"');
    expect(html).toContain("Parul University Goa");
    expect(html).toContain("Betul, South Goa");
    expect(html).toContain("© 2026 Goa Startup Festival. All rights reserved.");
    expect(html).toContain("Built by the Epic Team");
  });
});