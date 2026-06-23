// The curated set of pages to spot-check. The goal is representative coverage of the
// site's overall design and layout, NOT exhaustive crawling of every route.
//
// Add a page here only when it exercises a layout or component family the existing
// entries do not already cover. Keep the list short on purpose: every page multiplies
// across all viewport/theme projects (see playwright.config.ts).

export interface VrtPage {
  // Stable, filesystem-safe id used as the screenshot base name.
  id: string;
  // Route path relative to the served site root (baseURL). Must start with "/".
  path: string;
  // Optional human note for why this page is in the set.
  why?: string;
  // Capture the whole scrollable page (default) or just the viewport. Set false for pages
  // whose total height is non-deterministic (e.g. the Scalar API explorer renders a
  // different amount of content per run), where a fullPage capture can never match.
  fullPage?: boolean;
}

export const PAGES: VrtPage[] = [
  {
    id: "landing",
    path: "/",
    why: "Custom marketing/landing layout. Highest-value design check.",
  },
  {
    id: "docs-get-started",
    path: "/docs/openziti/get-started/",
    why: "Standard doc layout: navbar, left sidebar, content column, right TOC.",
  },
  {
    id: "quickstart-local-no-docker",
    path: "/docs/openziti/get-started/network/local-no-docker",
    why: "Content-heavy quickstart: code blocks, admonitions, rich MDX components.",
  },
  {
    id: "api-management-reference",
    path: "/docs/openziti/reference/developer/api/edge-management-api-reference",
    why: "Scalar OpenAPI explorer: a full-page component unlike any other page.",
    // Scalar's rendered height varies per run; capture the viewport only.
    fullPage: false,
  },
  {
    id: "mermaid-sequence-diagram",
    path: "/docs/openziti/learn/core-concepts/metrics/sequence-diagram",
    why: "Mermaid diagram rendering, not exercised elsewhere.",
  },
  {
    id: "blog-index",
    path: "/docs/openziti/blog",
    why: "Blog list layout (cards, pagination, sidebar) differs from docs.",
  },
  {
    id: "blog-post",
    path: "/docs/openziti/blog/zitifying-ssh",
    why: "Single blog post layout: author, date, reading time, post body.",
  },
  {
    id: "downloads",
    path: "/docs/openziti/downloads",
    why: "Card/table-heavy page.",
  },
  {
    id: "not-found",
    path: "/__vrt_404_probe__",
    why: "404 page: catches broken global styling/layout.",
  },
  {
    id: "doc-intro",
    path: "/docs/openziti/intro",
    why: "Top-level introduction doc; simple prose layout.",
  },
  {
    id: "guide-controller-deploy",
    path: "/docs/openziti/how-to-guides/deployments/linux/controller/deploy",
    why: "Production deployment guide: Tabs (Debian/RedHat), shell blocks, steps.",
  },
  {
    id: "cli-login-reference",
    path: "/docs/openziti/reference/command-line/login",
    why: "CLI reference layout: command/flag tables.",
  },
];
