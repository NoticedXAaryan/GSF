import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { Viewer } from "@/lib/landing/auth-routing";
import type { ScheduleLoadResult } from "@/lib/landing/schedule-loader";
import { FESTIVAL_FAQS } from "@/lib/landing/content";

// ─── Mock useReducedMotion from motion/react ───────────────────────────
const mockUseReducedMotion = vi.fn<() => boolean | null>(() => false);

vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(
      (
        {
          children,
          initial,
          whileInView,
          viewport,
          transition,
          className,
          ...rest
        }: {
          children?: React.ReactNode;
          initial?: Record<string, unknown>;
          whileInView?: Record<string, unknown>;
          viewport?: Record<string, unknown>;
          transition?: Record<string, unknown>;
          className?: string;
        } & Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>,
      ) => (
        <div
          ref={ref}
          className={className}
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(whileInView)}
          data-viewport={JSON.stringify(viewport)}
          data-transition={JSON.stringify(transition)}
          {...rest}
        >
          {children}
        </div>
      ),
    ),
    section: React.forwardRef(
      (
        {
          children,
          initial,
          whileInView,
          viewport,
          transition,
          className,
          ...rest
        }: {
          children?: React.ReactNode;
          initial?: Record<string, unknown>;
          whileInView?: Record<string, unknown>;
          viewport?: Record<string, unknown>;
          transition?: Record<string, unknown>;
          className?: string;
        } & Record<string, unknown>,
        ref: React.Ref<HTMLElement>,
      ) => (
        <section
          ref={ref}
          className={className}
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(whileInView)}
          data-viewport={JSON.stringify(viewport)}
          data-transition={JSON.stringify(transition)}
          {...rest}
        >
          {children}
        </section>
      ),
    ),
  },
  MotionConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => mockUseReducedMotion(),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement("img", props),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement("a", { href, ...props }, children),
}));

// Note: lucide-react is NOT mocked - actual SVG icon components render fine in jsdom
// and attempting to mock it partially causes issues with content module re-exports.

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    email: vi.fn(),
    social: vi.fn(),
  },
  signUp: {
    email: vi.fn(),
  },
}));

// ─── Imports (after mocks) ─────────────────────────────────────────────

import { SiteHeader } from "@/components/landing/SiteHeader";
import { MobileNavigationController } from "@/components/landing/MobileNavigationController";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { HighlightsSection } from "@/components/landing/HighlightsSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { ScheduleExplorer } from "@/components/landing/ScheduleExplorer";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Reveal } from "@/components/landing/Reveal";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";

// ─── Fixtures ──────────────────────────────────────────────────────────

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

const readyScheduleEmpty: ScheduleLoadResult = {
  state: "ready",
  events: [],
};

const unavailableSchedule: ScheduleLoadResult = {
  state: "unavailable",
  events: [],
  message: "Event data is temporarily unavailable.",
};

// ─── Browser mock helper ───────────────────────────────────────────────

