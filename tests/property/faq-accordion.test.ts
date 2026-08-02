// Feature: ui-rebuild, Property 10: Accordion reducer maintains single-open toggle semantics
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  type FaqAccordionState,
  INITIAL_FAQ_ACCORDION_STATE,
  createFaqAccordionReducer,
} from "@/lib/landing/faq-accordion";

/**
 * Validates: Requirements 9.2, 9.4, 9.5
 *
 * Property 10: Accordion reducer maintains single-open toggle semantics
 * For all valid FAQ ID sets and all activation sequences, accordion state begins
 * as `null`, is always either `null` or one valid ID, changes to a newly activated
 * ID, and changes to `null` when the currently open ID is activated again.
 */

// Generator: non-empty set of unique FAQ IDs (1–20 IDs)
const faqIdSetArb = fc
  .uniqueArray(fc.string({ minLength: 1, maxLength: 30 }), {
    minLength: 1,
    maxLength: 20,
  });

// Generator: activation sequence (series of ID activations using IDs from the set)
function activationSequenceArb(ids: readonly string[]) {
  return fc.array(fc.constantFrom(...ids), { minLength: 1, maxLength: 50 });
}

// Generator: activation sequence that may include invalid IDs
function mixedActivationSequenceArb(ids: readonly string[]) {
  const validIdArb = fc.constantFrom(...ids);
  const invalidIdArb = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => !ids.includes(s));
  const actionArb = fc.oneof(validIdArb, invalidIdArb);
  return fc.array(actionArb, { minLength: 1, maxLength: 50 });
}

describe("Property 10: Accordion reducer maintains single-open toggle semantics", () => {
  it("initial state is null (all collapsed)", () => {
    fc.assert(
      fc.property(faqIdSetArb, (_ids) => {
        expect(INITIAL_FAQ_ACCORDION_STATE).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it("state is always null or one valid ID after any activation sequence", () => {
    fc.assert(
      fc.property(
        faqIdSetArb.chain((ids) =>
          fc.tuple(fc.constant(ids), mixedActivationSequenceArb(ids)),
        ),
        ([ids, sequence]) => {
          const reducer = createFaqAccordionReducer(ids);
          const validIdSet = new Set(ids);

          let state: FaqAccordionState = INITIAL_FAQ_ACCORDION_STATE;
          for (const id of sequence) {
            state = reducer(state, { type: "activate", id });
            expect(
              state === null || validIdSet.has(state),
              `State must be null or a valid ID, got: ${state}`,
            ).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("activating a new ID opens it (state becomes that ID)", () => {
    fc.assert(
      fc.property(
        faqIdSetArb.filter((ids) => ids.length >= 2).chain((ids) =>
          fc.tuple(
            fc.constant(ids),
            fc.constantFrom(...ids),
            fc.constantFrom(...ids),
          ),
        ).filter(([_ids, current, next]) => current !== next),
        ([ids, current, next]) => {
          const reducer = createFaqAccordionReducer(ids);
          // Start from a state where `current` is open
          const result = reducer(current, { type: "activate", id: next });
          expect(result).toBe(next);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("activating the currently open ID closes it (returns null)", () => {
    fc.assert(
      fc.property(
        faqIdSetArb.chain((ids) =>
          fc.tuple(fc.constant(ids), fc.constantFrom(...ids)),
        ),
        ([ids, openId]) => {
          const reducer = createFaqAccordionReducer(ids);
          const result = reducer(openId, { type: "activate", id: openId });
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("activating from null opens the activated ID", () => {
    fc.assert(
      fc.property(
        faqIdSetArb.chain((ids) =>
          fc.tuple(fc.constant(ids), fc.constantFrom(...ids)),
        ),
        ([ids, targetId]) => {
          const reducer = createFaqAccordionReducer(ids);
          const result = reducer(null, { type: "activate", id: targetId });
          expect(result).toBe(targetId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("invalid IDs are rejected without changing valid state", () => {
    fc.assert(
      fc.property(
        faqIdSetArb.chain((ids) =>
          fc.tuple(
            fc.constant(ids),
            fc.oneof(fc.constant(null), fc.constantFrom(...ids)),
            fc.string({ minLength: 1, maxLength: 30 }).filter((s) => !ids.includes(s)),
          ),
        ),
        ([ids, currentState, invalidId]) => {
          const reducer = createFaqAccordionReducer(ids);
          const result = reducer(currentState, { type: "activate", id: invalidId });
          // State should remain unchanged when an invalid ID is activated
          expect(result).toBe(currentState);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("full activation sequence maintains single-open invariant throughout", () => {
    fc.assert(
      fc.property(
        faqIdSetArb.chain((ids) =>
          fc.tuple(fc.constant(ids), activationSequenceArb(ids)),
        ),
        ([ids, sequence]) => {
          const reducer = createFaqAccordionReducer(ids);
          const validIdSet = new Set(ids);

          let state: FaqAccordionState = INITIAL_FAQ_ACCORDION_STATE;
          // Initial state is null
          expect(state).toBeNull();

          for (const id of sequence) {
            const prevState = state;
            state = reducer(state, { type: "activate", id });

            // Invariant: state is always null or a single valid ID
            expect(
              state === null || validIdSet.has(state),
            ).toBe(true);

            // Toggle semantics: if we activated the same ID that was open, it closes
            if (prevState === id) {
              expect(state).toBeNull();
            } else {
              // Otherwise it opens the new ID
              expect(state).toBe(id);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
