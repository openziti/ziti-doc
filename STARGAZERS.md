# Stargazers chart — how it works

The "stars over time" chart at **https://netfoundry.io/docs/openziti/stargazers/** is built from live GitHub
stargazer data at site-build time. This doc explains the moving parts, why they're shaped the way they are, and how
to fix it when it breaks.

## TL;DR

- Data is collected by [`gh-stats.sh`](./gh-stats.sh) (this repo) during the site build.
- It reads every `openziti` repo's stargazers and writes one JSON file the chart page imports,
  `docusaurus/src/pages/stargazers/all.repos.stargazers.json`, shaped `{"<repo>": ["<starredAt>", ...]}` — dates only,
  every repo in the org. The page decides which repos get their own line; "other" is whatever is left over.
- Since **2026-06-30** GitHub restricts that API to repo admins/collaborators and **blocks personal access tokens**
  (both classic and fine-grained). So the build authenticates as a **GitHub App**, not a PAT.
- The App is **`openziti-stargazer-audit`** (App ID `4239701`), owned by the `openziti` org, `Metadata: read-only`,
  installed on **all** repositories.

## Where the pieces live (two repos)

| Piece | Repo | File |
| --- | --- | --- |
| Data collection script | `openziti/ziti-doc` | `gh-stats.sh` |
| Chart page (React/ECharts) | `openziti/ziti-doc` | `docusaurus/src/pages/stargazers/index.tsx` |
| Build + deploy that runs it | `netfoundry/docusaurus-shared` | `.github/workflows/publish.yml` |

The live site is built by **`netfoundry/docusaurus-shared`'s `publish.yml`** (green daily builds; publishes to
netfoundry.io). It clones this repo into `unified-doc/_remotes/openziti` (from `main`) and runs our `gendoc.sh -s`,
which calls `gh-stats.sh`. So **changes to `gh-stats.sh` must be on `ziti-doc` `main`** to affect the live site.

> **Ignore ziti-doc's own `main.workflow.yml`** (which runs `publish-2025.sh` / `publish.sh`). It is dead — its last
> run was 2025-11 and its recent runs all failed. It still shows the *old* pre-fix wiring (installs `csvtojson`, reads
> a `STARGAZERS_READ_TOKEN` PAT secret with a "collaborator-scoped token" comment). Don't be fooled into "fixing" the
> token setup there; the App-based flow below lives entirely in `docusaurus-shared`.

## The token flow

```
publish.yml
  └─ actions/create-github-app-token@v1   (app-id + private-key secrets, owner: openziti)
        └─ mints a short-lived App installation token (ghs_…)
              └─ passed to the build as env STARGAZERS_READ_TOKEN
                    └─ gh-stats.sh maps it to GH_TOKEN, which `gh` uses for the API
```

**Secrets** (on `netfoundry/docusaurus-shared`, Actions secrets):

- `STARGAZER_APP_ID` — `4239701` (not secret, just stored as one).
- `STARGAZER_APP_PRIVATE_KEY` — the App's `.pem` private key.

The installation token is minted fresh each build and expires in ~1 hour; there is **no long-lived PAT to rotate**.
The only credential to safeguard/rotate is the App private key.

## Why a GitHub App (and not a PAT)

GitHub's [2026-06-30 change](https://github.blog/changelog/2026-06-30-upcoming-access-restrictions-to-public-api-endpoints-and-ui-views/)
locked the List Stargazers endpoint to admins/collaborators and returns `403 "Resource not accessible by personal
access token"` for PATs — verified for both fine-grained and classic tokens, even when the token's account had
**write** access to the repo. GitHub **App installation tokens** are a different class and are accepted with just
`Metadata: read`. An "All repositories" install also means **new repos are covered automatically** — no per-repo
collaborator grants, no team to maintain, no personal account in the loop.

(Before this, the build used the Actions `GITHUB_TOKEN`; it worked only because pre-restriction GitHub let any
authenticated token read public stargazers.)

