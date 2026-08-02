// Feature: ui-rebuild, Property 13: Reduced motion produces immediate final state

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  projectAnimation,
  PAGE_ANIMATION_EASING,
  MIN_PAGE_ANIMATION_DURATION_MS,
  MAX_PAGE_ANIMATION_DURATION_MS,
  MAX_REVEAL_TRANSLATE_Y_PX,
  type AnimationDescriptor,
} from "@/lib/landing/motion";

/**
 * **Validates: Requirements 12.3**
 *
 * Property 13: Reduced motion produces immediate final state
 *
 * For all supported page animation descriptors, applying the reduced-motion
 * policy yields the descriptor's final visual state immediately with no
 * transform or opacity transition.
 */

/**
 * Arbitrary that generates valid (approved) animation descriptors within the
 * design system's policy bounds: opacity in [0,1], y translate distance in
 * [0, MAX_REVEAL_TRANSLATE_Y_PX], duration in [MIN, MAX], and easeOut easing.
 */
const approvedAnimationDescriptorArb: fc.Arbitrary<AnimationDescriptor> = fc
  .tuple(
    fc.double({ min: 0, max: 1, noNaN: true }), // initial opacity
    fc.double({ min: 0, max: 1, noNaN: true }), // final opacity
    fc.integer({ min: 0, max: MAX_REVEAL_TRANSLATE_Y_PX }), // initial y (distance from final)
    fc.integer({ min: MIN_PAGE_ANIMATION_DURATION_MS, max: MAX_PAGE_ANIMATION_DURATION_MS }), // duration
  )
  .map(([initialOpacity, finalOpacity, initialY, durationMs]) => ({
    initial: { opacity: initialOpacity, y: initialY },
    final: { opacity: finalOpacity, y: 0 },
    durationMs,
    easing: PAGE_ANIMATION_EASING,
  }));

describe("Property 13: Reduced motion produces immediate final state", () => {
  it("initial and animate states both equal the descriptor's final state when reduced motion is active", () => {
    fc.assert(
      fc.property(approvedAnimationDescriptorArb, (descriptor) => {
        const projection = projectAnimation(descriptor, true);

        // Both initial and animate must be the final visual state
        expect(projection.initial.opacity).toBe(descriptor.final.opacity);
        expect(projection.initial.y).toBe(descriptor.final.y);
        expect(projection.animate.opacity).toBe(descriptor.final.opacity);
        expect(projection.animate.y).toBe(descriptor.final.y);
      }),
      { numRuns: 100 },
    );
  });

  it("no transition property exists under reduced motion (no duration or easing applied)", () => {
    fc.assert(
      fc.property(approvedAnimationDescriptorArb, (descriptor) => {
        const projection = projectAnimation(descriptor, true);

        // The transition field must be absent — no duration or easing means
        // the element is placed in its final state immediately
        expect(projection.transition).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("no opacity transition remains: initial opacity equals final opacity", () => {
    fc.assert(
      fc.property(approvedAnimationDescriptorArb, (descriptor) => {
        const projection = projectAnimation(descriptor, true);

        // Opacity should not transition — both states show the final value
        expect(projection.initial.opacity).toBe(projection.animate.opacity);
      }),
      { numRuns: 100 },
    );
  });

  it("no transform transition remains: initial y equals final y (0)", () => {
    fc.assert(
      fc.property(approvedAnimationDescriptorArb, (descriptor) => {
        const projection = projectAnimation(descriptor, true);

        // Y transform should not transition — both states show the final value (0)
        expect(projection.initial.y).toBe(0);
        expect(projection.animate.y).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});
