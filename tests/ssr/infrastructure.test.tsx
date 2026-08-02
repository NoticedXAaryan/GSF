import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("SSR test environment", () => {
  it("renders React without browser globals", () => {
    const html = renderToStaticMarkup(<h1>Goa Startup Festival 2026</h1>);

    expect(html).toContain("Goa Startup Festival 2026");
    expect(typeof document).toBe("undefined");
  });
});