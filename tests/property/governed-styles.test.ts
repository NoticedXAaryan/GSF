/**
 * Feature: ui-rebuild, Property 2: Governed styles use declared tokens
 *
 * For all color, spacing, border-radius, and shadow declarations used by
 * landing-page and authentication components, the declaration resolves to a
 * member of the corresponding Design System token set; every non-member value
 * is reported as a violation.
 *
 * Validates: Requirements 1.6, 11.8
 */

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  GOVERNED_TOKENS,
  NON_COLOR_SUFFIXES,
  scanGovernedStyles,
  type GovernedStyleCategory,
} from "@/lib/landing/style-governance";

// --- Generators ---

/** Pick a random category */
const arbCategory = fc.constantFrom<GovernedStyleCategory>(
  "color",
  "spacing",
  "radius",
  "shadow",
);

/** Pick a valid token from the given category */
function validTokenFor(category: GovernedStyleCategory): fc.Arbitrary<string> {
  switch (category) {
    case "color":
      return fc.constantFrom(...GOVERNED_TOKENS.colors);
    case "spacing":
      return fc.constantFrom(...GOVERNED_TOKENS.spacing);
    case "radius":
      return fc.constantFrom(...GOVERNED_TOKENS.radii);
    case "shadow":
      return fc.constantFrom(...GOVERNED_TOKENS.shadows);
  }
}

/** All valid tokens across all categories, used to generate invalid tokens by exclusion */
const ALL_TOKEN_VALUES = new Set([
  ...GOVERNED_TOKENS.colors,
  ...GOVERNED_TOKENS.spacing,
  ...GOVERNED_TOKENS.radii,
  ...GOVERNED_TOKENS.shadows,
]);

/** Generate an invalid (non-member) token string for a given category */
function invalidTokenFor(category: GovernedStyleCategory): fc.Arbitrary<string> {
  const members = new Set(tokenMembers(category));
  return fc
    .stringMatching(/^[a-z][a-z0-9-]{1,12}$/)
    .filter((s) => !members.has(s) && !ALL_TOKEN_VALUES.has(s))
    // Suffixes like `center`, `balance`, and `none` are not colour values, so
    // the scanner correctly ignores them after a colour prefix. Excluding them
    // keeps this generator producing genuinely invalid tokens.
    .filter((s) => !(category === "color" && NON_COLOR_SUFFIXES.has(s)));
}

function tokenMembers(category: GovernedStyleCategory): readonly string[] {
  if (category === "color") return GOVERNED_TOKENS.colors;
  if (category === "spacing") return GOVERNED_TOKENS.spacing;
  if (category === "radius") return GOVERNED_TOKENS.radii;
  return GOVERNED_TOKENS.shadows;
}

// --- Utility class generators ---

const COLOR_PREFIXES = ["bg", "text", "border", "outline", "fill", "stroke", "from", "via", "to"];
const SPACING_PREFIXES = ["p", "px", "py", "pt", "pr", "pb", "pl", "m", "mx", "my", "mt", "mr", "mb", "ml", "gap"];
const RADIUS_PREFIXES = ["rounded"];
const SHADOW_PREFIXES = ["shadow"];

function utilityPrefixFor(category: GovernedStyleCategory): fc.Arbitrary<string> {
  switch (category) {
    case "color":
      return fc.constantFrom(...COLOR_PREFIXES);
    case "spacing":
      return fc.constantFrom(...SPACING_PREFIXES);
    case "radius":
      return fc.constantFrom(...RADIUS_PREFIXES);
    case "shadow":
      return fc.constantFrom(...SHADOW_PREFIXES);
  }
}

/** Generate a valid utility class string for any category */
const arbValidUtility = arbCategory.chain((category) =>
  fc.tuple(utilityPrefixFor(category), validTokenFor(category)).map(
    ([prefix, token]) => ({ category, className: `${prefix}-${token}` }),
  ),
);

/** Generate an invalid utility class string for any category */
const arbInvalidUtility = arbCategory.chain((category) =>
  fc.tuple(utilityPrefixFor(category), invalidTokenFor(category)).map(
    ([prefix, token]) => ({ category, className: `${prefix}-${token}` }),
  ),
);

// --- CSS declaration generators ---

const CSS_PROPERTY_MAP: Record<GovernedStyleCategory, readonly string[]> = {
  color: ["color", "background-color", "border-color"],
  spacing: ["padding", "margin", "gap"],
  radius: ["border-radius"],
  shadow: ["box-shadow"],
};

