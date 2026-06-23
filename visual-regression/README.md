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
./visual-regression/run.sh ... --skip-build              # reuse an existing docusaurus/build
./visual-regression/run.sh ... --port 5000               # change the static-server port
./visual-regression/run.sh ... --baselines-tag my-tag    # use a different release tag
./visual-regression/run.sh ... --repo owner/repo         # target a specific repo for gh
./visual-regression/run.sh ... --mount-path /mnt/d/repo  # override the --docker bind-mount source
./visual-regression/run.sh ... --accept-visual-changes   # skip the comparison and pass (intentional redesign)
```

On Windows, run from **WSL**: Docker bind-mount paths (`/d/...`) and `gh` behave correctly there, whereas Git Bash can
mangle the mount path.

## How flakiness is controlled

The spec (`tests/visual.spec.ts`) stabilizes each page before capture:

- Disables CSS animations/transitions and hides scrollbars and text carets.
- Sets the Docusaurus theme via `localStorage` before first paint, and matches the browser color scheme, so
  `ThemedImage` assets resolve correctly.
- Navigates with `domcontentloaded` (not `networkidle`, which never settles on pages with analytics/embeds), then
  waits for web fonts and for every `<img>` to finish loading/decoding (each capped so a hung image can't stall it).
- Scrolls the full page to trigger lazy-loaded content, then returns to the top.
- Intercepts the navbar brand logos (loaded from an external host that returns 403 to non-interactive clients) and
  fulfills them with a blank fixed-size SVG, so they don't capture as broken-image glyphs.
- **Masks** volatile regions instead of comparing them: `iframe` (GitHub star buttons, YouTube), `video`,
  `.asciinema-player`, and `canvas` (ECharts). Add `data-vrt-mask` to any other element that proves unstable.

Pages whose total height is non-deterministic are captured at viewport size instead of full page (set
`fullPage: false` on the page in `pages.ts`; the Scalar API reference uses this).

The pass/fail threshold is `maxDiffPixelRatio: 0.01` (1% of pixels). Tune it in `playwright.config.ts` (global) or
per-assertion in the spec.

## Reviewing failures

On a mismatch, Playwright writes the expected/actual/diff images and an HTML report:

```bash
npx playwright show-report      # run from this directory
```

In CI the report and diffs are uploaded as the `visual-regression-report` artifact.

### Intentional design changes

`main` defines the truth, so a PR that deliberately changes the look will diff against the *old* baselines and turn
`verify` red. To merge it (including past a required status check), add the **`visual-baseline-update`** label to the
PR: `verify` then skips the comparison and passes. After merge, the `publish` job regenerates the baselines on `main`,
and later PRs verify against the new look. You do not hand-regenerate baselines.

## CI

[`.github/workflows/visual-regression.yml`](../.github/workflows/visual-regression.yml) checks out the repo, provides
`gh` auth, and invokes `run.sh`. It contains no logic of its own.

- **Pull requests** run `--docker --gendoc --pull-baselines` (verify against published baselines). With the
  `visual-baseline-update` label, the comparison is skipped and the check passes (see above).
- **Pushes to `main`** run `--docker --gendoc --update --publish-baselines` (main defines the truth). Baselines are
  uploaded to a single rolling release tag (`vrt-baselines`), overwritten in place each time (no history).
- **Manual dispatch** verifies by default, or republishes when run with `publish=true` (used to bootstrap the first
  set, or from the Actions tab once the workflow is on `main`).

If no baselines exist yet (before the first publish), `verify` soft-passes rather than failing, so the bootstrapping
PR isn't blocked.

The workflow contains no logic of its own; everything lives in `run.sh` so it is reproducible locally.
