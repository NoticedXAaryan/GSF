// Feature: ui-rebuild, Property 14: Reveal animations occur at most once
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  type RevealState,
  INITIAL_REVEAL_STATE,
  REVEAL_INTERSECTION_THRESHOLD,
  advanceRevealState,
} from "@/lib/landing/motion";

/**
 * Validates: Requirements 12.6
 *
 * Property 14: Reveal animations occur at most once
 *
 * For all sequences of intersection ratios, a revealable element remains hidden
 * until a ratio reaches at least 0.2, transitions to revealed at most once, and
 * remains revealed for every subsequent ratio.
 */

// Generator: intersection ratio between 0.0 and 1.0
const intersectionRatioArb: fc.Arbitrary<number> = fc.double({
  min: 0,
  max: 1,
  noNaN: true,
});

// Generator: sequence of intersection ratios (simulates scrolling behavior)
const ratioSequenceArb: fc.Arbitrary<number[]> = fc.array(intersectionRatioArb, {
  minLength: 1,
  maxLength: 50,
});

describe("Property 14: Reveal animations occur at most once", () => {
  it("initial state is hidden", () => {
    fc.assert(
      fc.property(ratioSequenceArb, (_seq) => {
        expect(INITIAL_REVEAL_STATE).toBe("hidden");
      }),
      { numRuns: 100 },
    );
  });

  it("element stays hidden while all ratios are below the 0.2 threshold", () => {
    const belowThresholdRatioArb = fc.double({
      min: 0,
      max: REVEAL_INTERSECTION_THRESHOLD,
      noNaN: true,
    }).filter((r) => r < REVEAL_INTERSECTION_THRESHOLD);

    const belowThresholdSequenceArb = fc.array(belowThresholdRatioArb, {
      minLength: 1,
      maxLength: 50,
    });

    fc.assert(
      fc.property(belowThresholdSequenceArb, (sequence) => {
        let state: RevealState = INITIAL_REVEAL_STATE;
        for (const ratio of sequence) {
          state = advanceRevealState(state, ratio);
          expect(state).toBe("hidden");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("element transitions to revealed once a ratio reaches at least 0.2", () => {
    const atOrAboveThresholdArb = fc.double({
      min: REVEAL_INTERSECTION_THRESHOLD,
      max: 1,
      noNaN: true,
    });

    fc.assert(
      fc.property(atOrAboveThresholdArb, (ratio) => {
        const state = advanceRevealState(INITIAL_REVEAL_STATE, ratio);
        expect(state).toBe("revealed");
      }),
      { numRuns: 100 },
    );
  });

  it("once revealed, element remains revealed for every subsequent ratio", () => {
    fc.assert(
      fc.property(ratioSequenceArb, (sequence) => {
        let state: RevealState = INITIAL_REVEAL_STATE;
        let hasTransitioned = false;

        for (const ratio of sequence) {
          state = advanceRevealState(state, ratio);

          if (state === "revealed") {
            hasTransitioned = true;
          }

          // Once transitioned, must stay revealed regardless of subsequent ratios
          if (hasTransitioned) {
            expect(state).toBe("revealed");
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("transition to revealed occurs at most once across any ratio sequence", () => {
    fc.assert(
      fc.property(ratioSequenceArb, (sequence) => {
        let state: RevealState = INITIAL_REVEAL_STATE;
        let transitionCount = 0;

        for (const ratio of sequence) {
          const prevState = state;
          state = advanceRevealState(state, ratio);

          if (prevState === "hidden" && state === "revealed") {
            transitionCount++;
          }
        }

        expect(transitionCount).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it("full intersection-ratio sequences respect threshold and sticky revealed-state semantics", () => {
    fc.assert(
      fc.property(ratioSequenceArb, (sequence) => {
        let state: RevealState = INITIAL_REVEAL_STATE;
        let revealedOnce = false;

        for (const ratio of sequence) {
          const prevState = state;
          state = advanceRevealState(state, ratio);

          if (!revealedOnce) {
            // Before first reveal: must be hidden if ratio < threshold
            if (ratio < REVEAL_INTERSECTION_THRESHOLD) {
              expect(state).toBe("hidden");
            } else {
              // ratio >= threshold triggers reveal
              expect(state).toBe("revealed");
              revealedOnce = true;
            }
          } else {
            // After reveal: must remain revealed (sticky)
            expect(state).toBe("revealed");
          }

          // No backward transition is ever allowed
          if (prevState === "revealed") {
            expect(state).toBe("revealed");
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
