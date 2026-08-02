import { describe, expect, it } from "vitest";

describe("unit test environment", () => {
  it("runs without browser globals", () => {
    expect(typeof document).toBe("undefined");
    expect(typeof window).toBe("undefined");
  });
});