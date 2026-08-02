// Feature: ui-rebuild, Property 9: Empty sponsor tiers are eliminated without reordering

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { prepareSponsorTiers } from "@/lib/landing/content/preparation";
import type { Sponsor, SponsorTier, SponsorTierName } from "@/lib/landing/content/contracts";
import { SPONSOR_TIER_NAMES } from "@/lib/landing/content/contracts";

/**
 * Validates: Requirements 8.5
 *
 * Property 9: Empty sponsor tiers are eliminated without reordering
 * For all arrays of sponsor tiers, tier preparation returns every and only tier
 * containing at least one sponsor, preserving the original order and sponsor records.
 */

/** Generate a valid Sponsor record */
const sponsorArb: fc.Arbitrary<Sponsor> = fc.record({
  id: fc.stringMatching(/^[a-z0-9-]+$/).filter(
    (s) => s.length >= 3 && s.length <= 20,
  ),
  name: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
  logo: fc.record({
    src: fc.constant("/logo.svg"),
    width: fc.integer({ min: 48, max: 400 }),
    height: fc.integer({ min: 24, max: 200 }),
    alt: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
  }),
});

/** Generate a tier name from the allowed set */
const tierNameArb: fc.Arbitrary<SponsorTierName> = fc.constantFrom(...SPONSOR_TIER_NAMES);

/** Generate a sponsor tier with an arbitrary number of sponsors (including empty) */
const sponsorTierArb: fc.Arbitrary<SponsorTier> = fc.record({
  name: tierNameArb,
  sponsors: fc.array(sponsorArb, { minLength: 0, maxLength: 5 }),
});

/** Generate an array of sponsor tiers */
const tierArrayArb: fc.Arbitrary<SponsorTier[]> = fc.array(sponsorTierArb, {
  minLength: 0,
  maxLength: 8,
});

describe("Property 9: Empty sponsor tiers are eliminated without reordering", () => {
  it("returns only tiers containing at least one sponsor, preserving original order and records", () => {
    fc.assert(
      fc.property(tierArrayArb, (tiers) => {
        const result = prepareSponsorTiers(tiers);

        // 1. Every returned tier has at least one sponsor
        for (const tier of result) {
          expect(tier.sponsors.length).toBeGreaterThan(0);
        }

        // 2. Every non-empty input tier appears in the result
        const nonEmptyInput = tiers.filter((t) => t.sponsors.length > 0);
        expect(result.length).toBe(nonEmptyInput.length);

        // 3. Retained tiers match the non-empty input tiers exactly (order preserved)
        for (let i = 0; i < result.length; i++) {
          expect(result[i]).toBe(nonEmptyInput[i]);
        }

        // 4. Sponsor records within retained tiers are unchanged
        for (let i = 0; i < result.length; i++) {
          expect(result[i].sponsors).toBe(nonEmptyInput[i].sponsors);
          expect(result[i].name).toBe(nonEmptyInput[i].name);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("returns an empty array when all tiers are empty", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ name: tierNameArb, sponsors: fc.constant([] as Sponsor[]) }),
          { minLength: 1, maxLength: 6 },
        ),
        (tiers) => {
          const result = prepareSponsorTiers(tiers);
          expect(result).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns all tiers unchanged when every tier is non-empty", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: tierNameArb,
            sponsors: fc.array(sponsorArb, { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 6 },
        ),
        (tiers) => {
          const result = prepareSponsorTiers(tiers);
          expect(result.length).toBe(tiers.length);
          for (let i = 0; i < result.length; i++) {
            expect(result[i]).toBe(tiers[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
