// Feature: ui-rebuild, Property 3: Role routing is canonical at every entry point
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  type DashboardPath,
  type UserRole,
  resolveDashboardPath,
  viewerFromSession,
} from "@/lib/landing/auth-routing";

/**
 * Validates: Requirements 2.6, 3.6, 11.6
 *
 * Property 3: Role routing is canonical at every entry point
 * For all supported roles and all missing or unknown role strings, every
 * authenticated routing entry point resolves Admin and Lead to /dashboard/admin,
 * Volunteer and Faculty to /dashboard/volunteer, and all remaining roles to /dashboard/user.
 */

const SUPPORTED_ROLES: UserRole[] = [
  "Admin",
  "Lead",
  "Volunteer",
  "Faculty",
  "Attendee",
];

const CANONICAL_MAP: Record<UserRole, DashboardPath> = {
  Admin: "/dashboard/admin",
  Lead: "/dashboard/admin",
  Volunteer: "/dashboard/volunteer",
  Faculty: "/dashboard/volunteer",
  Attendee: "/dashboard/user",
};

// Generator: one of the five supported role strings
const supportedRoleArb = fc.constantFrom(...SUPPORTED_ROLES);

// Generator: missing role values (null or undefined)
const missingRoleArb = fc.constantFrom(null, undefined);

// Generator: case-invalid variants of supported roles (e.g. "admin", "ADMIN", "aDmIn")
const caseInvalidRoleArb = supportedRoleArb.chain((role) =>
  fc.constantFrom(
    role.toLowerCase(),
    role.toUpperCase(),
    role.charAt(0).toLowerCase() + role.slice(1),
    role.charAt(0) + role.slice(1).toUpperCase(),
  ).filter((variant) => !SUPPORTED_ROLES.includes(variant as UserRole)),
);

// Generator: arbitrary unknown strings that are NOT any supported role
const unknownRoleArb = fc
  .string({ minLength: 0, maxLength: 50 })
  .filter((s) => !SUPPORTED_ROLES.includes(s as UserRole));

describe("Property 3: Role routing is canonical at every entry point", () => {
  it("supported roles resolve to their canonical dashboard path via resolveDashboardPath", () => {
    fc.assert(
      fc.property(supportedRoleArb, (role) => {
        expect(resolveDashboardPath(role)).toBe(CANONICAL_MAP[role]);
      }),
      { numRuns: 100 },
    );
  });

  it("missing roles (null/undefined) resolve to /dashboard/user via resolveDashboardPath", () => {
    fc.assert(
      fc.property(missingRoleArb, (role) => {
        expect(resolveDashboardPath(role)).toBe("/dashboard/user");
      }),
      { numRuns: 100 },
    );
  });

  it("case-invalid role strings resolve to /dashboard/user via resolveDashboardPath", () => {
    fc.assert(
      fc.property(caseInvalidRoleArb, (role) => {
        expect(resolveDashboardPath(role)).toBe("/dashboard/user");
      }),
      { numRuns: 100 },
    );
  });

  it("unknown arbitrary strings resolve to /dashboard/user via resolveDashboardPath", () => {
    fc.assert(
      fc.property(unknownRoleArb, (role) => {
        expect(resolveDashboardPath(role)).toBe("/dashboard/user");
      }),
      { numRuns: 100 },
    );
  });

  it("viewerFromSession resolves supported roles to the same canonical path", () => {
    fc.assert(
      fc.property(supportedRoleArb, (role) => {
        const viewer = viewerFromSession({ user: { role } });
        expect(viewer.authenticated).toBe(true);
        expect(viewer.dashboardPath).toBe(CANONICAL_MAP[role]);
      }),
      { numRuns: 100 },
    );
  });

  it("viewerFromSession resolves missing sessions to anonymous with no dashboard path", () => {
    fc.assert(
      fc.property(missingRoleArb, (session) => {
        const viewer = viewerFromSession(session);
        expect(viewer.authenticated).toBe(false);
        expect(viewer.dashboardPath).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it("viewerFromSession resolves unknown role strings to /dashboard/user", () => {
    fc.assert(
      fc.property(unknownRoleArb, (role) => {
        const viewer = viewerFromSession({ user: { role } });
        expect(viewer.authenticated).toBe(true);
        expect(viewer.dashboardPath).toBe("/dashboard/user");
      }),
      { numRuns: 100 },
    );
  });

  it("viewerFromSession resolves case-invalid role strings to /dashboard/user", () => {
    fc.assert(
      fc.property(caseInvalidRoleArb, (role) => {
        const viewer = viewerFromSession({ user: { role } });
        expect(viewer.authenticated).toBe(true);
        expect(viewer.dashboardPath).toBe("/dashboard/user");
      }),
      { numRuns: 100 },
    );
  });
});
