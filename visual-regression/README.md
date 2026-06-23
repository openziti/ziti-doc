# Visual regression spot-check

A lightweight [Playwright](https://playwright.dev) screenshot-comparison harness for the openziti.io Docusaurus site.
It is deliberately a **spot-check**: it captures a small, curated set of representative pages and compares them against
baseline images to catch unintended changes to the overall design, layout, and look/feel. It does not crawl every route
or test every link.

## What it checks

Twelve pages (see [`pages.ts`](./pages.ts)), each chosen to exercise a distinct layout or component family:

| Page | Why it is in the set |
| --- | --- |
| `/` | Custom marketing/landing layout. Highest-value design check. |
| `/docs/openziti/get-started/` | Standard doc layout: navbar, left sidebar, content column, right TOC. |
| `/docs/openziti/get-started/network/local-no-docker` | Content-heavy quickstart: code blocks, admonitions, rich MDX. |
| `/docs/openziti/reference/developer/api/edge-management-api-reference` | Scalar OpenAPI explorer: full-page component. |
| `/docs/openziti/learn/core-concepts/metrics/sequence-diagram` | Mermaid diagram rendering. |
| `/docs/openziti/blog` | Blog list layout. |
| `/docs/openziti/blog/zitifying-ssh` | Single blog post layout. |
| `/docs/openziti/downloads` | Card/table-heavy page. |
| `/__vrt_404_probe__` | 404 page (any unknown path). |
| `/docs/openziti/intro` | Top-level intro doc; simple prose. |
| `/docs/openziti/how-to-guides/deployments/linux/controller/deploy` | Production guide: Tabs, shell blocks, steps. |
| `/docs/openziti/reference/command-line/login` | CLI reference: command/flag tables. |

Variations (Playwright "projects"): **desktop light**, **desktop dark**, **mobile light**, **mobile dark**. That is
12 pages x 4 variations = 48 full-page screenshots per run.

To add a page, append an entry to `pages.ts`. Keep the list short: every page multiplies across all four variations.

## Baselines live on a GitHub release, not in the repo

The baseline images are **never committed**. They are tarred and attached as `baselines.tgz` to a dedicated GitHub
release (rolling tag `vrt-baselines`, marked prerelease). The repo tree stays free of binary screenshots.

- **Verify** pulls the tarball, builds the current site, and compares: `--pull-baselines`.
- **Publish** regenerates the screenshots and uploads the tarball: `--update --publish-baselines`.

Both use the [`gh`](https://cli.github.com/) CLI, so locally they use your `gh` auth and in CI they use
`GH_TOKEN`/`GITHUB_TOKEN`. `snapshots/` and `baselines.tgz` are git-ignored.

## Baseline parity (important)

Playwright screenshots are **OS-specific** (fonts and anti-aliasing differ across Linux/Windows/macOS). The published
baselines are the **Linux** ones, produced inside the pinned Playwright container. So both publishing and verifying use
`--docker`, which runs the build/serve/capture pipeline in that container and guarantees the comparison happens on the
same platform as CI.

A native run (without `--docker`) on Windows/macOS still works for quick eyeballing, but it writes throwaway
OS-suffixed snapshots that are git-ignored and never published.

## Requirements

- [Docker](https://www.docker.com/) (for the canonical Linux pipeline).
- [`gh`](https://cli.github.com/), authenticated (`gh auth status`), for pulling/publishing baselines.
- A working `yarn` toolchain in `../docusaurus` (the runner builds the site), unless you use `--skip-build` or
  `--base-url`.

## Usage

Everything goes through [`run.sh`](./run.sh).

```bash
# Verify the current site against the published baselines (the common case)
./visual-regression/run.sh --docker --gendoc --pull-baselines

# Regenerate baselines and publish them (after an intentional design change)
./visual-regression/run.sh --docker --gendoc --update --publish-baselines

# Regenerate locally WITHOUT publishing, to inspect the images first
./visual-regression/run.sh --docker --gendoc --update
#   ... images land in visual-regression/snapshots/ ; publish later with:
./visual-regression/run.sh --publish-baselines

# Verify an already-running site (skips build + serve; native, for a quick look)
./visual-regression/run.sh --base-url https://openziti.io --pull-baselines

# Useful extras
./visual-regression/run.sh ... --skip-build            # reuse an existing docusaurus/build
./visual-regression/run.sh ... --port 5000             # change the static-server port
./visual-regression/run.sh ... --baselines-tag my-tag  # use a different release tag
./visual-regression/run.sh ... --repo owner/repo       # target a specific repo for gh
```

On Windows, run from **WSL**: Docker bind-mount paths (`/d/...`) and `gh` behave correctly there, whereas Git Bash can
mangle the mount path.

## How flakiness is controlled

The spec (`tests/visual.spec.ts`) stabilizes each page before capture:

- Disables CSS animations/transitions and hides scrollbars and text carets.
- Sets the Docusaurus theme via `localStorage` before first paint, and matches the browser color scheme, so
  `ThemedImage` assets resolve correctly.
- Waits for web fonts (`document.fonts.ready`) and network idle.
- Scrolls the full page to trigger lazy-loaded content, then returns to the top.
- **Masks** volatile regions instead of comparing them: `iframe` (GitHub star buttons, YouTube), `video`,
  `.asciinema-player`, and `canvas` (ECharts). Add `data-vrt-mask` to any other element that proves unstable.

The pass/fail threshold is `maxDiffPixelRatio: 0.01` (1% of pixels). Tune it in `playwright.config.ts` (global) or
per-assertion in the spec.

## Reviewing failures

On a mismatch, Playwright writes the expected/actual/diff images and an HTML report:

```bash
npx playwright show-report      # run from this directory
```

In CI the report and diffs are uploaded as the `visual-regression-report` artifact. If a diff is an intended design
change, republish the baselines with `--update --publish-baselines` (or merge to main, which republishes automatically).

## CI

[`.github/workflows/visual-regression.yml`](../.github/workflows/visual-regression.yml) checks out the repo, provides
`gh` auth, and invokes `run.sh`:

- **Pull requests** run `--docker --gendoc --pull-baselines` (verify against published baselines).
- **Pushes to `main`** run `--docker --gendoc --update --publish-baselines` (main defines the truth).
- **Manual dispatch** verifies by default, or republishes when run with `publish=true`.

The workflow contains no logic of its own; everything lives in `run.sh` so it is reproducible locally.
