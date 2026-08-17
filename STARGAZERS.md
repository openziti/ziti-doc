# Stargazers chart — how it works

The "stars over time" chart at **https://netfoundry.io/docs/openziti/stargazers/** is built from live GitHub
stargazer data at site-build time. This doc explains the moving parts, why they're shaped the way they are, and how
to fix it when it breaks.

## TL;DR

- Data is collected by [`gh-stats.sh`](./gh-stats.sh) (this repo) during the site build.
- It reads every `openziti` repo's stargazers and writes one JSON file the chart page imports,
  `docusaurus/src/pages/stargazers/all.repos.stargazers.json`, shaped `{"<repo>": ["<starredAt>", ...]}` — dates only,
  every repo in the org. The page decides which repos get their own line; "other" is whatever is left over.
- GitHub restricts stargazer data to repo admins and collaborators, and the gate keys on **token class**: only a
  **classic PAT** whose account is a repo admin gets through. Fine-grained PATs and GitHub App installation tokens are
  refused whatever they're granted.
- So the build authenticates with a classic PAT in `ZITI_CI_STARGAZERS_READ_TOKEN`.

## Where the pieces live (two repos)

| Piece | Repo | File |
| --- | --- | --- |
| Data collection script | `openziti/ziti-doc` | `gh-stats.sh` |
| Chart page (React/ECharts) | `openziti/ziti-doc` | `docusaurus/src/pages/stargazers/index.tsx` |
| Build + deploy that runs it | `netfoundry/docusaurus-shared` | `.github/workflows/publish.yml` |

The live site is built by **`netfoundry/docusaurus-shared`'s `publish.yml`**, which publishes to netfoundry.io nightly.
It clones this repo into `unified-doc/_remotes/openziti` (from `main`) and runs our `gendoc.sh -s`, which calls
`gh-stats.sh`. So **changes to `gh-stats.sh` must be on `ziti-doc` `main`** to affect the live site.

> **Ignore ziti-doc's own `main.workflow.yml`.** It is disabled, and its stargazer token wiring does not match anything
> described here. The live flow lives entirely in `docusaurus-shared`.

## The token flow

```
publish.yml
  └─ ZITI_CI_STARGAZERS_READ_TOKEN secret (classic PAT, scopes: repo + read:org)
        └─ passed to the build as env ZITI_CI_STARGAZERS_READ_TOKEN
              └─ gh-stats.sh maps it to GH_TOKEN, which `gh` uses for the API
```

**Secret** (on `netfoundry/docusaurus-shared`, Actions secrets):

- `ZITI_CI_STARGAZERS_READ_TOKEN` — a classic PAT on an account with **admin** on the `openziti` repos, scopes `repo`
  and `read:org`.

`gh-stats.sh` also accepts `STARGAZERS_READ_TOKEN`, then `GITHUB_TOKEN`, in that order.

This is a long-lived personal credential tied to one human, so set its expiry deliberately and put a reminder on it: the
day it expires, the collector's fail-on-empty guard takes the whole docs deploy down with it.

## Why a classic PAT (and nothing else)

GitHub's [access restrictions](https://github.blog/changelog/2026-06-30-upcoming-access-restrictions-to-public-api-endpoints-and-ui-views/)
limit stargazer data to "admins and collaborators", on both the REST *List stargazers* endpoint and the GraphQL
`stargazers` connection. The changelog says *identity*, but the gate is *token class*. All three of these are the same
admin account, `viewerPermission: ADMIN` on the repo:

| Credential | GraphQL `stargazers` | REST `/stargazers` |
| --- | --- | --- |
| Classic PAT (`repo`, `read:org`) | works — full edges with `starredAt` | 200 |
| Fine-grained PAT, same account | `FORBIDDEN` | 403 |
| App installation token (`Metadata: read`, org-wide install) | `FORBIDDEN` | 403 |

Same admin, same repo, three different answers. No permission grant changes this — the gate wants the full user identity
a classic PAT carries, so don't "simplify" the credential to a fine-grained PAT or a GitHub App. The HTML view
(`github.com/<org>/<repo>/stargazers`) is gated too: it 404s both anonymously and with an `Authorization` header, and
renders only for a logged-in admin's browser session, so it isn't scrapeable with a token either.

What is left ungated is `repository.stargazerCount` — a scalar with no timestamps, useless for a stars-over-time chart.

### If the classic PAT stops working too

Assume this gate keeps tightening. The fallback that survives without any privileged credential is the per-repo events
feed: `GET /repos/{owner}/{repo}/events` returns `WatchEvent` entries carrying `actor.login` and `created_at`, and it
works **anonymously**. Its limits are 300 events / 90 days per repo — on a busy repo like `ziti` that's about six days of
history — so it works only as an append-forward source polled at least weekly, and it can never backfill. The public
firehose is not an option: GH Archive carries almost no `WatchEvent` records now, and stars that a repo's own events feed
reports are missing from the matching archive hour.

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
  `all.stargazers.detail.json` regrouped by repo, else the `all.{ziti,zrok,other}.stargazers.json` trio recombined
  (each record names its own repo, so the three merge losslessly).
- **Multi-snapshot zips**: only the newest dated directory is used; the names sort chronologically.
- **Refuses to write empty data**, same guard as `gh-stats.sh` — a truncated download leaves your working chart alone
  and exits non-zero.
- **This is not part of `gendoc.sh`** on purpose. `./gendoc.sh -s` is the fetch-live path and needs a classic PAT; this
  is the offline alternative for when you just want the chart populated.

## Running it locally

Needs `gh`, `jq`, and a classic PAT (Settings → Developer settings → Personal access tokens → **Tokens (classic)**,
scopes `repo` + `read:org`) on an account with admin on the org's repos:

