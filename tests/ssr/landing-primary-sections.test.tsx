import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AboutSection } from "@/components/landing/AboutSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HighlightsSection } from "@/components/landing/HighlightsSection";
import {
  ABOUT_DESCRIPTION,
  FESTIVAL_HIGHLIGHTS,
  FESTIVAL_ORGANIZERS,
  FESTIVAL_STATISTICS,
} from "@/lib/landing/content";
import type { Viewer } from "@/lib/landing/auth-routing";

const anonymous: Viewer = { authenticated: false, role: null, dashboardPath: null };

function occurrences(source: string, value: string): number {
  return source.split(value).length - 1;
}

describe("primary landing server sections", () => {
  it("renders the full-height anonymous hero with exact facts and responsive type", () => {
    const html = renderToStaticMarkup(createElement(HeroSection, { viewer: anonymous }));

    expect(html).toContain("clamp(3.25rem,15vw,11rem)");
    expect(html).toContain("Goa Startup Festival 2026");
    expect(html).toContain("Where ideas become enterprises");
    expect(html).toContain("2–3 September 2026");
    expect(html).toContain("Parul University Goa Campus, Betul, South Goa");
    expect(html).toContain('href="/signup"');
    expect(html).toContain("Register Now");
    expect(html).toContain("min-h-touch");
  });

  it("renders each authenticated role's direct dashboard CTA", () => {
    const paths = ["/dashboard/admin", "/dashboard/volunteer", "/dashboard/user"] as const;
    for (const dashboardPath of paths) {
      const viewer: Viewer = { authenticated: true, role: "Attendee", dashboardPath };
      const html = renderToStaticMarkup(createElement(HeroSection, { viewer }));
      expect(html).toContain(`href="${dashboardPath}"`);
      expect(html).toContain("Go to Dashboard");
      expect(html).not.toContain("Register Now");
    }
  });

  it("renders the validated about content and exactly four enlarged statistics", () => {
    const html = renderToStaticMarkup(createElement(AboutSection));

    expect(html).toContain(ABOUT_DESCRIPTION);
    for (const organizer of FESTIVAL_ORGANIZERS) {
      expect(html).toContain(organizer.name);
      expect(html).toContain(organizer.description.replaceAll("'", "&#x27;"));
    }
    for (const statistic of FESTIVAL_STATISTICS) {
      expect(html).toContain(statistic.label);
      expect(html).toContain(statistic.value);
    }
    expect(occurrences(html, "<dt")).toBe(4);
    expect(occurrences(html, "<dd")).toBe(4);
    expect(html).toContain("text-3xl");
  });

  it("renders six uniquely labelled highlight cards in a 1/2/3-column grid", () => {
    const html = renderToStaticMarkup(createElement(HighlightsSection));

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("tablet:grid-cols-2");
    expect(html).toContain("desktop:grid-cols-4");
    expect(occurrences(html, "<article")).toBe(FESTIVAL_HIGHLIGHTS.length);
    for (const highlight of FESTIVAL_HIGHLIGHTS) {
      expect(html).toContain(highlight.title.replaceAll("&", "&amp;").replaceAll("'", "&#x27;"));
      expect(html).toContain(highlight.description.replaceAll("&", "&amp;").replaceAll("'", "&#x27;"));
      expect(html).toContain(`aria-label="${highlight.accessibleLabel.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")}"`);
    }
    expect(new Set(FESTIVAL_HIGHLIGHTS.map(({ icon }) => icon)).size).toBe(6);
  });
});