## Loading data locally from a downloaded artifact (no token needed)

The quickest way to get real data onto a local chart. Download the **`stargazer-data`** artifact from any
netfoundry/docusaurus-shared publish run, then:

```bash
cd docusaurus

yarn stargazers:load                        # newest stargazer-data*.zip it can find
yarn stargazers:load ~/Downloads/sg.zip     # a specific artifact zip
yarn stargazers:load /tmp/stats/20260729/   # an already-extracted directory
yarn stargazers:load some.detail.json       # a single json file
```

It writes `src/pages/stargazers/all.repos.stargazers.json` and prints what it found:

```
  reading:   C:\temp\stargazer-data-2026-07-29.zip
  snapshot:  20260729
  source:    all.stargazers.detail.json (regrouped by repo)
  repos:     78
  stars:     10682
  top:       zrok (4585), ziti (4314), goroutine-analyzer (141), sdk-golang (129), ziti-sdk-py (95)
```

Details worth knowing:

- **No `unzip`, `jq`, or PowerShell required** — `scripts/load-stargazer-data.mjs` reads the zip itself via
  `node:zlib`, so it behaves the same in Git Bash, WSL, PowerShell, and CI.
- **Reads whichever file the artifact happens to have**, newest source first: `all.repos.stargazers.json` as-is, else
  `all.stargazers.detail.json` regrouped by repo, else the pre-2026-07 `all.{ziti,zrok,other}.stargazers.json` trio
  recombined (each record still names its own repo, so the three merge losslessly — verified to produce identical
  totals to the detail file).
- **Multi-snapshot zips**: only the newest dated directory is used; the names sort chronologically.
- **Refuses to write empty data**, same guard as `gh-stats.sh` — a truncated download leaves your working chart alone
  and exits non-zero.
- **This is not part of `gendoc.sh`** on purpose. `./gendoc.sh -s` is the fetch-live path and needs a GitHub App token;
  this is the offline alternative for when you just want the chart populated.

## Running it locally

Needs `gh`, `jq`, and a way to authenticate. Easiest is an App installation token:

```bash
# mint an App token (needs the Link-/gh-token gh extension: gh extension install Link-/gh-token)
export STARGAZERS_READ_TOKEN="$(gh token generate --app-id 4239701 --installation-id <INSTALLATION_ID> \
  --key /path/to/openziti-stargazer-audit.private-key.pem | jq -r .token)"

export STAR_PARALLEL=10        # optional: repos fetched concurrently (default 6)
./gh-stats.sh                  # writes the three JSON files into docusaurus/src/pages/stargazers/
```

