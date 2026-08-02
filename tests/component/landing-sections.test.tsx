import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Viewer } from "@/lib/landing/auth-routing";
import {
  ABOUT_DESCRIPTION,
  FESTIVAL_HIGHLIGHTS,
  FESTIVAL_ORGANIZERS,
  FESTIVAL_SPEAKERS,
  FESTIVAL_SPONSOR_TIERS,
  FESTIVAL_STATISTICS,
} from "@/lib/landing/content";
import type { Speaker, SponsorTier } from "@/lib/landing/content/contracts";

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

// ------ Hero Section Tests ------
describe("HeroSection", () => {
  const anonymousViewer: Viewer = {
    authenticated: false,
    role: null,
    dashboardPath: null,
  };
  const adminViewer: Viewer = {
    authenticated: true,
    role: "Admin",
    dashboardPath: "/dashboard/admin",
  };
  const volunteerViewer: Viewer = {
    authenticated: true,
    role: "Volunteer",
    dashboardPath: "/dashboard/volunteer",
  };
  const attendeeViewer: Viewer = {
    authenticated: true,
    role: "Attendee",
    dashboardPath: "/dashboard/user",
  };

  it("renders the festival name as an h1 heading", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Goa Startup Festival 2026");
  });

  it("renders the tagline", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    expect(screen.getByText("Where Ideas Become Enterprises")).toBeInTheDocument();
  });

  it("renders event dates and venue", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    expect(screen.getByText(/2–3 September 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Parul University Goa Campus, Betul, South Goa/)).toBeInTheDocument();
  });

  it("shows Register Now CTA linking to /signup for anonymous viewers", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    const cta = screen.getByRole("link", { name: /register now/i });
    expect(cta).toHaveAttribute("href", "/signup");
  });

  it("shows Go to Dashboard CTA for authenticated Admin linking to /dashboard/admin", () => {
    render(<HeroSection viewer={adminViewer} />);
    const cta = screen.getByRole("link", { name: /go to dashboard/i });
    expect(cta).toHaveAttribute("href", "/dashboard/admin");
  });

  it("shows Go to Dashboard CTA for authenticated Volunteer linking to /dashboard/volunteer", () => {
    render(<HeroSection viewer={volunteerViewer} />);
    const cta = screen.getByRole("link", { name: /go to dashboard/i });
    expect(cta).toHaveAttribute("href", "/dashboard/volunteer");
  });

  it("shows Go to Dashboard CTA for authenticated Attendee linking to /dashboard/user", () => {
    render(<HeroSection viewer={attendeeViewer} />);
    const cta = screen.getByRole("link", { name: /go to dashboard/i });
    expect(cta).toHaveAttribute("href", "/dashboard/user");
  });

  it("does not show Register Now when authenticated", () => {
    render(<HeroSection viewer={adminViewer} />);
    expect(screen.queryByRole("link", { name: /register now/i })).not.toBeInTheDocument();
  });

  it("has a section landmark with an accessible label", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    const section = screen.getByRole("region", { name: /goa startup festival 2026/i });
    expect(section).toBeInTheDocument();
  });

  it("applies minimum viewport height class", () => {
    const { container } = render(<HeroSection viewer={anonymousViewer} />);
    const section = container.querySelector("section");
    expect(section?.className).toMatch(/min-h-screen/);
  });

  it("applies responsive heading size classes", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toMatch(/text-4xl/);
    expect(heading.className).toMatch(/tablet:text-5xl/);
    expect(heading.className).toMatch(/desktop:text-6xl/);
  });

  it("CTA button meets minimum touch target size via class", () => {
    render(<HeroSection viewer={anonymousViewer} />);
    const cta = screen.getByRole("link", { name: /register now/i });
    expect(cta.className).toMatch(/min-h-touch/);
    expect(cta.className).toMatch(/min-w-touch/);
  });
});

