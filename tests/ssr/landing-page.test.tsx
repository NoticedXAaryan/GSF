import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { ScheduleEvent } from "@/lib/landing/schedule";
import type { ScheduleLoadResult } from "@/lib/landing/schedule-loader";

// ─── Mocks ─────────────────────────────────────────────────────────────────────

// Mock server-only (imported by schedule-loader)
vi.mock("server-only", () => ({}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

// Mock next/link to render standard anchors
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement("a", { href, ...props }, children),
}));

// Mock next/image to render standard img elements
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement("img", props),
}));



// Mock auth module
const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

// Mock schedule loader
const mockLoadPublishedSchedule = vi.fn();
vi.mock("@/lib/landing/schedule-loader", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/landing/schedule-loader")>();
  return {
    ...original,
    loadPublishedSchedule: (...args: unknown[]) => mockLoadPublishedSchedule(...args),
  };
});

// Import Page after mocks are defined
import Page from "@/app/page";

// ─── Test Fixtures ──────────────────────────────────────────────────────────────

const SEEDED_EVENTS: ScheduleEvent[] = [
  {
    id: "evt-1",
    name: "Opening Ceremony",
    day: 1,
    startTime: "09:00",
    endTime: "10:00",
    venue: "Main Auditorium",
    type: "open",
    status: "published",
    capacity: null,
    currentRegistrations: 0,
    coordinatorName: "Dr. Patel",
    registrationStatus: null,
  },
  {
    id: "evt-2",
    name: "Startup Pitch Contest",
    day: 1,
    startTime: "10:30",
    endTime: "12:00",
    venue: "Innovation Hall",
    type: "registration",
    status: "published",
    capacity: 50,
    currentRegistrations: 30,
    coordinatorName: "Raj Sharma",
    registrationStatus: "open",
  },
  {
    id: "evt-3",
    name: "Day 2 Workshop",
    day: 2,
    startTime: "11:00",
    endTime: "13:00",
    venue: "Lab B",
    type: "restricted",
    status: "published",
    capacity: 20,
    currentRegistrations: 20,
    coordinatorName: "Anita Singh",
    registrationStatus: null,
  },
];

const readySchedule: ScheduleLoadResult = { state: "ready", events: SEEDED_EVENTS };
const unavailableSchedule: ScheduleLoadResult = {
  state: "unavailable",
  events: [],
  message: "Event data is temporarily unavailable.",
};

function authenticatedSession(role = "Attendee") {
  return { user: { role } };
}

// ─── Helper ─────────────────────────────────────────────────────────────────────

