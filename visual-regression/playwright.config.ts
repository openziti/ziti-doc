import { defineConfig } from "@playwright/test";

// Where the built site is served during the test run. run.sh starts a static server
// on this port; override with VRT_BASE_URL when pointing at an already-running site.
const BASE_URL = process.env.VRT_BASE_URL ?? "http://127.0.0.1:4173";

// Theme is not a built-in Playwright "use" option, so we carry it in project metadata
// and apply it (localStorage + color scheme) in the test's beforeEach hook.
type ThemeMeta = { theme: "light" | "dark" };

export default defineConfig({
  testDir: "./tests",
  // Baselines live next to the harness, organized by project (viewport+theme) and page.
  // The {platform} token keeps OS-specific baselines from clobbering each other. The
  // committed, canonical baselines are the linux ones produced via `run.sh --docker`.
  snapshotPathTemplate: "snapshots/{projectName}/{arg}-{platform}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  // A visual diff of a few percent is almost always real; anything below is sub-pixel
  // anti-aliasing noise. Tune per-assertion in the spec if a page proves flaky.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      scale: "css",
      // Some pages (Scalar API explorer, Mermaid) render via JS after load and take a
      // few seconds to reach a stable frame; allow time for two identical frames.
      timeout: 20000,
    },
  },
  use: {
    baseURL: BASE_URL,
    // Pin a device scale factor so screenshots are identical regardless of host DPI.
    deviceScaleFactor: 1,
    // Freeze any time-based UI to a fixed instant.
    timezoneId: "UTC",
    locale: "en-US",
  },
  projects: [
    {
      name: "desktop-light",
      use: { viewport: { width: 1280, height: 800 }, colorScheme: "light" },
      metadata: { theme: "light" } satisfies ThemeMeta,
    },
    {
      name: "desktop-dark",
      use: { viewport: { width: 1280, height: 800 }, colorScheme: "dark" },
      metadata: { theme: "dark" } satisfies ThemeMeta,
    },
    {
      name: "mobile-light",
      use: { viewport: { width: 390, height: 844 }, colorScheme: "light" },
      metadata: { theme: "light" } satisfies ThemeMeta,
    },
    {
      name: "mobile-dark",
      use: { viewport: { width: 390, height: 844 }, colorScheme: "dark" },
      metadata: { theme: "dark" } satisfies ThemeMeta,
    },
  ],
});
