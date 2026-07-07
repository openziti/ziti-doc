# Stargazers chart — how it works

The "stars over time" chart at **https://netfoundry.io/docs/openziti/stargazers/** is built from live GitHub
stargazer data at site-build time. This doc explains the moving parts, why they're shaped the way they are, and how
to fix it when it breaks.

## TL;DR

- Data is collected by [`gh-stats.sh`](./gh-stats.sh) (this repo) during the site build.
- It reads GitHub's **List Stargazers** API for every `openziti` repo and writes three JSON files the chart page
  imports (`docusaurus/src/pages/stargazers/all.{ziti,zrok,other}.stargazers.json`).
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

To preview the chart in the unified site, copy the three JSON files into
`docusaurus-shared/unified-doc/_remotes/openziti/docusaurus/src/pages/stargazers/` and `yarn start` there
(`http://localhost:3000/docs/openziti/stargazers`).

## How `gh-stats.sh` behaves (deliberately)

- Fetches every org repo with `gh api --paginate` (handles >100 repos and Link-header paging).
- **Concurrent** fetch, capped at `STAR_PARALLEL`; each repo retried with backoff **only on rate limits**.
  Permanent errors (404/403) are skipped immediately with the reason logged.
- **Fails the build** (`exit 1`) if `ziti` or `zrok` come back empty — so a throttled/blocked run can never overwrite
  a good chart with a blank one. This is the guard that would have caught the original silent breakage.
- Emits `all.stargazers.detail.json` ({date,user,repo} for every star). The netfoundry build uploads it as the
  `stargazer-data` artifact (downloadable by anyone with read access to that repo) for ad-hoc analysis.
- Skips GHSA security-advisory forks (`*-ghsa-*`) — they have no stargazers endpoint and 404.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Chart empty / build aborts "ziti or zrok … empty" | App uninstalled, key rotated, or lost access | Check the App is still installed org-wide with `Metadata: read`; re-generate the key + update `STARGAZER_APP_PRIVATE_KEY` |
| `403 Resource not accessible by personal access token` | Something reverted to a PAT | Confirm `publish.yml` still mints the App token and passes it as `STARGAZERS_READ_TOKEN` |
| A specific repo missing from "others" | New repo not yet covered | With an "All repositories" install this shouldn't happen; verify the install scope |
| `totals` all zero locally | No App token loaded (fell back to your `gh` login) | Load an App token as shown above |

## History / gotcha

This chart silently broke on ~2026-06-30 (empty data, green CI) because the old `curl`-based collector wrote GitHub's
error objects straight into the data and never failed. The current design (App auth + fail-on-empty) is the fix. If
you're tempted to "simplify" back to a PAT, re-read the "Why a GitHub App" section — PATs are blocked.
