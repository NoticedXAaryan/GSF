import fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("property test environment", () => {
  it("loads fast-check in the isolated Node project", () => {
    expect(fc.sample(fc.integer(), 3)).toHaveLength(3);
  });
});