async function renderPage(): Promise<string> {
  // Page is an async Server Component, call it as a function
  const element = await Page();
  return renderToStaticMarkup(element);
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("Landing page SSR integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("full rendering with seeded events (JS disabled baseline)", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue(null);
      mockLoadPublishedSchedule.mockResolvedValue(readySchedule);
    });

    it("renders navigation with required section links", async () => {
      const html = await renderPage();

      // Navigation landmark with section links
      expect(html).toContain("About");
      expect(html).toContain("Schedule");
      expect(html).toContain("FAQ");
      expect(html).toContain('href="#about"');
      expect(html).toContain('href="#schedule"');
      expect(html).toContain('href="#faq"');
    });

    it("renders the hero section with festival title", async () => {
      const html = await renderPage();

      expect(html).toContain("Goa Startup Festival 2026");
      expect(html).toContain("Where ideas become enterprises");
    });

    it("renders Day 1 schedule events in server HTML", async () => {
      const html = await renderPage();

      // Day 1 events should be present in SSR output
      expect(html).toContain("Opening Ceremony");
      expect(html).toContain("Startup Pitch Contest");
      expect(html).toContain("Main Auditorium");
      expect(html).toContain("Innovation Hall");
      expect(html).toContain("Dr. Patel");
      expect(html).toContain("Raj Sharma");
    });

    it("renders static About and Highlights sections", async () => {
      const html = await renderPage();

      // About section
      expect(html).toContain('id="about"');
      // Highlights section
      expect(html).toContain('id="highlights"');
    });

    it("renders the footer with branding, links, and contact", async () => {
      const html = await renderPage();

      expect(html).toContain("<footer");
      expect(html).toContain("Goa Startup Festival 2026");
      expect(html).toContain("Jointly organized by PIERC, Parul University &amp; PU Goa");
      expect(html).toContain('href="#about"');
      expect(html).toContain('href="/login"');
      expect(html).toContain('href="/signup"');
      expect(html).toContain("ecell@goa.paruluniversity.ac.in");
    });

    it("renders the schedule section heading and programme content", async () => {
      const html = await renderPage();

      expect(html).toContain('id="schedule"');
      expect(html).toContain("Programme Schedule");
      // Day toggle controls present
      expect(html).toContain("Day 1 (2 Sept)");
      expect(html).toContain("Day 2 (3 Sept)");
    });

    it("renders anonymous viewer CTA (Register Now, not Dashboard)", async () => {
      const html = await renderPage();

      expect(html).toContain("Register Now");
      expect(html).toContain('href="/signup"');
      expect(html).not.toContain("Go to Dashboard");
    });
  });

  describe("session failure isolation", () => {
    beforeEach(() => {
      mockGetSession.mockRejectedValue(new Error("Session service unavailable"));
      mockLoadPublishedSchedule.mockResolvedValue(readySchedule);
    });

    it("renders the page shell successfully despite session failure", async () => {
      const html = await renderPage();

      // Page renders without throwing
      expect(html).toContain("Goa Startup Festival 2026");
      expect(html).toContain("<footer");
      expect(html).toContain("<nav");
    });

    it("falls back to anonymous viewer (shows Register, not Dashboard)", async () => {
      const html = await renderPage();

      expect(html).toContain("Register Now");
      expect(html).toContain('href="/signup"');
      expect(html).not.toContain("Go to Dashboard");
    });

    it("renders schedule content normally despite session failure", async () => {
      const html = await renderPage();

      expect(html).toContain("Opening Ceremony");
      expect(html).toContain("Programme Schedule");
    });
  });

  describe("schedule failure isolation", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue(null);
      mockLoadPublishedSchedule.mockRejectedValue(new Error("Database connection failed"));
    });

    it("renders the page shell (nav, hero, footer) despite schedule failure", async () => {
      const html = await renderPage();

      // Navigation
      expect(html).toContain("About");
      expect(html).toContain("Schedule");
      expect(html).toContain("FAQ");
      // Hero
      expect(html).toContain("Goa Startup Festival 2026");
      expect(html).toContain("Where ideas become enterprises");
      // Footer
      expect(html).toContain("<footer");
      expect(html).toContain("Jointly organized by PIERC, Parul University &amp; PU Goa");
    });

    it("displays the exact non-blocking unavailable message", async () => {
      const html = await renderPage();

      expect(html).toContain("Event data is temporarily unavailable.");
    });

    it("does not render any event cards", async () => {
      const html = await renderPage();

      expect(html).not.toContain("Opening Ceremony");
      expect(html).not.toContain("Startup Pitch Contest");
    });
  });

  describe("both session and schedule failure", () => {
    beforeEach(() => {
      mockGetSession.mockRejectedValue(new Error("Session service unavailable"));
      mockLoadPublishedSchedule.mockRejectedValue(new Error("Database connection failed"));
    });

    it("still renders the basic page shell", async () => {
      const html = await renderPage();

      // Navigation present
      expect(html).toContain("<nav");
      expect(html).toContain("About");
      // Hero with festival title
      expect(html).toContain("Goa Startup Festival 2026");
      // Footer present
      expect(html).toContain("<footer");
    });

    it("falls back to anonymous viewer and shows unavailable schedule", async () => {
      const html = await renderPage();

      // Anonymous: shows Register, not Dashboard
      expect(html).toContain("Register Now");
      expect(html).not.toContain("Go to Dashboard");
      // Schedule unavailable
      expect(html).toContain("Event data is temporarily unavailable.");
    });
  });
});