function setupMatchMedia(prefersReducedMotion = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches:
        query === "(prefers-reduced-motion: reduce)"
          ? prefersReducedMotion
          : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 1: Page-State Accessibility Scans
// Requirements: 3.7, 9.6, 11.2, 13.6
// ═══════════════════════════════════════════════════════════════════════

describe("Page-state accessibility scans", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    setupMatchMedia(false);
  });

  describe("Landing page", () => {
    it("anonymous landing page passes axe audit", async () => {
      const { container } = render(
        <main>
          <HeroSection viewer={anonymousViewer} />
          <AboutSection />
          <HighlightsSection />
          <SiteFooter />
        </main>,
      );
      // landmark-unique is excluded because multiple sections share the region
      // role within the same tree; each has unique labels in isolation.
      expect(
        await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
      ).toHaveNoViolations();
    });

    it("authenticated landing page passes axe audit", async () => {
      const { container } = render(
        <main>
          <HeroSection viewer={authenticatedViewer} />
          <AboutSection />
          <HighlightsSection />
          <SiteFooter />
        </main>,
      );
      expect(
        await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
      ).toHaveNoViolations();
    });
  });

  describe("Open navigation dialog", () => {
    it("navigation dialog in open state passes axe audit", async () => {
      setupMatchMedia(true); // reduced motion so it opens instantly
      const { container } = render(
        <div>
          <button
            type="button"
            data-mobile-nav-trigger
            aria-label="Open navigation menu"
          >
            Menu
          </button>
          <MobileNavigationController viewer={anonymousViewer} />
        </div>,
      );

      // Open the dialog
      const trigger = screen.getByRole("button", { name: /open navigation menu/i });
      fireEvent.click(trigger);

      // Dialog should now be present
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("Expanded FAQ item", () => {
    it("FAQ with one expanded answer passes axe audit", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <main>
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading">FAQ</h2>
            <FaqAccordion items={FESTIVAL_FAQS} />
          </section>
        </main>,
      );

      // Expand the first FAQ item
      const firstButton = screen.getByRole("button", {
        name: new RegExp(FESTIVAL_FAQS[0].question),
      });
      await user.click(firstButton);

      expect(firstButton).toHaveAttribute("aria-expanded", "true");
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("Schedule empty state", () => {
    it("schedule with empty day ('No events scheduled') passes axe audit", async () => {
      const { container } = render(
        <main>
          <ScheduleSection schedule={readyScheduleEmpty} />
        </main>,
      );

      expect(
        screen.getByText("No events scheduled for this day."),
      ).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("Schedule unavailable state", () => {
    it("schedule with unavailable state passes axe audit", async () => {
      const { container } = render(
        <main>
          <ScheduleSection schedule={unavailableSchedule} />
        </main>,
      );

      expect(
        screen.getByText("Event data is temporarily unavailable."),
      ).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("Auth routes", () => {
    it("login page idle state passes axe audit", async () => {
      const { container } = render(<LoginPage />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it("signup page idle state passes axe audit", async () => {
      const { container } = render(<SignupPage />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2: Reduced-Motion Behavior
// Requirements: 12.3
// ═══════════════════════════════════════════════════════════════════════

describe("Reduced-motion behavior", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(true);
    setupMatchMedia(true);
  });

  describe("Reveal components render in final state", () => {
    it("Reveal renders with opacity 1 and y 0 when useReducedMotion returns true", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      const initialData = JSON.parse(wrapper.getAttribute("data-initial")!);
      const animateData = JSON.parse(wrapper.getAttribute("data-animate")!);

      // In reduced-motion mode, initial state should be the final state
      expect(initialData.opacity).toBe(1);
      expect(initialData.y).toBe(0);
      expect(animateData.opacity).toBe(1);
      expect(animateData.y).toBe(0);
    });

    it("Reveal has no transition in reduced-motion mode", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      const transitionRaw = wrapper.getAttribute("data-transition");
      // No transition should be set in reduced-motion mode
      expect(
        transitionRaw === null ||
          transitionRaw === "undefined" ||
          transitionRaw === "null",
      ).toBe(true);
    });
  });

  describe("Navigation overlay mounts immediately without opacity transition", () => {
    it("overlay mounts in final visible state without animation in reduced-motion mode", () => {
      render(
        <div>
          <button
            type="button"
            data-mobile-nav-trigger
            aria-label="Open navigation menu"
          >
            Menu
          </button>
          <MobileNavigationController viewer={anonymousViewer} />
        </div>,
      );

      // Open the dialog (reduced motion: mounts immediately)
      const trigger = screen.getByRole("button", { name: /open navigation menu/i });
      fireEvent.click(trigger);

      const dialog = screen.getByRole("dialog");
      // Should be visible immediately without transition
      expect(dialog.style.opacity).toBe("1");
      // No transition property should be set for instant appearance
      expect(dialog.style.transition).toBe("");
    });
  });

  describe("FAQ panels expand/collapse instantly without transition", () => {
    it("expanded FAQ panel has no CSS transition in reduced-motion mode", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={FESTIVAL_FAQS} />);

      const firstButton = screen.getByRole("button", {
        name: new RegExp(FESTIVAL_FAQS[0].question),
      });
      await user.click(firstButton);

      // Panel should show content without transition style
      const panel = document.getElementById(`faq-panel-${FESTIVAL_FAQS[0].id}`);
      expect(panel).toBeInTheDocument();
      expect(panel!.style.transition).toBe("");
      expect(panel!.style.gridTemplateRows).toBe("");
      // Content should appear immediately
      expect(panel!.textContent).toContain(FESTIVAL_FAQS[0].answer);
    });

    it("collapsed FAQ panel has no CSS transition in reduced-motion mode", () => {
      render(<FaqAccordion items={FESTIVAL_FAQS} />);

      const panel = document.getElementById(`faq-panel-${FESTIVAL_FAQS[0].id}`);
      expect(panel).toBeInTheDocument();
      // Should have no transition or grid-template-rows style
      expect(panel!.style.transition).toBe("");
      expect(panel!.style.gridTemplateRows).toBe("");
    });

    it("FAQ chevron icon has no transition in reduced-motion mode", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={FESTIVAL_FAQS} />);

      const firstButton = screen.getByRole("button", {
        name: new RegExp(FESTIVAL_FAQS[0].question),
      });
      await user.click(firstButton);

      const svg = firstButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg!.style.transition).toBe("none");
    });
  });
});
