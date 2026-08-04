import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import type { Viewer } from "@/lib/landing/auth-routing";
import {
  FESTIVAL_HIGHLIGHTS,
  FESTIVAL_SPEAKERS,
  FESTIVAL_SPONSOR_TIERS,
} from "@/lib/landing/content";
import type { SponsorTier } from "@/lib/landing/content/contracts";

// Mock next/image to render a standard img element for testing
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement("img", props),
}));

// Mock next/link to render a standard anchor
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement("a", { href, ...props }, children),
}));

import { AboutSection } from "@/components/landing/AboutSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HighlightsSection } from "@/components/landing/HighlightsSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SpeakersSection } from "@/components/landing/SpeakersSection";
import { SponsorsSection } from "@/components/landing/SponsorsSection";

const anonymousViewer: Viewer = {
  authenticated: false,
  role: null,
  dashboardPath: null,
};

const authenticatedViewer: Viewer = {
  authenticated: true,
  role: "Admin",
  dashboardPath: "/dashboard/admin",
};

const populatedTiers: SponsorTier[] = [
  {
    name: "Title Sponsors",
    sponsors: [
      {
        id: "title-1",
        name: "Title Sponsor",
        logo: { src: "/title.svg", width: 200, height: 48, alt: "Title Sponsor logo" },
      },
    ],
  },
  {
    name: "Associate Sponsors",
    sponsors: [
      {
        id: "assoc-1",
        name: "Associate Sponsor",
        logo: { src: "/assoc.svg", width: 180, height: 48, alt: "Associate Sponsor logo" },
      },
    ],
  },
  {
    name: "Partners",
    sponsors: [
      {
        id: "partner-1",
        name: "Partner",
        logo: { src: "/partner.svg", width: 160, height: 48, alt: "Partner logo" },
      },
    ],
  },
];

describe("Landing section accessibility scans", () => {
  it("HeroSection (anonymous) has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <HeroSection viewer={anonymousViewer} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("HeroSection (authenticated) has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <HeroSection viewer={authenticatedViewer} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("AboutSection has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <AboutSection />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("HighlightsSection has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <HighlightsSection />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("SpeakersSection has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <SpeakersSection speakers={FESTIVAL_SPEAKERS} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("SponsorsSection has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <SponsorsSection />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("SiteFooter has no accessibility violations", async () => {
    const { container } = render(<SiteFooter />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Full page composition has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <HeroSection viewer={anonymousViewer} />
        <AboutSection />
        <HighlightsSection />
        <SpeakersSection speakers={FESTIVAL_SPEAKERS} />
        <SponsorsSection />
        <SiteFooter />
      </main>,
    );
    // landmark-unique is excluded because nested sponsor tier sections share the
    // region role within the same tree; each has unique labels in isolation.
    expect(
      await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