Find `<INSTALLATION_ID>` at: openziti org → Settings → GitHub Apps → the app → Configure (it's in the URL).

If `STARGAZERS_READ_TOKEN`/`GITHUB_TOKEN` are unset, `gh-stats.sh` falls back to your `gh auth login` — but a normal
user login will `403` on the stargazers API, so use the App token.

> **Windows note:** the local `gendoc.ps1 -s` path is **broken** for stargazers — it guards on the retired
> `csvtojson` dependency and then calls a `gh-stats.ps1` that doesn't exist. Collect stargazer data on Windows by
> running `bash ./gh-stats.sh` directly (Git Bash/WSL). CI is unaffected: the netfoundry build runs the `.sh`.

To preview the chart in the unified site, copy `all.repos.stargazers.json` into
`docusaurus-shared/unified-doc/_remotes/openziti/docusaurus/src/pages/stargazers/` and `yarn start` there
(`http://localhost:3000/docs/openziti/stargazers`).

This repo's own dev server also serves the page standalone at `http://localhost:3000/stargazers`
(`cd docusaurus && yarn start`). One trap: `yarn typecheck` is **not** `noEmit`, so it drops compiled `index.js`
files next to every `index.tsx` under `src/`, and Docusaurus then refuses to start with "Duplicate routes found".
Delete them (`git clean -fX docusaurus/src`) if that happens.

## How `gh-stats.sh` behaves (deliberately)

- Fetches every org repo with `gh api --paginate` (handles >100 repos and Link-header paging).
- **Concurrent** fetch, capped at `STAR_PARALLEL`; each repo retried with backoff **only on rate limits**.
  Permanent errors (404/403) are skipped immediately with the reason logged.
- **Fails the build** (`exit 1`) if `ziti` or `zrok` come back empty — so a throttled/blocked run can never overwrite
  a good chart with a blank one. This is the guard that would have caught the original silent breakage.
- Emits `all.stargazers.detail.json` ({date,user,repo} for every star). The netfoundry build uploads it as the
  `stargazer-data` artifact (downloadable by anyone with read access to that repo) for ad-hoc analysis.
- Skips GHSA security-advisory forks (`*-ghsa-*`) — they have no stargazers endpoint and 404.

## The chart page

`docusaurus/src/pages/stargazers/index.tsx` reads `all.repos.stargazers.json` and lets you chart **any** org repo:

- **Charted repos** — pick any repos from the searchable list (sorted by star count). Each gets its own color, taken
  from `PALETTE` in pick order. Defaults to `ziti` + `zrok`.
- **"other"** — everything *not* individually picked, aggregated. So picking a repo moves it out of "other"; the two
  always add up to the whole org. Toggleable.
- **org total** — a dashed cumulative line across all repos. No daily bar: the daily bars are stacked (picked repos +
  other are disjoint), so they already sum to the total.
- **Date window** — preset buttons (1M…All), start/end date inputs, or the slider. All three stay in sync and snap to
  whole UTC days, because every stat in the table is day-bucketed.
- **Persistence** — repo picks, the toggles, and the date window are saved to `localStorage` under
  `openziti.stargazers.v1`, restored after mount (SSR renders the defaults). Saved repo names that no longer exist and
  saved ranges outside the current data are dropped/clamped on load, so a rebuild can't leave you on a blank chart.
  **Reset** restores the defaults.

Two things about the ECharts wiring are load-bearing, and undoing them makes the slider feel sluggish again:

1. The chart option is memoized on the **series only** — not on the date range or the live span. Zoom is pushed in
   imperatively with `dispatchAction`. The old code kept the live span in React state and rebuilt the whole option on
   every zoom tick.
2. `minValueSpan` is a fixed `DAY`. The old code derived it from the live span, so the minimum window shrank as you
   zoomed in and the handle fought back.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Chart empty / build aborts "ziti or zrok … empty" | App uninstalled, key rotated, or lost access | Check the App is still installed org-wide with `Metadata: read`; re-generate the key + update `STARGAZER_APP_PRIVATE_KEY` |
| `403 Resource not accessible by personal access token` | Something reverted to a PAT | Confirm `publish.yml` still mints the App token and passes it as `STARGAZERS_READ_TOKEN` |
| A specific repo missing from "others" | New repo not yet covered | With an "All repositories" install this shouldn't happen; verify the install scope |
| `totals` all zero locally | No App token loaded (fell back to your `gh` login) | Load an App token as shown above |

## Making the collector reusable

The collection half of this (App auth + GraphQL + retry budgets + fail-on-empty) is not OpenZiti-specific and is the
part outsiders can't easily rediscover. There's a proposal to extract it as a GitHub Action in
[`STARGAZER-ACTION-PLAN.md`](./STARGAZER-ACTION-PLAN.md) — scope, ~1–1.5 days of work, and the documentation plan. Not
started.

## History / gotcha

This chart silently broke on ~2026-06-30 (empty data, green CI) because the old `curl`-based collector wrote GitHub's
error objects straight into the data and never failed. The current design (App auth + fail-on-empty) is the fix. If
you're tempted to "simplify" back to a PAT, re-read the "Why a GitHub App" section — PATs are blocked.
