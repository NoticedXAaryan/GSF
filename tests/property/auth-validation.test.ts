// Feature: ui-rebuild, Property 11: Auth validation accepts exactly the valid field domain
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  AUTH_FIELD_ERRORS,
  canInvokeAuthentication,
  isValidAuthEmail,
  validateLogin,
  validateSignup,
  type AuthFormState,
  type AuthValidationResult,
  type LoginValues,
  type SignupValues,
} from "@/lib/landing/auth-form";

/**
 * Validates: Requirements 11.2
 *
 * Property 11: Auth validation accepts exactly the valid field domain
 * For all login and signup string inputs, validation accepts a form only when every
 * required field is non-empty, the email satisfies the project email predicate, the
 * password contains at least eight characters, and signup name contains at least one
 * non-whitespace character; rejected forms produce errors for exactly the failed
 * predicates and do not invoke authentication.
 */

// --- Generators ---

// Unicode string generator (includes wide range of Unicode characters)
const unicodeStringArb = fc.string({ minLength: 0, maxLength: 50, unit: "grapheme-composite" });

// Login values with arbitrary Unicode strings
const loginValuesArb: fc.Arbitrary<LoginValues> = fc.record({
  email: unicodeStringArb,
  password: unicodeStringArb,
});

// Signup values with arbitrary Unicode strings
const signupValuesArb: fc.Arbitrary<SignupValues> = fc.record({
  name: unicodeStringArb,
  email: unicodeStringArb,
  password: unicodeStringArb,
});

// Generator for valid email strings (matches the project predicate)
const validEmailArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 15 }).filter((s) => !s.includes("@") && !s.includes(" ")),
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => !s.includes("@") && !s.includes(" ") && !s.includes(".")),
    fc.string({ minLength: 1, maxLength: 5 }).filter((s) => !s.includes("@") && !s.includes(" ") && !s.includes(".")),
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

// Generator for valid passwords (at least 8 characters)
const validPasswordArb = fc.string({ minLength: 8, maxLength: 50, unit: "grapheme-composite" });

// Generator for valid names (at least one non-whitespace character after trim)
const validNameArb = fc
  .string({ minLength: 1, maxLength: 30, unit: "grapheme-composite" })
  .filter((s) => s.trim().length > 0);

// Generator for valid login values
const validLoginValuesArb: fc.Arbitrary<LoginValues> = fc.record({
  email: validEmailArb,
  password: validPasswordArb,
});

// Generator for valid signup values
const validSignupValuesArb: fc.Arbitrary<SignupValues> = fc.record({
  name: validNameArb,
  email: validEmailArb,
  password: validPasswordArb,
});

// Non-busy auth states (where auth invocation would be allowed if valid)
const nonBusyStateArb: fc.Arbitrary<AuthFormState> = fc.oneof(
  fc.constant({ kind: "idle", apiError: null } as AuthFormState),
  fc.constant({ kind: "invalid", apiError: null } as AuthFormState),
  fc.constant({ kind: "apiError", apiError: "Some error." } as AuthFormState),
);

// --- Helper predicates ---

function emailIsValid(email: string): boolean {
  return isValidAuthEmail(email.trim());
}

function emailIsNonEmpty(email: string): boolean {
  return email.trim().length > 0;
}

function passwordIsLongEnough(password: string): boolean {
  return password.length >= 8;
}

function passwordIsNonEmpty(password: string): boolean {
  return password.length > 0;
}

function nameHasNonWhitespace(name: string): boolean {
  return name.trim().length > 0;
}

// --- Tests ---

