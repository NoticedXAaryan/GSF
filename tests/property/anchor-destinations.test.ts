// Feature: ui-rebuild, Property 4: Anchor destinations preserve the fixed-header offset
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  calculateAnchorDestination,
  FIXED_HEADER_OFFSET_PX,
} from "@/lib/landing/navigation";

/**
 * **Validates: Requirements 3.3**
 *
 * Property 4: Anchor destinations preserve the fixed-header offset
 *
 * For all non-negative target document positions and current scroll positions,
 * enhanced section navigation computes a destination equal to
 * `max(0, targetViewportTop + currentScrollY - 80)`.
 */
describe("Property 4: Anchor destinations preserve the fixed-header offset", () => {
  it("computes destination = max(0, targetViewportTop + currentScrollY - 80) for all non-negative inputs", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100_000 }), // targetViewportTop: non-negative viewport position
        fc.nat({ max: 100_000 }), // currentScrollY: non-negative scroll offset
        (targetViewportTop, currentScrollY) => {
          const result = calculateAnchorDestination(targetViewportTop, currentScrollY);
          const expected = Math.max(0, targetViewportTop + currentScrollY - FIXED_HEADER_OFFSET_PX);

          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("always clamps the result to >= 0", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100_000 }), // targetViewportTop
        fc.nat({ max: 100_000 }), // currentScrollY
        (targetViewportTop, currentScrollY) => {
          const result = calculateAnchorDestination(targetViewportTop, currentScrollY);
          expect(result).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("uses 80px as the fixed header offset constant", () => {
    expect(FIXED_HEADER_OFFSET_PX).toBe(80);
  });
});