// ------ About Section Tests ------
describe("AboutSection", () => {
  it("renders the section heading as h2", () => {
    render(<AboutSection />);
    const heading = screen.getByRole("heading", { level: 2, name: /about the festival/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders the about description matching the content module", () => {
    render(<AboutSection />);
    expect(screen.getByText(ABOUT_DESCRIPTION)).toBeInTheDocument();
  });

  it("renders the about description with 30-80 words", () => {
    const wordCount = ABOUT_DESCRIPTION.trim().split(/\s+/).length;
    expect(wordCount).toBeGreaterThanOrEqual(30);
    expect(wordCount).toBeLessThanOrEqual(80);
  });

  it("renders exactly 3 organizers", () => {
    render(<AboutSection />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
  });

  it("renders PIERC, Parul University, and PU Goa organizer names", () => {
    render(<AboutSection />);
    expect(screen.getByRole("heading", { level: 3, name: "PIERC" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Parul University" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "PU Goa" })).toBeInTheDocument();
  });

  it("renders organizer descriptions with 20-60 words each", () => {
    for (const organizer of FESTIVAL_ORGANIZERS) {
      const wordCount = organizer.description.trim().split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(20);
      expect(wordCount).toBeLessThanOrEqual(60);
    }
  });

  it("renders exactly 4 statistics with correct label-value pairs", () => {
    render(<AboutSection />);
    const expectedStats = [
      { label: "Startups Incubated", value: "300+" },
      { label: "Revenue", value: "₹200 Cr+" },
      { label: "Investments", value: "₹40 Cr+" },
      { label: "Jobs Created", value: "1,600+" },
    ];
    for (const stat of expectedStats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    }
    expect(FESTIVAL_STATISTICS).toHaveLength(4);
  });

  it("has a section landmark with accessible label", () => {
    render(<AboutSection />);
    const section = screen.getByRole("region", { name: /about the festival/i });
    expect(section).toBeInTheDocument();
  });

  it("uses id='about' for anchor navigation", () => {
    const { container } = render(<AboutSection />);
    const section = container.querySelector("#about");
    expect(section).not.toBeNull();
  });
});

// ------ Highlights Section Tests ------
describe("HighlightsSection", () => {
  it("renders the section heading as h2", () => {
    render(<HighlightsSection />);
    const heading = screen.getByRole("heading", { level: 2, name: /festival highlights/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders at least 6 highlight cards", () => {
    render(<HighlightsSection />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(6);
  });

  it("renders all required categories", () => {
    render(<HighlightsSection />);
    const requiredTitles = [
      "Keynote Speeches",
      "Panel Discussions",
      "Workshops",
      "Startup Showcases",
      "Competitions",
      "Networking",
    ];
    for (const title of requiredTitles) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }
  });

  it("each highlight has a unique icon with accessible label", () => {
    render(<HighlightsSection />);
    const icons = screen.getAllByRole("img");
    const labels = icons.map((icon) => icon.getAttribute("aria-label"));
    // All must have labels
    for (const label of labels) {
      expect(label).toBeTruthy();
    }
    // All labels must be unique
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("each highlight description is no more than 120 characters", () => {
    for (const highlight of FESTIVAL_HIGHLIGHTS) {
      expect(Array.from(highlight.description).length).toBeLessThanOrEqual(120);
    }
  });

  it("applies responsive grid columns", () => {
    const { container } = render(<HighlightsSection />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toMatch(/grid-cols-1/);
    expect(grid?.className).toMatch(/tablet:grid-cols-2/);
    expect(grid?.className).toMatch(/desktop:grid-cols-3/);
  });

  it("has a section landmark with accessible label", () => {
    render(<HighlightsSection />);
    const section = screen.getByRole("region", { name: /festival highlights/i });
    expect(section).toBeInTheDocument();
  });

  it("uses id='highlights' for anchor navigation", () => {
    const { container } = render(<HighlightsSection />);
    expect(container.querySelector("#highlights")).not.toBeNull();
  });
});

// ------ Speakers Section Tests ------
describe("SpeakersSection", () => {
  it("renders the section when speakers are present", () => {
    render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const heading = screen.getByRole("heading", { level: 2, name: /speakers and guests/i });
    expect(heading).toBeInTheDocument();
  });

  it("returns null when no speakers are provided", () => {
    const { container } = render(<SpeakersSection speakers={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the correct number of speaker cards (4-12)", () => {
    render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(4);
    expect(articles.length).toBeLessThanOrEqual(12);
  });

  it("renders speaker photos with 1:1 aspect-ratio class", () => {
    render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const images = screen.getAllByRole("img");
    for (const img of images) {
      expect(img.className).toMatch(/aspect-square/);
    }
  });

  it("renders speaker photos with explicit width and height attributes", () => {
    render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const images = screen.getAllByRole("img");
    for (const img of images) {
      expect(img).toHaveAttribute("width");
      expect(img).toHaveAttribute("height");
    }
  });

  it("renders speaker photos with lazy loading", () => {
    render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const images = screen.getAllByRole("img");
    for (const img of images) {
      expect(img).toHaveAttribute("loading", "lazy");
    }
  });

  it("truncates long names with ellipsis (>50 chars)", () => {
    const longNameSpeaker: Speaker = {
      id: "long-name",
      fullName: "A".repeat(55),
      title: "Founder",
      organization: "Corp",
      photo: { src: "/test.jpg", width: 400, height: 400, alt: "Test" },
    };
    render(<SpeakersSection speakers={[longNameSpeaker, ...FESTIVAL_SPEAKERS]} />);
    // The full name should be accessible via title attribute
    const truncatedEl = screen.getByTitle("A".repeat(55));
    expect(truncatedEl).toBeInTheDocument();
    expect(truncatedEl.textContent).toContain("…");
  });

  it("applies responsive speaker grid columns", () => {
    const { container } = render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toMatch(/grid-cols-2/);
    expect(grid?.className).toMatch(/tablet:grid-cols-3/);
    expect(grid?.className).toMatch(/desktop:grid-cols-4/);
  });

  it("has a section landmark with accessible label", () => {
    render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    const section = screen.getByRole("region", { name: /speakers and guests/i });
    expect(section).toBeInTheDocument();
  });

  it("uses id='speakers' for anchor navigation", () => {
    const { container } = render(<SpeakersSection speakers={FESTIVAL_SPEAKERS} />);
    expect(container.querySelector("#speakers")).not.toBeNull();
  });
});

// ------ Sponsors Section Tests ------
describe("SponsorsSection", () => {
  const populatedTiers: SponsorTier[] = [
    {
      name: "Title Sponsors",
      sponsors: [
        {
          id: "title-1",
          name: "Title Sponsor Corp",
          href: "https://example.com",
          logo: { src: "/title.svg", width: 200, height: 48, alt: "Title Sponsor Corp logo" },
        },
      ],
    },
    {
      name: "Associate Sponsors",
      sponsors: [
        {
          id: "assoc-1",
          name: "Associate Corp",
          logo: { src: "/assoc.svg", width: 180, height: 48, alt: "Associate Corp logo" },
        },
      ],
    },
    {
      name: "Partners",
      sponsors: [
        {
          id: "partner-1",
          name: "Partner Corp",
          logo: { src: "/partner.svg", width: 160, height: 48, alt: "Partner Corp logo" },
        },
      ],
    },
  ];

  it("renders the section heading as h2", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    const heading = screen.getByRole("heading", { level: 2, name: /sponsors and partners/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders three labeled tiers when all are populated", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    expect(screen.getByRole("heading", { level: 3, name: "Title Sponsors" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Associate Sponsors" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Partners" })).toBeInTheDocument();
  });

  it("hides empty tiers entirely", () => {
    render(<SponsorsSection tiers={FESTIVAL_SPONSOR_TIERS} />);
    // Title Sponsors and Associate Sponsors are empty in the production content
    expect(screen.queryByRole("heading", { level: 3, name: "Title Sponsors" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Associate Sponsors" })).not.toBeInTheDocument();
    // Partners has content
    expect(screen.getByRole("heading", { level: 3, name: "Partners" })).toBeInTheDocument();
  });

  it("renders sponsor logos with h-12 (48px) height class", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    const images = screen.getAllByRole("img");
    for (const img of images) {
      expect(img.className).toMatch(/h-12/);
    }
  });

  it("renders logos with explicit width and height attributes (Next.js Image)", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    const images = screen.getAllByRole("img");
    for (const img of images) {
      expect(img).toHaveAttribute("width");
      expect(img).toHaveAttribute("height");
    }
  });

  it("renders sponsor links with correct hrefs when href is provided", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    const link = screen.getByRole("link", { name: /visit title sponsor corp/i });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders logos with lazy loading", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    const images = screen.getAllByRole("img");
    for (const img of images) {
      expect(img).toHaveAttribute("loading", "lazy");
    }
  });

  it("has a section landmark with accessible label", () => {
    render(<SponsorsSection tiers={populatedTiers} />);
    const section = screen.getByRole("region", { name: /sponsors and partners/i });
    expect(section).toBeInTheDocument();
  });
});

// ------ Footer Tests ------
describe("SiteFooter", () => {
  it("renders as a footer landmark element", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the festival name in the branding column", () => {
    render(<SiteFooter />);
    expect(
      screen.getByRole("heading", { level: 2, name: /goa startup festival 2026/i }),
    ).toBeInTheDocument();
  });

  it("renders the organizer attribution", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/jointly organized by pierc, parul university/i)).toBeInTheDocument();
  });

  it("renders the branding description within 200 characters", () => {
    render(<SiteFooter />);
    const description = screen.getByText(/two-day entrepreneurship/i);
    expect(description.textContent!.length).toBeLessThanOrEqual(200);
  });

  it("renders Quick Links with correct hrefs", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation", { name: /quick links/i });
    const links = within(nav).getAllByRole("link");

    const expectedLinks = [
      { label: "About", href: "#about" },
      { label: "Schedule", href: "#schedule" },
      { label: "Register", href: "/signup" },
      { label: "Login", href: "/login" },
    ];

    expect(links).toHaveLength(expectedLinks.length);
    for (const expected of expectedLinks) {
      const link = within(nav).getByRole("link", { name: expected.label });
      expect(link).toHaveAttribute("href", expected.href);
    }
  });

  it("renders a mailto link for contact email", () => {
    render(<SiteFooter />);
    const emailLink = screen.getByRole("link", { name: /ecell@goa\.paruluniversity\.ac\.in/i });
    expect(emailLink).toHaveAttribute("href", "mailto:ecell@goa.paruluniversity.ac.in");
  });

  it("renders the university name and campus location", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Parul University Goa")).toBeInTheDocument();
    expect(screen.getByText("Betul, South Goa")).toBeInTheDocument();
  });

  it("renders a copyright notice with year and entity", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/© 2026 Goa Startup Festival/)).toBeInTheDocument();
  });

  it("renders the team attribution line", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/built by the pierc team/i)).toBeInTheDocument();
  });

  it("renders 3 content columns using responsive grid classes", () => {
    const { container } = render(<SiteFooter />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toMatch(/grid-cols-1/);
    expect(grid?.className).toMatch(/tablet:grid-cols-3/);
  });

  it("contains navigation landmark for quick links", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("navigation", { name: /quick links/i })).toBeInTheDocument();
  });
});

// ------ Heading Order Tests ------
describe("Heading Order", () => {
  it("maintains a logical heading hierarchy across sections", () => {
    const { container } = render(
      <main>
        <HeroSection
          viewer={{ authenticated: false, role: null, dashboardPath: null }}
        />
        <AboutSection />
        <HighlightsSection />
        <SpeakersSection speakers={FESTIVAL_SPEAKERS} />
        <SponsorsSection tiers={FESTIVAL_SPONSOR_TIERS} />
        <SiteFooter />
      </main>,
    );

    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const levels = Array.from(headings).map((h) => Number(h.tagName[1]));

    // Must start with h1
    expect(levels[0]).toBe(1);

    // No heading should skip more than one level down
    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1];
      expect(jump).toBeLessThanOrEqual(1);
    }
  });
});
