import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/landing/SiteHeader";
import type { Viewer } from "@/lib/landing/auth-routing";

const anonymous: Viewer = { authenticated: false, role: null, dashboardPath: null };
const authenticated: Viewer = { authenticated: true, role: "Attendee", dashboardPath: "/dashboard/user" };

describe("SiteHeader server-rendered shell", () => {
  it("renders a sticky header with 80px height", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    expect(html).toContain("sticky");
    expect(html).toContain("top-0");
    expect(html).toContain("h-20");
  });

  it("renders logo linking to home", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    expect(html).toContain('href="/"');
    expect(html).toContain("GSF 2026");
  });

  it("renders all required desktop section links as hash anchors", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    expect(html).toContain('href="#about"');
    expect(html).toContain('href="#highlights"');
    expect(html).toContain('href="#schedule"');
    expect(html).toContain('href="#speakers"');
    expect(html).toContain('href="#faq"');
    expect(html).toContain("About");
    expect(html).toContain("Highlights");
    expect(html).toContain("Schedule");
    expect(html).toContain("Speakers");
    expect(html).toContain("FAQ");
  });

  it("renders Login and Register links for anonymous viewers", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    expect(html).toContain('href="/login"');
    expect(html).toContain("Login");
    expect(html).toContain('href="/signup"');
    expect(html).toContain("Register");
    expect(html).not.toContain("Dashboard");
  });

  it("renders Dashboard link for authenticated viewers", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: authenticated }));
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain("Dashboard");
    expect(html).not.toContain("Login");
    expect(html).not.toContain("Register");
  });

  it("hides desktop nav below 1024px breakpoint (desktop: prefix)", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    // Desktop nav uses hidden desktop:flex — hidden by default, shown at desktop breakpoint
    expect(html).toContain("hidden desktop:flex");
  });

  it("renders a mobile hamburger trigger visible below 1024px", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    expect(html).toContain("desktop:hidden");
    expect(html).toContain('aria-label="Open navigation menu"');
    expect(html).toContain('aria-haspopup="dialog"');
  });

  it("uses native hash links as no-JS baseline (no onClick handlers in server HTML)", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    // Server-rendered anchors should have plain hrefs, not event handlers
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("onClick");
  });

  it("includes main navigation landmark", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { viewer: anonymous }));
    expect(html).toContain('aria-label="Main navigation"');
    expect(html).toContain("<nav");
  });
});