const VARIABLE_PREFIX_MAP: Record<GovernedStyleCategory, string> = {
  color: "color",
  spacing: "space",
  radius: "radius",
  shadow: "shadow",
};

/** Generate a valid CSS declaration using var(--token) */
const arbValidDeclaration = arbCategory.chain((category) =>
  fc.tuple(
    fc.constantFrom(...CSS_PROPERTY_MAP[category]),
    validTokenFor(category),
  ).map(([prop, token]) => ({
    category,
    declaration: `${prop}: var(--${VARIABLE_PREFIX_MAP[category]}-${token})`,
  })),
);

/** Generate an invalid CSS declaration using a raw literal (not a token variable) */
const arbInvalidDeclaration = arbCategory.chain((category) =>
  fc.constantFrom(...CSS_PROPERTY_MAP[category]).map((prop) => {
    // Use raw hex/pixel/literal values which are never valid without a token variable
    const rawValues: Record<GovernedStyleCategory, string> = {
      color: "#ff0000",
      spacing: "13px",
      radius: "7px",
      shadow: "0 2px 4px rgba(0,0,0,0.3)",
    };
    return {
      category,
      declaration: `${prop}: ${rawValues[category]}`,
    };
  }),
);

// --- Property Tests ---

describe("Property 2: Governed styles use declared tokens", () => {
  it("valid utility classes produce zero violations", () => {
    fc.assert(
      fc.property(arbValidUtility, ({ className }) => {
        const source = { path: "test.tsx", content: `<div className="${className}" />` };
        const violations = scanGovernedStyles([source]);
        expect(violations).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it("invalid utility classes are reported as violations", () => {
    fc.assert(
      fc.property(arbInvalidUtility, ({ category, className }) => {
        const source = { path: "test.tsx", content: `<div className="${className}" />` };
        const violations = scanGovernedStyles([source]);
        expect(violations.length).toBeGreaterThanOrEqual(1);
        // The violation should be for the expected category
        const matching = violations.filter((v) => v.category === category);
        expect(matching.length).toBeGreaterThanOrEqual(1);
        // Violation should reference the file
        expect(matching[0].file).toBe("test.tsx");
      }),
      { numRuns: 100 },
    );
  });

  it("valid CSS declarations (using token variables) produce zero violations", () => {
    fc.assert(
      fc.property(arbValidDeclaration, ({ declaration }) => {
        const source = {
          path: "styles.tsx",
          content: `.card { ${declaration}; }`,
        };
        const violations = scanGovernedStyles([source]);
        expect(violations).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it("invalid CSS declarations (raw literals) are reported as violations", () => {
    fc.assert(
      fc.property(arbInvalidDeclaration, ({ category, declaration }) => {
        const source = {
          path: "styles.tsx",
          content: `.card { ${declaration}; }`,
        };
        const violations = scanGovernedStyles([source]);
        expect(violations.length).toBeGreaterThanOrEqual(1);
        const matching = violations.filter((v) => v.category === category);
        expect(matching.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it("mixed valid and invalid declarations report only the invalid ones", () => {
    fc.assert(
      fc.property(
        fc.tuple(arbValidUtility, arbInvalidUtility),
        ([valid, invalid]) => {
          const source = {
            path: "mixed.tsx",
            content: `<div className="${valid.className} ${invalid.className}" />`,
          };
          const violations = scanGovernedStyles([source]);
          // Should have at least one violation for the invalid one
          expect(violations.length).toBeGreaterThanOrEqual(1);
          // Every violation should be about the invalid category's token
          const hasInvalidCategory = violations.some((v) => v.category === invalid.category);
          expect(hasInvalidCategory).toBe(true);
          // Should not report the valid one as a violation
          const validViolation = violations.find(
            (v) => v.value === valid.className,
          );
          expect(validViolation).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("every non-member value is reported — no false negatives across multiple sources", () => {
    const arbInvalidSources = fc.array(
      arbInvalidUtility.map(({ category, className }) => ({
        category,
        className,
        path: `file-${className}.tsx`,
      })),
      { minLength: 1, maxLength: 5 },
    );

    fc.assert(
      fc.property(arbInvalidSources, (invalids) => {
        const sources = invalids.map(({ className, path }) => ({
          path,
          content: `<div className="${className}" />`,
        }));
        const violations = scanGovernedStyles(sources);
        // Each invalid source should produce at least one violation
        for (const { category, path } of invalids) {
          const matching = violations.filter(
            (v) => v.file === path && v.category === category,
          );
          expect(matching.length).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 100 },
    );
  }, 30000);
});
