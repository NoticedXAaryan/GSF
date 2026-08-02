import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

const runnerEnvironmentKeys = new Set([
  "CI",
  "NODE_ENV",
  "TZ",
  "VITEST",
  "VITEST_POOL_ID",
  "VITEST_WORKER_ID",
]);

for (const key of Object.keys(process.env)) {
  const isPublic = key.startsWith("NEXT_PUBLIC_");
  const isRunnerOwned = runnerEnvironmentKeys.has(key);

  if (!isPublic && !isRunnerOwned) {
    delete process.env[key];
  }
}

expect.extend(toHaveNoViolations);
afterEach(() => cleanup());