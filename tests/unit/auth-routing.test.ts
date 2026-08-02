import { describe, expect, it } from "vitest";

import {
  normalizeUserRole,
  resolveDashboardPath,
  viewerFromSession,
} from "@/lib/landing/auth-routing";

describe("canonical dashboard routing", () => {
  it.each([
    ["Admin", "/dashboard/admin"],
    ["Lead", "/dashboard/admin"],
    ["Volunteer", "/dashboard/volunteer"],
    ["Faculty", "/dashboard/volunteer"],
    ["Attendee", "/dashboard/user"],
    [undefined, "/dashboard/user"],
    [null, "/dashboard/user"],
    ["admin", "/dashboard/user"],
    ["Unknown", "/dashboard/user"],
  ] as const)("routes %s to %s", (role, path) => {
    expect(resolveDashboardPath(role)).toBe(path);
  });

  it("normalizes unsupported session roles to Attendee", () => {
    expect(normalizeUserRole("Faculty")).toBe("Faculty");
    expect(normalizeUserRole("faculty")).toBe("Attendee");
    expect(normalizeUserRole(null)).toBe("Attendee");
  });
});

describe("viewerFromSession", () => {
  it("creates the anonymous viewer when no session user exists", () => {
    expect(viewerFromSession(null)).toEqual({
      authenticated: false,
      role: null,
      dashboardPath: null,
    });
  });

  it("returns only canonical serializable viewer fields", () => {
    const session = {
      user: { role: "Faculty", id: "private-id", email: "person@example.com" },
      session: { token: "private-token" },
    };

    const viewer = viewerFromSession(session);
    expect(viewer).toEqual({
      authenticated: true,
      role: "Faculty",
      dashboardPath: "/dashboard/volunteer",
    });
    expect(JSON.parse(JSON.stringify(viewer))).toEqual(viewer);
  });

  it("fails closed to the attendee viewer for missing or unknown roles", () => {
    expect(viewerFromSession({ user: {} })).toEqual({
      authenticated: true,
      role: "Attendee",
      dashboardPath: "/dashboard/user",
    });
    expect(viewerFromSession({ user: { role: "SuperAdmin" } }).dashboardPath).toBe(
      "/dashboard/user",
    );
  });
});
