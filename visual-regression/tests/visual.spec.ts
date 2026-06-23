import { test, expect, type Page } from "@playwright/test";
import { PAGES } from "../pages";

// CSS injected before every page renders. Kills animation/transition timing and other
// sources of frame-to-frame jitter so a full-page screenshot is deterministic.
const STABILIZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
    caret-color: transparent !important;
  }
  html { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; }
`;

// Selectors for regions whose content is inherently volatile (live counts, third-party
// embeds, charts) or otherwise not part of the "design/look/feel" we care about. These
// are masked (painted over with a solid box) instead of compared.
const MASK_SELECTORS = [
  "iframe", // react-github-btn star buttons, YouTube embeds, etc.
  "video",
  ".asciinema-player",
  "canvas", // echarts renders to canvas
  "[data-vrt-mask]", // escape hatch: add this attribute to anything else that flaps
];

async function autoScroll(page: Page): Promise<void> {
  // Walk the page top-to-bottom to trigger lazy-loaded images/components, then return
  // to the top so the full-page capture starts from a clean origin.
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const step = window.innerHeight;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        y += step;
        if (y >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const pageDef of PAGES) {
  test(pageDef.id, async ({ page }, testInfo) => {
    const theme = (testInfo.project.metadata as { theme: "light" | "dark" }).theme;

    // The navbar brand logos load from an external host that returns 403 to
    // non-interactive clients, so they render as broken-image glyphs in headless/CI.
    // Fulfill those requests with a blank fixed-size SVG so the <img> loads cleanly and
    // the navbar layout stays put. Registered before goto so it catches the requests.
    await page.route(/netfoundry\.io\/.*\.svg/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"></svg>',
      }),
    );

    // Apply theme + stabilization BEFORE any site script runs, so Docusaurus reads the
    // chosen color mode on first paint and ThemedImage picks the right asset.
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t);
      } catch {
        /* localStorage may be unavailable; color-scheme still applies */
      }
    }, theme);
    await page.addStyleTag({ content: STABILIZE_CSS }).catch(() => {});

    // domcontentloaded, not networkidle: some pages (analytics, embeds, long-poll) never
    // reach network idle and would hang. Stability is ensured later by the image wait, the
    // settle, and toHaveScreenshot's own retry-until-two-identical-frames loop.
    await page.goto(pageDef.path, { waitUntil: "domcontentloaded" });

    // Re-inject the stabilizer after navigation (addStyleTag above is pre-nav best-effort).
    await page.addStyleTag({ content: STABILIZE_CSS });

    // Wait for web fonts so text metrics are stable.
    await page.evaluate(() => document.fonts.ready);

    await autoScroll(page);
    // Best-effort idle wait; proceed even if the page never goes fully idle.
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    // Wait for every <img> to finish loading AND decoding. Navbar logos can complete
    // just after networkidle, so without this they capture as broken-image glyphs.
    // Each image is capped so one that never fires load/error can't hang the run.
    await page.evaluate(async () => {
      const cap = <T>(p: Promise<T>, ms: number) =>
        Promise.race([p, new Promise<void>((res) => setTimeout(res, ms))]);
      await Promise.all(
        Array.from(document.images).map((img) => {
          const done = img.complete
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.addEventListener("load", () => res());
                img.addEventListener("error", () => res());
              });
          return cap(
            done.then(() => img.decode().catch(() => {})),
            5000,
          );
        }),
      );
    });

    // Some pages render content via JS after networkidle (e.g. the Scalar API explorer
    // fetches and renders its spec). Give them a moment to reach a steady frame.
    await page.waitForTimeout(1000);

    const masks = MASK_SELECTORS.map((s) => page.locator(s));

    await expect(page).toHaveScreenshot(`${pageDef.id}.png`, {
      fullPage: pageDef.fullPage ?? true,
      mask: masks,
      maxDiffPixelRatio: 0.01,
    });
  });
}
