import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { axe } from "jest-axe";

import type { Viewer } from "@/lib/landing/auth-routing";
import { SiteHeader } from "@/components/landing/SiteHeader";

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

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Menu: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "menu-icon" }),
  X: (props: Record<string, unknown>) =>
    React.createElement("svg", { ...props, "data-testid": "x-icon" }),
}));

// ─── Test Fixtures ─────────────────────────────────────────────────────
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

// ─── Helper: Setup matchMedia and related browser APIs ─────────────────
function setupBrowserMocks(options: {
  prefersReducedMotion?: boolean;
  isDesktop?: boolean;
} = {}) {
  const { prefersReducedMotion = false, isDesktop = false } = options;

  const mediaQueryListeners: Map<string, Set<(e: MediaQueryListEvent) => void>> = new Map();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => {
      const matches =
        query === "(prefers-reduced-motion: reduce)"
          ? prefersReducedMotion
          : query === "(min-width: 64rem)"
            ? isDesktop
            : false;

      if (!mediaQueryListeners.has(query)) {
        mediaQueryListeners.set(query, new Set());
      }

      return {
        matches,
        media: query,
        addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
          mediaQueryListeners.get(query)?.add(handler);
        },
        removeEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
          mediaQueryListeners.get(query)?.delete(handler);
        },
        dispatchEvent: () => true,
      };
    }),
  });

  return {
    triggerBreakpointChange: (query: string, matches: boolean) => {
      const listeners = mediaQueryListeners.get(query);
      if (listeners) {
        for (const handler of listeners) {
          handler({ matches, media: query } as MediaQueryListEvent);
        }
      }
    },
  };
}

// ─── Desktop Link Inventory ────────────────────────────────────────────
describe("SiteHeader – Desktop Link Inventory", () => {
  beforeEach(() => {
    setupBrowserMocks();
  });

  it("renders all required section hash links: About, Highlights, Schedule, Speakers, FAQ", () => {
    render(<SiteHeader viewer={anonymousViewer} />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });

    const expectedLinks = [
      { label: "About", href: "#about" },
      { label: "Highlights", href: "#highlights" },
      { label: "Schedule", href: "#schedule" },
      { label: "Speakers", href: "#speakers" },
      { label: "FAQ", href: "#faq" },
    ];

    for (const expected of expectedLinks) {
      const link = within(nav).getByRole("link", { name: expected.label });
      expect(link).toHaveAttribute("href", expected.href);
    }
  });

  it("renders Login link to /login and Register link to /signup for anonymous viewer", () => {
    render(<SiteHeader viewer={anonymousViewer} />);
    const loginLink = screen.getByRole("link", { name: "Login" });
    expect(loginLink).toHaveAttribute("href", "/login");

    const registerLink = screen.getByRole("link", { name: "Register" });
    expect(registerLink).toHaveAttribute("href", "/signup");
  });

  it("renders Dashboard link to /dashboard for authenticated viewer", () => {
    render(<SiteHeader viewer={authenticatedViewer} />);
    const dashLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashLink).toHaveAttribute("href", "/dashboard");

    // Login and Register should not be present
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
  });
});

// ─── Mobile Hamburger Button ───────────────────────────────────────────
describe("SiteHeader – Mobile Hamburger Trigger", () => {
  beforeEach(() => {
    setupBrowserMocks();
  });

  it("renders hamburger button with aria-label and aria-haspopup='dialog'", () => {
    render(<SiteHeader viewer={anonymousViewer} />);
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("has data-mobile-nav-trigger attribute for programmatic access", () => {
    render(<SiteHeader viewer={anonymousViewer} />);
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    expect(trigger).toHaveAttribute("data-mobile-nav-trigger");
  });
});

// ─── Mobile Overlay – Modal Semantics ──────────────────────────────────
describe("MobileNavigationController – Modal Semantics", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("opens overlay with role='dialog' and aria-modal='true' on trigger click", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("overlay has aria-label for accessibility", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Navigation menu");
  });

  it("renders an accessible close button inside the overlay", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    expect(closeButton).toBeInTheDocument();
  });
});

// ─── Focus Cycling (Focus Trap) ────────────────────────────────────────
describe("MobileNavigationController – Focus Trap", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("moves focus to close button when dialog opens", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    expect(document.activeElement).toBe(closeButton);
  });

  it("cycles focus from last to first focusable element on Tab", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const lastFocusable = focusables[focusables.length - 1];
    const firstFocusable = focusables[0];

    // Focus last element
    act(() => lastFocusable.focus());
    expect(document.activeElement).toBe(lastFocusable);

    // Tab forward from last should wrap to first
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(firstFocusable);
  });

  it("cycles focus from first to last focusable element on Shift+Tab", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    // Focus first element
    act(() => firstFocusable.focus());
    expect(document.activeElement).toBe(firstFocusable);

    // Shift+Tab from first should wrap to last
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastFocusable);
  });
});

// ─── Focus Restoration ─────────────────────────────────────────────────
describe("MobileNavigationController – Focus Restoration", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("returns focus to trigger button when dialog is closed via close button", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    fireEvent.click(closeButton);

    expect(document.activeElement).toBe(trigger);
  });

  it("returns focus to trigger button when dialog is closed via Escape", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(document.activeElement).toBe(trigger);
  });
});

