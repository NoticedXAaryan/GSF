import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

describe("component accessibility environment", () => {
  it("runs automated accessibility checks", async () => {
    const { container } = render(
      <main>
        <h1>Goa Startup Festival 2026</h1>
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});