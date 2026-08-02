// Feature: ui-rebuild, Property 12: Busy auth states disable all controls
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  type AuthFormState,
  type AuthFormPolicy,
  deriveAuthFormPolicy,
  isAuthBusy,
} from "@/lib/landing/auth-form";

/**
 * Validates: Requirements 11.9
 *
 * Property 12: Busy auth states disable all controls
 * For all authentication form states and rendered form controls, every input and
 * action is disabled and a loading indicator is present if and only if the state
 * is submitting, initiating OAuth, or redirecting.
 */

// The complete set of auth form state kinds
const BUSY_STATE_KINDS = ["submitting", "oauthRedirecting", "redirecting"] as const;
const NON_BUSY_STATE_KINDS = ["idle", "invalid", "apiError"] as const;
const ALL_STATE_KINDS = [...BUSY_STATE_KINDS, ...NON_BUSY_STATE_KINDS] as const;

// Control kinds that should be affected by busy state
const CONTROL_KINDS = [
  "emailInput",
  "passwordInput",
  "nameInput",
  "submitButton",
  "oauthButton",
  "passwordToggle",
] as const;

type ControlKind = (typeof CONTROL_KINDS)[number];

// Generator: an arbitrary AuthFormState
const authFormStateArb: fc.Arbitrary<AuthFormState> = fc.oneof(
  fc.constant<AuthFormState>({ kind: "idle", apiError: null }),
  fc.constant<AuthFormState>({ kind: "invalid", apiError: null }),
  fc.constant<AuthFormState>({ kind: "submitting", apiError: null }),
  fc.constant<AuthFormState>({ kind: "oauthRedirecting", apiError: null }),
  fc.constant<AuthFormState>({ kind: "redirecting", apiError: null }),
  fc.string({ minLength: 1, maxLength: 100 }).map(
    (msg): AuthFormState => ({ kind: "apiError", apiError: msg }),
  ),
);

// Generator: an arbitrary control kind
const controlKindArb: fc.Arbitrary<ControlKind> = fc.constantFrom(...CONTROL_KINDS);

// Helper: check whether a given state kind is a busy state
function expectedBusy(kind: string): boolean {
  return (BUSY_STATE_KINDS as readonly string[]).includes(kind);
}

describe("Property 12: Busy auth states disable all controls", () => {
  it("isBusy returns true if and only if the state is submitting, oauthRedirecting, or redirecting", () => {
    fc.assert(
      fc.property(authFormStateArb, (state) => {
        const busy = isAuthBusy(state);
        expect(busy).toBe(expectedBusy(state.kind));
      }),
      { numRuns: 100 },
    );
  });

  it("controlsDisabled is true if and only if the state is busy", () => {
    fc.assert(
      fc.property(authFormStateArb, (state) => {
        const policy = deriveAuthFormPolicy(state);
        expect(policy.controlsDisabled).toBe(expectedBusy(state.kind));
      }),
      { numRuns: 100 },
    );
  });

  it("showLoadingIndicator is true if and only if the state is busy", () => {
    fc.assert(
      fc.property(authFormStateArb, (state) => {
        const policy = deriveAuthFormPolicy(state);
        expect(policy.showLoadingIndicator).toBe(expectedBusy(state.kind));
      }),
      { numRuns: 100 },
    );
  });

  it("for every auth state and control kind, disabling occurs iff the state is busy", () => {
    fc.assert(
      fc.property(authFormStateArb, controlKindArb, (state, _controlKind) => {
        const policy = deriveAuthFormPolicy(state);
        const shouldBeBusy = expectedBusy(state.kind);

        // All controls are uniformly disabled/enabled based on busy state
        expect(policy.controlsDisabled).toBe(shouldBeBusy);
        // Loading indicator is present iff busy
        expect(policy.showLoadingIndicator).toBe(shouldBeBusy);
        // isBusy is consistent
        expect(policy.isBusy).toBe(shouldBeBusy);
      }),
      { numRuns: 200 },
    );
  });

  it("policy fields are internally consistent: isBusy ↔ controlsDisabled ↔ showLoadingIndicator", () => {
    fc.assert(
      fc.property(authFormStateArb, (state) => {
        const policy = deriveAuthFormPolicy(state);

        // All three policy fields must agree (biconditional)
        expect(policy.isBusy).toBe(policy.controlsDisabled);
        expect(policy.isBusy).toBe(policy.showLoadingIndicator);
        expect(policy.controlsDisabled).toBe(policy.showLoadingIndicator);
      }),
      { numRuns: 100 },
    );
  });

  it("non-busy states never disable controls or show loading", () => {
    const nonBusyStateArb: fc.Arbitrary<AuthFormState> = fc.oneof(
      fc.constant<AuthFormState>({ kind: "idle", apiError: null }),
      fc.constant<AuthFormState>({ kind: "invalid", apiError: null }),
      fc.string({ minLength: 1, maxLength: 100 }).map(
        (msg): AuthFormState => ({ kind: "apiError", apiError: msg }),
      ),
    );

    fc.assert(
      fc.property(nonBusyStateArb, controlKindArb, (state, _controlKind) => {
        const policy = deriveAuthFormPolicy(state);
        expect(policy.isBusy).toBe(false);
        expect(policy.controlsDisabled).toBe(false);
        expect(policy.showLoadingIndicator).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("busy states always disable all controls and show loading", () => {
    const busyStateArb: fc.Arbitrary<AuthFormState> = fc.constantFrom<AuthFormState>(
      { kind: "submitting", apiError: null },
      { kind: "oauthRedirecting", apiError: null },
      { kind: "redirecting", apiError: null },
    );

    fc.assert(
      fc.property(busyStateArb, controlKindArb, (state, _controlKind) => {
        const policy = deriveAuthFormPolicy(state);
        expect(policy.isBusy).toBe(true);
        expect(policy.controlsDisabled).toBe(true);
        expect(policy.showLoadingIndicator).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
