/* eslint-disable react/display-name */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect, vi } from "vitest";

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

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

vi.mock("motion/react", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) =>
          React.forwardRef(
            ({ children, className, ...rest }: Record<string, unknown>, ref: React.Ref<HTMLElement>) =>
              React.createElement(tag as string, { ref, className, ...rest }, children as React.ReactNode)
          )
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useMotionValue: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    useSpring: () => ({ get: () => 0, set: () => {}, onChange: () => () => {} }),
    useScroll: vi.fn(() => ({ scrollYProgress: { onChange: vi.fn() } })),
    useMotionTemplate: vi.fn((strings, ...values) => {
      return strings.reduce((acc: string, str: string, i: number) => acc + str + (values[i] ?? ""), "");
    }),
    useMotionValueEvent: () => {},
    useTransform: () => ({ get: () => 0, set: () => {}, onChange: () => () => {} }),
    MotionConfig: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});

afterEach(() => cleanup());