```bash
export ZITI_CI_STARGAZERS_READ_TOKEN="ghp_..."  # classic PAT; a fine-grained one 403s on every repo
export STAR_PARALLEL=10                         # optional: repos fetched concurrently (default 6)
./gh-stats.sh                                   # writes the JSON into docusaurus/src/pages/stargazers/
```

A full org run takes a few minutes and ends with the totals line, which is the thing to read:

```
stargazer totals -> ziti:4351 zrok:4623 others:1654
copied stargazer json to .../docusaurus/src/pages/stargazers/
```

With no token in the environment, `gh-stats.sh` falls back to your `gh auth login` — which works only if that login is
itself a classic PAT.

> **Windows notes.** The local `gendoc.ps1 -s` path is **broken** for stargazers: it guards on a `csvtojson` dependency
> and then calls a `gh-stats.ps1` that doesn't exist. Collect stargazer data on Windows by running `bash ./gh-stats.sh`
> directly (Git Bash). CI is unaffected — the netfoundry build runs the `.sh`. Two Windows-only traps fail quietly and
> look like API problems:
>
> - **`/tmp` is not one place.** Git Bash and an msys64 `jq` resolve it to different roots, so the shell writes files
>   `jq` then "cannot open". Set `STATS_DIR` to a drive path — `export STATS_DIR=/d/tmp/stargazer-stats` — which both
>   agree on.
> - **msys64's `jq` 1.8.1 segfaults** under Git Bash on some filters, including the plain `jq -c '.[]'` that assembles
>   the flat stream. The run prints `✅ <repo>: N stars` for every repo while dropping nearly all of them, and the totals
>   come out with one repo populated and the rest at zero. Put the official Windows build (`jq-windows-amd64.exe` from
>   the jqlang releases) ahead of msys64 on `PATH`.

To preview the chart in the unified site, copy `all.repos.stargazers.json` into
`docusaurus-shared/unified-doc/_remotes/openziti/docusaurus/src/pages/stargazers/` and `yarn start` there
(`http://localhost:3000/docs/openziti/stargazers`).

This repo's own dev server also serves the page standalone at `http://localhost:3000/stargazers`
(`cd docusaurus && yarn start`). One trap: `yarn typecheck` is **not** `noEmit`, so it drops compiled `index.js`
files next to every `index.tsx` under `src/`, and Docusaurus then refuses to start with "Duplicate routes found".
Delete them (`git clean -fX docusaurus/src`) if that happens.

## How `gh-stats.sh` behaves (deliberately)

- Fetches every org repo with `gh api --paginate` (handles >100 repos and Link-header paging). The listing is retried
  and **validated**, because `gh` prints its error payload on stdout: unvalidated, a 401 or 504 becomes the repo list and
  the run goes off fetching stars for `openziti/couldn't` and `openziti/Sorry`. A name containing whitespace or quotes is
  an error, not a listing, and the run aborts instead of burning ~100 API calls on its way to the empty-data guard.
- **Concurrent** fetch, capped at `STAR_PARALLEL`; each repo retried with backoff **only on rate limits**.
  Permanent errors (404/403) are skipped immediately with the reason logged.
- **Fails the build** (`exit 1`) if `ziti` or `zrok` come back empty, so a throttled or blocked run can never overwrite a
  good chart with a blank one.
- Reads stars over GraphQL rather than REST: both need the same classic PAT, but REST returns a full user object per star
  (~850 bytes) where GraphQL returns `starredAt` + `login` (~60 bytes), and the collector keeps only the date. Each page
  is mapped into the REST `star+json` shape so the downstream `jq` doesn't care which was used.
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

Two things about the ECharts wiring are load-bearing, and undoing either makes the range slider feel sluggish:

1. The chart option is memoized on the **series only** — not on the date range or the live span — and zoom is pushed in
   imperatively with `dispatchAction`. Keeping the live span in React state instead rebuilds the whole option on every
   zoom tick.
2. `minValueSpan` is a fixed `DAY`. Deriving it from the live span shrinks the minimum window as you zoom in, and the
   handle fights back.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Chart empty / build aborts "ziti or zrok … empty" | The classic PAT expired, was revoked, or its account lost admin | Mint a new classic PAT (`repo` + `read:org`) on an org admin account and update the `ZITI_CI_STARGAZERS_READ_TOKEN` secret |
| `Resource not accessible by personal access token` on every repo | The token is fine-grained, not classic | Only a classic PAT passes the gate; see "Why a classic PAT" |
| `Resource not accessible by integration` on every repo | The build is passing a GitHub App installation token | Pass the classic PAT instead, from `publish.yml` |
| Repo names in the log look like `openziti/Sorry`, `openziti/couldn't` | The org listing failed and its error text was parsed as names | `listOrgRepos` validates against this — if you see it, that check is gone |
| A specific repo missing from "others" | New repo the token's account can't see, or a GHSA fork | Confirm the account has access; `*-ghsa-*` forks are skipped on purpose |
| `totals` show one repo populated, everything else zero (local) | msys64 `jq` segfaulting | Use the official Windows `jq`; see the Windows notes |
| `totals` all zero locally | No token loaded, so it fell back to a `gh` login that isn't a classic PAT | Export `ZITI_CI_STARGAZERS_READ_TOKEN` as shown above |

## Making the collector reusable

The collection half of this (GraphQL + retry budgets + fail-on-empty + which token class the API accepts) is not
OpenZiti-specific and is the part outsiders can't easily rediscover. There's a proposal to extract it as a GitHub Action
in [`STARGAZER-ACTION-PLAN.md`](./STARGAZER-ACTION-PLAN.md) — scope, ~1–1.5 days of work, and the documentation plan.
Not started; it assumes GitHub App auth, which does not work, so it needs a rewrite first.