describe("Property 11: Auth validation accepts exactly the valid field domain", () => {
  it("valid login values produce no errors and isValid true", () => {
    fc.assert(
      fc.property(validLoginValuesArb, (values) => {
        const result = validateLogin(values);
        expect(result.isValid).toBe(true);
        expect(result.fieldErrors).toEqual({});
      }),
      { numRuns: 100 },
    );
  });

  it("valid signup values produce no errors and isValid true", () => {
    fc.assert(
      fc.property(validSignupValuesArb, (values) => {
        const result = validateSignup(values);
        expect(result.isValid).toBe(true);
        expect(result.fieldErrors).toEqual({});
      }),
      { numRuns: 100 },
    );
  });

  it("login validation rejects iff email is empty/invalid or password is empty/short", () => {
    fc.assert(
      fc.property(loginValuesArb, (values) => {
        const result = validateLogin(values);

        const emailOk = emailIsNonEmpty(values.email) && emailIsValid(values.email);
        const passwordOk = passwordIsNonEmpty(values.password) && passwordIsLongEnough(values.password);

        const expectedValid = emailOk && passwordOk;
        expect(result.isValid).toBe(expectedValid);
      }),
      { numRuns: 200 },
    );
  });

  it("signup validation rejects iff email invalid, password short, or name empty", () => {
    fc.assert(
      fc.property(signupValuesArb, (values) => {
        const result = validateSignup(values);

        const emailOk = emailIsNonEmpty(values.email) && emailIsValid(values.email);
        const passwordOk = passwordIsNonEmpty(values.password) && passwordIsLongEnough(values.password);
        const nameOk = nameHasNonWhitespace(values.name);

        const expectedValid = emailOk && passwordOk && nameOk;
        expect(result.isValid).toBe(expectedValid);
      }),
      { numRuns: 200 },
    );
  });

  it("login errors report exactly the failed predicates", () => {
    fc.assert(
      fc.property(loginValuesArb, (values) => {
        const result = validateLogin(values);
        const trimmedEmail = values.email.trim();

        // Email error expectations
        if (trimmedEmail.length === 0) {
          expect(result.fieldErrors.email).toBe(AUTH_FIELD_ERRORS.emailRequired);
        } else if (!isValidAuthEmail(trimmedEmail)) {
          expect(result.fieldErrors.email).toBe(AUTH_FIELD_ERRORS.emailInvalid);
        } else {
          expect(result.fieldErrors.email).toBeUndefined();
        }

        // Password error expectations
        if (values.password.length === 0) {
          expect(result.fieldErrors.password).toBe(AUTH_FIELD_ERRORS.passwordRequired);
        } else if (values.password.length < 8) {
          expect(result.fieldErrors.password).toBe(AUTH_FIELD_ERRORS.passwordTooShort);
        } else {
          expect(result.fieldErrors.password).toBeUndefined();
        }
      }),
      { numRuns: 200 },
    );
  });

  it("signup errors report exactly the failed predicates including name", () => {
    fc.assert(
      fc.property(signupValuesArb, (values) => {
        const result = validateSignup(values);
        const trimmedEmail = values.email.trim();
        const trimmedName = values.name.trim();

        // Email error expectations
        if (trimmedEmail.length === 0) {
          expect(result.fieldErrors.email).toBe(AUTH_FIELD_ERRORS.emailRequired);
        } else if (!isValidAuthEmail(trimmedEmail)) {
          expect(result.fieldErrors.email).toBe(AUTH_FIELD_ERRORS.emailInvalid);
        } else {
          expect(result.fieldErrors.email).toBeUndefined();
        }

        // Password error expectations
        if (values.password.length === 0) {
          expect(result.fieldErrors.password).toBe(AUTH_FIELD_ERRORS.passwordRequired);
        } else if (values.password.length < 8) {
          expect(result.fieldErrors.password).toBe(AUTH_FIELD_ERRORS.passwordTooShort);
        } else {
          expect(result.fieldErrors.password).toBeUndefined();
        }

        // Name error expectations
        if (trimmedName.length === 0) {
          expect(result.fieldErrors.name).toBe(AUTH_FIELD_ERRORS.nameRequired);
        } else {
          expect(result.fieldErrors.name).toBeUndefined();
        }
      }),
      { numRuns: 200 },
    );
  });

  it("invalid login forms never invoke authentication", () => {
    fc.assert(
      fc.property(
        loginValuesArb.filter((v) => {
          // Keep only invalid forms
          const r = validateLogin(v);
          return !r.isValid;
        }),
        nonBusyStateArb,
        (values, state) => {
          const result = validateLogin(values);
          expect(canInvokeAuthentication(result, state)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("invalid signup forms never invoke authentication", () => {
    fc.assert(
      fc.property(
        signupValuesArb.filter((v) => {
          const r = validateSignup(v);
          return !r.isValid;
        }),
        nonBusyStateArb,
        (values, state) => {
          const result = validateSignup(values);
          expect(canInvokeAuthentication(result, state)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("valid forms can invoke authentication when not busy", () => {
    fc.assert(
      fc.property(validLoginValuesArb, nonBusyStateArb, (values, state) => {
        const result = validateLogin(values);
        expect(canInvokeAuthentication(result, state)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("valid signup forms can invoke authentication when not busy", () => {
    fc.assert(
      fc.property(validSignupValuesArb, nonBusyStateArb, (values, state) => {
        const result = validateSignup(values);
        expect(canInvokeAuthentication(result, state)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
