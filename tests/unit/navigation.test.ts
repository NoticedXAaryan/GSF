import { describe, expect, it } from "vitest";
import {
  FIXED_HEADER_OFFSET_PX,
  calculateAnchorDestination,
  enhanceHashNavigation,
  getSamePageSectionId,
  navigateToSection,
  sectionIdFromHash,
  type AnchorNavigationEnvironment,
} from "@/lib/landing/navigation";

function navigationEnvironment(
  targetTop: number | null,
  prefersReducedMotion = false,
) {
  const scrollCalls: Array<{ top: number; behavior: ScrollBehavior }> = [];
  const environment: AnchorNavigationEnvironment = {
    currentUrl: "https://festival.test/?view=public",
    scrollY: 120,
    prefersReducedMotion,
    getElementById: () =>
      targetTop === null ? null : { getBoundingClientRect: () => ({ top: targetTop }) },
    scrollTo: (options) => scrollCalls.push(options),
  };
  return { environment, scrollCalls };
}

describe("fixed-header anchor navigation", () => {
  it("calculates the 80px-offset destination", () => {
    expect(FIXED_HEADER_OFFSET_PX).toBe(80);
    expect(calculateAnchorDestination(260, 120)).toBe(300);
  });

  it("clamps destinations above the document start to zero", () => {
    expect(calculateAnchorDestination(-100, 40)).toBe(0);
  });

  it("safely decodes hash section IDs", () => {
    expect(sectionIdFromHash("#featured%20speakers")).toBe("featured speakers");
    expect(sectionIdFromHash("#")).toBeNull();
    expect(sectionIdFromHash("#%E0%A4%A")).toBeNull();
  });

  it("recognizes only same-document hash destinations", () => {
    const currentUrl = "https://festival.test/?view=public";
    expect(getSamePageSectionId("#about", currentUrl)).toBe("about");
    expect(getSamePageSectionId("https://festival.test/?view=public#faq", currentUrl)).toBe("faq");
    expect(getSamePageSectionId("/login#about", currentUrl)).toBeNull();
    expect(getSamePageSectionId("/?view=other#about", currentUrl)).toBeNull();
    expect(getSamePageSectionId("https://other.test/#about", currentUrl)).toBeNull();
  });


  it("smooth-scrolls an existing target to the calculated destination", () => {
    const { environment, scrollCalls } = navigationEnvironment(260);

    expect(navigateToSection("about", environment)).toBe(true);
    expect(scrollCalls).toEqual([{ top: 300, behavior: "smooth" }]);
  });

  it("uses immediate scrolling when reduced motion is preferred", () => {
    const { environment, scrollCalls } = navigationEnvironment(-100, true);

    expect(enhanceHashNavigation("#faq", environment)).toBe(true);
    expect(scrollCalls).toEqual([{ top: 0, behavior: "auto" }]);
  });

  it("leaves native navigation intact when a target is missing", () => {
    const { environment, scrollCalls } = navigationEnvironment(null);

    expect(enhanceHashNavigation("#missing", environment)).toBe(false);
    expect(scrollCalls).toEqual([]);
  });

  it("is safe during server rendering", () => {
    expect(() => enhanceHashNavigation("#about")).not.toThrow();
    expect(enhanceHashNavigation("#about")).toBe(false);
  });
});