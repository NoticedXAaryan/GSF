import { describe, it, expect } from "vitest";
import { normalizeAuthError } from "@/components/auth/normalize-auth-error";

describe("normalizeAuthError", () => {
  it("returns generic message for unknown error objects", () => {
    expect(normalizeAuthError(new Error("internal server error"))).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("returns network message for TypeError with fetch keywords", () => {
    expect(normalizeAuthError(new TypeError("Failed to fetch"))).toBe(
      "Unable to connect. Please check your internet and try again.",
    );
  });

  it("returns network message for TypeError with network keyword", () => {
    expect(normalizeAuthError(new TypeError("NetworkError when attempting to fetch resource"))).toBe(
      "Unable to connect. Please check your internet and try again.",
    );
  });

  it("preserves safe known messages from API error objects", () => {
    const error = { message: "Invalid email or password." };
    expect(normalizeAuthError(error)).toBe("Invalid email or password.");
  });

  it("preserves safe known string messages", () => {
    expect(normalizeAuthError("User already exists.")).toBe("User already exists.");
  });

  it("normalizes messages containing 'invalid' and 'password'", () => {
    const error = { message: "The provided invalid password or email" };
    expect(normalizeAuthError(error)).toBe("Invalid email or password.");
  });

  it("normalizes messages containing 'already exists'", () => {
    const error = { message: "A user with that email already exists in the system" };
    expect(normalizeAuthError(error)).toBe("Email already in use.");
  });

  it("normalizes rate limit messages", () => {
    const error = { message: "Too many login attempts, rate limit exceeded" };
    expect(normalizeAuthError(error)).toBe("Too many requests. Please try again later.");
  });

  it("returns generic message for null", () => {
    expect(normalizeAuthError(null)).toBe("Something went wrong. Please try again.");
  });

  it("returns generic message for undefined", () => {
    expect(normalizeAuthError(undefined)).toBe("Something went wrong. Please try again.");
  });

  it("returns generic message for empty string", () => {
    expect(normalizeAuthError("")).toBe("Something went wrong. Please try again.");
  });

  it("returns generic message for unknown objects without message field", () => {
    expect(normalizeAuthError({ code: 500 })).toBe("Something went wrong. Please try again.");
  });

  it("never exposes raw technical error messages", () => {
    const techErrors = [
      { message: "ECONNREFUSED 127.0.0.1:5432" },
      { message: "relation 'users' does not exist" },
      { message: "JWT expired at 2024-01-01" },
      { message: "TypeError: Cannot read properties of null" },
    ];
    for (const err of techErrors) {
      const result = normalizeAuthError(err);
      expect(result).toBe("Something went wrong. Please try again.");
      expect(result).not.toContain("ECONNREFUSED");
      expect(result).not.toContain("relation");
      expect(result).not.toContain("JWT");
      expect(result).not.toContain("TypeError");
    }
  });
});
