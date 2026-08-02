import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("runs browser and accessibility checks", async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>Goa Startup Festival 2026</h1>
      <a href="/signup">Register</a>
    </main>
  `);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});