export GH_PAGE_SIZE=100
export ORG=openziti
export TODAY=$(date '+%Y%m%d')
export SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export STATS_DIR="/tmp/stats"
# The GitHub REST "List stargazers" endpoint (/repos/{o}/{r}/stargazers) is now
# gated on repo admin/collaborator identity (github.blog changelog 2026-06-30) and
# returns 403 for API tokens -- even an org-installed App token with metadata:read
# (the x-accepted-github-permissions: metadata=read header is misleading; the gate
# is identity, not a grantable permission). The GraphQL `stargazers` connection is
# NOT restricted, so buildStargazerJson reads stars via GraphQL (see fetchRepoStars)
# -- any authenticated token works, including the org-installed App token. Prefer
# the dedicated token, then GITHUB_TOKEN. If neither is set (e.g. running locally),
# leave GH_TOKEN unset so `gh` uses your stored `gh auth login` instead.
STAR_TOKEN="${STARGAZERS_READ_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -n "${STAR_TOKEN}" ]]; then export GH_TOKEN="${STAR_TOKEN}"; fi

function makeOutputDir {
mkdir -p ${STATS_DIR}/${TODAY}
}

# ---------------------------------------------------------------------------
# Stargazer collection (GraphQL-based). The REST list-stargazers endpoint was
# restricted in 2026 (see the top-of-file note) and now 403s for API tokens, so
# we read the GraphQL `stargazers` connection instead -- same data (starredAt +
# login), no restriction. `gh api graphql --paginate` walks the connection via
# the $endCursor variable + pageInfo; we wrap it with retry/backoff so a transient
# 403/429 doesn't corrupt output, map each page into the REST star+json shape
# (so the downstream jq is unchanged), throttle between repos, and emit a flat
# {date,user,repo} stream. The build fails hard if ziti or zrok come back empty
# so we never deploy a blank chart on top of good data.
# ---------------------------------------------------------------------------

STAR_PARALLEL="${STAR_PARALLEL:-6}"      # repos fetched concurrently (raise to go faster, lower if rate-limited)
STAR_MAX_RETRY="${STAR_MAX_RETRY:-5}"    # attempts per repo before giving up

function listOrgRepos {
  # Every repo name in the org, one per line. Paginated -- the org has >100
  # repos and the old single-page fetch silently dropped everything past 100.
  # Exclude GHSA security-advisory forks (names like <repo>-ghsa-xxxx-xxxx-xxxx):
  # they aren't real repos, have no stargazers endpoint, and 404.
  gh api --paginate "orgs/${ORG}/repos?per_page=${GH_PAGE_SIZE}" \
    --jq '.[] | select(.name | test("-ghsa-"; "i") | not) | .name' | sort
}

function fetchRepoStars {
  # $1 repo, $2 output file. Reads the repo's stargazers via GraphQL (the REST
  # endpoint is 403-gated now -- see the top-of-file note) and writes a validated
  # JSON array in the REST star+json shape ([{starred_at, user:{login}}, ...]) so
  # the phase-2 assembly below stays unchanged. Retries with exponential backoff
  # on rate limiting; a permanent error (missing repo, etc.) is skipped at once.
  local repo="$1" out="$2" attempt=1 delay=10 err
  local query='query($owner:String!,$name:String!,$endCursor:String){
    repository(owner:$owner,name:$name){
      stargazers(first:100, after:$endCursor, orderBy:{field:STARRED_AT,direction:ASC}){
        pageInfo{ hasNextPage endCursor }
        edges{ starredAt node{ login } }
      }
    }
  }'
  while (( attempt <= STAR_MAX_RETRY )); do
    # --paginate walks pages via $endCursor + pageInfo, emitting one response
    # object per page; `jq -s` merges them and maps edges to the REST shape.
    # Capture stderr (the error reason) while the page stream goes to .tmp.
    if err="$(gh api graphql --paginate \
                -f query="$query" -f owner="$ORG" -f name="$repo" \
                2>&1 >"${out}.tmp")" \
       && jq -s '[ .[] | .data.repository.stargazers.edges[]?
                   | {starred_at: .starredAt, user: {login: .node.login}} ]' \
            "${out}.tmp" > "${out}.arr" 2>/dev/null \
       && jq -e 'type == "array"' "${out}.arr" >/dev/null 2>&1; then
      mv "${out}.arr" "$out"
      rm -f "${out}.tmp"
      return 0
    fi
    rm -f "${out}.tmp" "${out}.arr"
    err="${err//$'\n'/ }"   # flatten to one line for logging
    # Only rate limiting is worth retrying. A permanent error (missing repo, a
    # repo the token can't resolve, etc.) is skipped now instead of burning the
    # whole backoff schedule.
    if ! grep -qiE 'rate limit|secondary|HTTP 429|RATE_LIMITED' <<< "$err"; then
      echo "  ⏭️  ${repo}: skipped -- ${err:-unknown error}" >&2
      return 1
    fi
    echo "  ⚠️  ${repo}: rate-limited (attempt ${attempt}/${STAR_MAX_RETRY}), backing off ${delay}s -- ${err}" >&2
    sleep "$delay"
    delay=$(( delay * 2 ))
    attempt=$(( attempt + 1 ))
  done
  echo "  ❌ ${repo}: gave up after ${STAR_MAX_RETRY} attempts -- ${err}" >&2
  return 1
}

