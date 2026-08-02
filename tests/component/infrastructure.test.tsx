import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("component test environment", () => {
  it("renders React components with Testing Library matchers", () => {
    render(<button type="button">Register</button>);

    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("does not expose server environment variables", () => {
    expect(process.env.TEST_SERVER_SECRET).toBeUndefined();
  });
});