// ─── Escape Key Closes Overlay ─────────────────────────────────────────
describe("MobileNavigationController – Escape Close", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("closes the overlay on Escape key press", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ─── Clicking Nav Link Closes Overlay ──────────────────────────────────
describe("MobileNavigationController – Link Close", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("closes the overlay when a hash navigation link is clicked", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    const aboutLink = within(dialog).getByRole("link", { name: "About" });
    fireEvent.click(aboutLink);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the overlay when a route link (Login) is clicked", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    const loginLink = within(dialog).getByRole("link", { name: "Login" });
    fireEvent.click(loginLink);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ─── Breakpoint Closing ────────────────────────────────────────────────
describe("MobileNavigationController – Breakpoint Close", () => {
  it("closes the overlay when viewport transitions to desktop (>=1024px)", () => {
    const { triggerBreakpointChange } = setupBrowserMocks({ prefersReducedMotion: true });

    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Simulate breakpoint change to desktop
    act(() => {
      triggerBreakpointChange("(min-width: 64rem)", true);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ─── Scroll Lock ───────────────────────────────────────────────────────
describe("MobileNavigationController – Scroll Lock", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
    document.body.style.overflow = "";
  });

  it("locks body scroll (overflow: hidden) when overlay opens", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when overlay closes via close button", () => {
    document.body.style.overflow = "auto";

    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    fireEvent.click(closeButton);

    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores body scroll when overlay closes via Escape", () => {
    document.body.style.overflow = "scroll";

    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(document.body.style.overflow).toBe("scroll");
  });
});

// ─── Missing Target Safety ─────────────────────────────────────────────
describe("MobileNavigationController – Missing Target Safety", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("does not crash when a hash link targets a non-existent section", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    // Click a hash link — the target section element doesn't exist in the test DOM
    const dialog = screen.getByRole("dialog");
    const aboutLink = within(dialog).getByRole("link", { name: "About" });

    // This should not throw
    expect(() => fireEvent.click(aboutLink)).not.toThrow();

    // Overlay should still close
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ─── Reduced Motion ────────────────────────────────────────────────────
describe("MobileNavigationController – Reduced Motion", () => {
  it("opens without transition when prefers-reduced-motion is active", () => {
    setupBrowserMocks({ prefersReducedMotion: true });

    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    // When reduced motion is active, the overlay should mount immediately
    // with full opacity and no transition style
    expect(dialog.style.opacity).toBe("1");
    expect(dialog.style.transition).toBeFalsy();
  });

  it("closes without transition when prefers-reduced-motion is active", () => {
    setupBrowserMocks({ prefersReducedMotion: true });

    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    fireEvent.click(closeButton);

    // Dialog should be removed immediately (no delayed animation)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ─── Keyboard Operation ────────────────────────────────────────────────
describe("MobileNavigationController – Keyboard Operation", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("opens overlay with Enter key on trigger button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    act(() => trigger.focus());
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens overlay with Space key on trigger button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    act(() => trigger.focus());
    await user.keyboard(" ");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("close button activates with Enter key", async () => {
    const user = userEvent.setup();
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    act(() => closeButton.focus());
    await user.keyboard("{Enter}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("close button activates with Space key", async () => {
    const user = userEvent.setup();
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
    act(() => closeButton.focus());
    await user.keyboard(" ");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ─── Mobile Overlay – Auth Variants ────────────────────────────────────
describe("MobileNavigationController – Auth Variants in Overlay", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("shows Login and Register links in overlay for anonymous viewer", () => {
    render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(within(dialog).getByRole("link", { name: "Register" })).toHaveAttribute("href", "/signup");
    expect(within(dialog).queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
  });

  it("shows Dashboard link in overlay for authenticated viewer", () => {
    render(<SiteHeader viewer={authenticatedViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(within(dialog).queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
  });
});

// ─── Offset Navigation ─────────────────────────────────────────────────
describe("SiteHeader – Offset Navigation", () => {
  it("header is 80px tall (h-20 class) for offset clearance", () => {
    setupBrowserMocks();
    const { container } = render(<SiteHeader viewer={anonymousViewer} />);
    const header = container.querySelector("header");
    expect(header?.className).toMatch(/h-20/);
  });

  it("header is sticky positioned", () => {
    setupBrowserMocks();
    const { container } = render(<SiteHeader viewer={anonymousViewer} />);
    const header = container.querySelector("header");
    expect(header?.className).toMatch(/sticky/);
    expect(header?.className).toMatch(/top-0/);
  });
});

// ─── Accessibility Scan ────────────────────────────────────────────────
describe("SiteHeader – Accessibility", () => {
  beforeEach(() => {
    setupBrowserMocks({ prefersReducedMotion: true });
  });

  it("passes axe audit for anonymous header", async () => {
    const { container } = render(<SiteHeader viewer={anonymousViewer} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("passes axe audit for authenticated header", async () => {
    const { container } = render(<SiteHeader viewer={authenticatedViewer} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("passes axe audit with open navigation dialog", async () => {
    const { container } = render(<SiteHeader viewer={anonymousViewer} />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
