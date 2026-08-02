import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./", import.meta.url)) };
const clientSetup = ["./tests/setup/client.ts"];

export default defineConfig({
  oxc: false,
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  resolve: { alias },
  test: {
    passWithNoTests: true,
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.{ts,tsx}", "**/*.unit.test.{ts,tsx}"],
        },
      },
      {
        oxc: false,
        esbuild: { jsx: "automatic", jsxImportSource: "react" },
        resolve: { alias },
        test: {
          name: "component",
          environment: "jsdom",
          environmentOptions: { jsdom: { url: "http://localhost/" } },
          setupFiles: clientSetup,
          include: ["tests/component/**/*.test.{ts,tsx}", "**/*.component.test.{ts,tsx}"],
        },
      },
      {
        oxc: false,
        esbuild: { jsx: "automatic", jsxImportSource: "react" },
        resolve: { alias },
        test: {
          name: "accessibility",
          environment: "jsdom",
          environmentOptions: { jsdom: { url: "http://localhost/" } },
          setupFiles: clientSetup,
          include: ["tests/accessibility/**/*.test.{ts,tsx}", "**/*.a11y.test.{ts,tsx}"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "property",
          environment: "node",
          include: ["tests/property/**/*.test.{ts,tsx}", "**/*.property.test.{ts,tsx}"],
        },
      },
      {
        oxc: false,
        esbuild: { jsx: "automatic", jsxImportSource: "react" },
        resolve: { alias },
        test: {
          name: "ssr",
          environment: "node",
          include: ["tests/ssr/**/*.test.{ts,tsx}", "**/*.ssr.test.{ts,tsx}"],
        },
      },
    ],
  },
});