function buildStargazerJson {
  if ! command -v gh >/dev/null 2>&1; then
    echo "❌ gh CLI not found; cannot collect stargazer data" >&2
    exit 1
  fi
  makeOutputDir
  local dir="${STATS_DIR}/${TODAY}"
  local jsonl="${dir}/all.stargazers.jsonl"
  : > "$jsonl"

  local repos; repos="$(listOrgRepos)"
  local repo raw

  # Phase 1: fetch repos concurrently, capped at STAR_PARALLEL in flight.
  # fetchRepoStars writes the raw file only on success, so a present file is
  # our success signal in phase 2 -- clear any stragglers first.
  rm -f "${dir}"/*.stargazers.raw.json 2>/dev/null
  for repo in $repos; do
    fetchRepoStars "$repo" "${dir}/${repo}.stargazers.raw.json" &
    while (( $(jobs -rp | wc -l) >= STAR_PARALLEL )); do wait -n; done
  done
  wait

  # Phase 2: assemble the flat stream (sequential; jq is fast, network was the cost).
  local failed=()
  for repo in $repos; do
    raw="${dir}/${repo}.stargazers.raw.json"
    if [[ -f "$raw" ]]; then
      jq -c --arg repo "$repo" \
        '.[] | {date: .starred_at, user: .user.login, repo: $repo}' \
        "$raw" >> "$jsonl"
      echo "  ✅ ${repo}: $(jq 'length' "$raw") stars"
    else
      failed+=("$repo")
      echo "  ❌ ${repo}: no data after retries"
    fi
  done

  # Combined, date-sorted array of every star event -- uploaded as an artifact
  # for analysis; not consumed by the site.
  jq -s 'sort_by(.date)' "$jsonl" > "${dir}/all.stargazers.detail.json"

  # The three files the chart imports. "others" is everything but ziti and zrok.
  jq -s 'map(select(.repo == "ziti")) | sort_by(.date)' "$jsonl" > "${dir}/all.ziti.stargazers.json"
  jq -s 'map(select(.repo == "zrok")) | sort_by(.date)' "$jsonl" > "${dir}/all.zrok.stargazers.json"
  jq -s 'map(select(.repo != "ziti" and .repo != "zrok")) | sort_by(.date)' "$jsonl" > "${dir}/all.other.stargazers.json"

  local ziti zrok other
  ziti=$(jq 'length' "${dir}/all.ziti.stargazers.json")
  zrok=$(jq 'length' "${dir}/all.zrok.stargazers.json")
  other=$(jq 'length' "${dir}/all.other.stargazers.json")
  echo "stargazer totals -> ziti:${ziti} zrok:${zrok} others:${other}"
  if (( ${#failed[@]} > 0 )); then
    echo "⚠️  ${#failed[@]} repo(s) failed to fetch after retries: ${failed[*]}" >&2
  fi

  # Never overwrite a good chart with nothing: if the two headline repos are
  # empty, the fetch was throttled/blocked -- abort so the last good data stays.
  if (( ziti == 0 || zrok == 0 )); then
    echo "❌ ziti or zrok stargazer data is empty -- aborting so the site keeps its last good chart" >&2
    exit 1
  fi
}

buildStargazerJson
cp "${STATS_DIR}/${TODAY}/all.ziti.stargazers.json" \
   "${STATS_DIR}/${TODAY}/all.zrok.stargazers.json" \
   "${STATS_DIR}/${TODAY}/all.other.stargazers.json" \
   "${SCRIPT_DIR}/docusaurus/src/pages/stargazers/"
echo "copied stargazer json to ${SCRIPT_DIR}/docusaurus/src/pages/stargazers/"
