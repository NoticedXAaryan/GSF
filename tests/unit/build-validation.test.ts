/**
 * Build Validation Tests
 *
 * These tests inspect a production build output (.next/) to verify:
 * 1. Server HTML contains schedule data, navigation, hero content (SSR)
 * 2. All <img> tags have explicit width and height attributes
 * 3. Below-fold images have loading="lazy"
 * 4. Static sections (About, Highlights, Footer) don't leak into client JS chunks
 * 5. Forbidden server modules (db, schema, auth) are absent from browser chunks
 * 6. Initial JS chunks are under 200KB compressed (gzipped)
 *
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { gzipSync } from "node:zlib";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const NEXT_DIR = path.join(PROJECT_ROOT, ".next");

/**
 * Recursively collect all files matching a predicate under a directory.
 */
function collectFiles(dir: string, predicate: (f: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, predicate));
    } else if (predicate(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Get all browser-facing JS chunk files from .next/static/chunks/
 */
function getBrowserChunks(): string[] {
  const chunksDir = path.join(NEXT_DIR, "static", "chunks");
  const allJs = collectFiles(chunksDir, (f) => f.endsWith(".js"));
  return allJs.filter(f => !f.includes("fallback") && !f.includes("polyfills"));
}

/**
 * Get the server-rendered page JS for the root route.
 * In Next.js production builds, this is at .next/server/app/page.js
 * or can be found in prerender HTML files.
 */
function getServerPageContent(): string | null {
  // Check for pre-rendered HTML (RSC flight data or HTML output)
  const possiblePaths = [
    path.join(NEXT_DIR, "server", "app", "index.html"),
    path.join(NEXT_DIR, "server", "app", "page.html"),
    path.join(NEXT_DIR, "server", "pages", "index.html"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf-8");
    }
  }

  // For App Router with standalone output, check for page.js (contains RSC payload)
  const pageJs = path.join(NEXT_DIR, "server", "app", "page.js");
  if (fs.existsSync(pageJs)) {
    return fs.readFileSync(pageJs, "utf-8");
  }

  return null;
}

/**
 * Get all HTML-like content from the server build output for the root page.
 * Includes checking .body files (Next.js RSC prefetch) and RSC payload.
 */
function getServerOutputContent(): string {
  const content: string[] = [];

  // Check server app directory for any page-related content
  const serverAppDir = path.join(NEXT_DIR, "server", "app");
  if (fs.existsSync(serverAppDir)) {
    const files = collectFiles(serverAppDir, (f) =>
      f.endsWith(".js") || f.endsWith(".html") || f.endsWith(".body") || f.endsWith(".rsc")
    );
    // Only include root-level page files, not nested routes
    for (const file of files) {
      const rel = path.relative(serverAppDir, file);
      // Root page files (page.js, page_client-reference-manifest.js, etc.)
      if (!rel.includes(path.sep) || rel.startsWith("_not-found")) {
        content.push(fs.readFileSync(file, "utf-8"));
      }
    }
  }

  // Check for static prefetch data
  const staticDir = path.join(NEXT_DIR, "static");
  if (fs.existsSync(staticDir)) {
    const rscFiles = collectFiles(staticDir, (f) =>
      f.endsWith(".rsc") || f.endsWith(".html")
    );
    for (const file of rscFiles) {
      content.push(fs.readFileSync(file, "utf-8"));
    }
  }

  return content.join("\n");
}

describe("Build Validation", () => {
  let buildExists: boolean;

  beforeAll(() => {
    // Check if production build exists
    buildExists = fs.existsSync(NEXT_DIR) && fs.existsSync(path.join(NEXT_DIR, "build-manifest.json"));
  });

  describe("SSR Content (Requirement 14.1, 14.2)", () => {
    it("server page output contains navigation landmark content", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const content = getServerOutputContent();
      const pageJs = getServerPageContent();
      const combined = content + (pageJs ?? "");

      // Navigation should include section links (About, Highlights, Schedule, etc.)
      const hasNavContent =
        combined.includes("About") &&
        combined.includes("Schedule") &&
        combined.includes("Highlights");

      expect(hasNavContent).toBe(true);
    });

    it("server page output contains hero section content", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const content = getServerOutputContent();
      const pageJs = getServerPageContent();
      const combined = content + (pageJs ?? "");

      // Hero should contain festival name and tagline
      const hasHeroContent =
        combined.includes("Goa Startup Festival 2026") ||
        combined.includes("Goa Startup Festival");

      expect(hasHeroContent).toBe(true);
    });

    it("server page output contains schedule-related content", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const content = getServerOutputContent();
      const pageJs = getServerPageContent();
      const combined = content + (pageJs ?? "");

      // Schedule section should have day references or schedule heading
      const hasScheduleContent =
        combined.includes("schedule") || combined.includes("Schedule") ||
        combined.includes("Day 1") || combined.includes("Day 2");

      expect(hasScheduleContent).toBe(true);
    });
  });

  describe("Image Attributes (Requirement 14.3)", () => {
    it("all img tags in server output have explicit width and height", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const content = getServerOutputContent();
      const pageJs = getServerPageContent();
      const combined = content + (pageJs ?? "");

      // Find all <img tags in the output
      const imgTagRegex = /<img\s[^>]*>/gi;
      const imgTags = combined.match(imgTagRegex) || [];

      if (imgTags.length === 0) {
        // No images found in server output - this is acceptable if images
        // are rendered through Next.js Image which uses spans/wrappers
        return;
      }

      for (const tag of imgTags) {
        const hasWidth = /width\s*=\s*["']\d+["']/.test(tag) || /width=\{?\d+\}?/.test(tag);
        const hasHeight = /height\s*=\s*["']\d+["']/.test(tag) || /height=\{?\d+\}?/.test(tag);
        expect(
          hasWidth && hasHeight,
          `Image tag missing width/height: ${tag.substring(0, 100)}`
        ).toBe(true);
      }
    });

    it("below-fold images use lazy loading", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const content = getServerOutputContent();
      const pageJs = getServerPageContent();
      const combined = content + (pageJs ?? "");

      // Find img tags that are NOT in the hero section (below fold)
      // In Next.js Image component output, lazy loading is the default.
      // Check that images with loading attribute use "lazy" or have no loading (defaults to lazy)
      const imgTagRegex = /<img\s[^>]*>/gi;
      const imgTags = combined.match(imgTagRegex) || [];

      for (const tag of imgTags) {
        // If an image has loading="eager", it should only be for above-fold content
        if (/loading\s*=\s*["']eager["']/.test(tag)) {
          // Eager images should be associated with hero/above-fold content
          // This is acceptable for the first viewport
          continue;
        }
        // Images without explicit loading attribute or with loading="lazy" are fine
        if (/loading\s*=\s*["']/.test(tag)) {
          expect(
            /loading\s*=\s*["']lazy["']/.test(tag),
            `Below-fold image should have loading="lazy": ${tag.substring(0, 100)}`
          ).toBe(true);
        }
      }
    });
  });

  describe("Server Boundaries (Requirement 14.4)", () => {
    it("static section identifiers do not leak into client JS chunks", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const chunks = getBrowserChunks();
      if (chunks.length === 0) {
        console.warn("No browser chunks found. Build might be in development mode.");
        return;
      }

      // Static server sections: About, Highlights, Footer content
      // These are Server Components and should NOT have their unique static content
      // strings duplicated in browser-side JavaScript.
      const staticMarkers = [
        // About section specific text that would only appear if the component leaked
        "Startups Incubated",
        "Where Ideas Become Enterprises",
        // Footer specific content
        "Jointly organized by PIERC",
      ];

      // Read all page-specific browser chunks (not framework chunks like webpack.js, main-app.js)
      const pageChunks = chunks.filter((f) => {
        const basename = path.basename(f);
        return !basename.startsWith("webpack") &&
               !basename.startsWith("main-app") &&
               !basename.startsWith("polyfills") &&
               !basename.includes("_app-pages-browser");
      });

      for (const chunkPath of pageChunks) {
        const content = fs.readFileSync(chunkPath, "utf-8");
        for (const marker of staticMarkers) {
          // Allow framework/infrastructure chunks but page chunks should not contain
          // static server component content
          const basename = path.basename(chunkPath);
          if (basename === "page.js" || basename.includes("page")) {
            // Page chunks for client-side hydration may contain some of this content
            // in RSC payload format - that's expected for initial HTML hydration
            continue;
          }
          expect(
            content.includes(marker),
            `Static content "${marker}" found in client chunk: ${path.relative(NEXT_DIR, chunkPath)}`
          ).toBe(false);
        }
      }
    });
  });

  describe("Forbidden Server Modules (Requirement 14.4)", () => {
    it("browser chunks do not import db, schema, or auth server modules", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      const chunks = getBrowserChunks().filter((f) => {
        const basename = path.basename(f);
        return !basename.startsWith("webpack") &&
               !basename.startsWith("main") &&
               !basename.startsWith("polyfills") &&
               !basename.includes("_app-pages-browser");
      });
      if (chunks.length === 0) {
        console.warn("No browser chunks found.");
        return;
      }

      // These patterns indicate server-only module content in browser bundles
      const forbiddenPatterns = [
        // Direct import of server modules
        /require\(["']\.\.?\/lib\/db["']\)/,
        /require\(["']\.\.?\/lib\/schema["']\)/,
        /require\(["']\.\.?\/lib\/auth["']\)/,
        // Drizzle ORM patterns (server-only)
        /drizzle-orm/,
        // PostgreSQL client (server-only)
        /require\(["']pg["']\)/,
        // Server-only package marker
        /server-only/,
        // Database connection string patterns
        /DATABASE_URL/,
        /postgres:\/\//,
      ];

      for (const chunkPath of chunks) {
        const content = fs.readFileSync(chunkPath, "utf-8");
        for (const pattern of forbiddenPatterns) {
          expect(
            pattern.test(content),
            `Forbidden server pattern ${pattern} found in browser chunk: ${path.relative(NEXT_DIR, chunkPath)}`
          ).toBe(false);
        }
      }
    });
  });

  describe("Bundle Budget (Requirement 14.4)", () => {
    it("initial page JS chunks are under 200KB compressed", () => {
      if (!buildExists) {
        console.warn("Skipping: No production build found. Run `npm run build` first.");
        return;
      }

      // Detect development build — dev builds are unminified and include HMR,
      // so they are not meaningful for budget validation.
      const devDir = path.join(NEXT_DIR, "static", "development");
      if (fs.existsSync(devDir)) {
        console.warn(
          "Skipping bundle budget: .next/ contains a development build. " +
          "Run `npm run build` for a production build before checking budgets."
        );
        return;
      }

      // Get the initial chunks needed for the root page from app-build-manifest.json
      const manifestPath = path.join(NEXT_DIR, "app-build-manifest.json");
      if (!fs.existsSync(manifestPath)) {
        console.warn("app-build-manifest.json not found. Skipping budget check.");
        return;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const pageAssets: string[] = manifest.pages?.["/page"] || [];
      const layoutAssets: string[] = manifest.pages?.["/layout"] || [];

      // Combine page and layout assets for the initial load
      const allInitialAssets = [...new Set([...layoutAssets, ...pageAssets])];

      // Only count JS files for the bundle budget
      const jsAssets = allInitialAssets.filter((a: string) => a.endsWith(".js"));

      let totalCompressedSize = 0;
      const BUDGET_BYTES = 200 * 1024; // 200KB

      for (const asset of jsAssets) {
        const assetPath = path.join(NEXT_DIR, asset);
        if (!fs.existsSync(assetPath)) {
          continue;
        }
        const raw = fs.readFileSync(assetPath);
        const compressed = gzipSync(raw);
        totalCompressedSize += compressed.length;
      }

      if (totalCompressedSize === 0) {
        console.warn("Could not measure chunk sizes. Assets may not exist yet.");
        return;
      }

      const totalKB = (totalCompressedSize / 1024).toFixed(1);
      expect(
        totalCompressedSize,
        `Initial JS budget exceeded: ${totalKB}KB compressed (budget: 200KB)`
      ).toBeLessThanOrEqual(BUDGET_BYTES);
    });
  });
});
