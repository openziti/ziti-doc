export GH_PAGE_SIZE=100
export ORG=openziti
export REPO=ziti
export TODAY=$(date '+%Y%m%d')
export SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export STATS_DIR="/tmp/stats"
# The GitHub "List stargazers" endpoint is restricted to repo admins/collaborators
# (see github.blog changelog 2026-06-30), so this needs a token with metadata:read on
# every openziti repo -- an org member's fine-grained PAT or an org-installed App.
# Prefer the dedicated token, then GITHUB_TOKEN. If neither is set (e.g. running
# locally), leave GH_TOKEN unset so `gh` uses your stored `gh auth login` instead.
STAR_TOKEN="${STARGAZERS_READ_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -n "${STAR_TOKEN}" ]]; then export GH_TOKEN="${STAR_TOKEN}"; fi

function outputFileExists {
if [[ -f $1 ]]; then
  return 0
else
  return 1
fi
}

function getRateLimit {
curl -s -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/rate_limit
}

function getReleases {
makeOutputDir
local api=releases
local outputFile="${STATS_DIR}/${TODAY}/${REPO}.${api}.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already fetched ${api} for today: ${outputFile}"; fi
else
  if [[ ! -z $GH_ECHO ]]; then echo "fetching ${api} to ${outputFile}"; fi
  curl -s -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${ORG}/${REPO}/${api}" \
    -o "${outputFile}"
fi
}

function getStargazers {
makeOutputDir
local api=stargazers
local page=${1-1}
local outputFile="${STATS_DIR}/${TODAY}/${REPO}.${api}.${page}.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already fetched ${api} for today: ${outputFile}"; fi
else
  if [[ ! -z $GH_ECHO ]]; then echo "fetching ${api} to ${outputFile}"; fi
  curl -s -L \
    -H "Accept: application/vnd.github.star+json" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${ORG}/${REPO}/${api}?per_page=${GH_PAGE_SIZE}&page=$page" \
    -o "${outputFile}"
fi
}

function getRepo {
makeOutputDir
local api=repo
local page=${1-1}
local outputFile="${STATS_DIR}/${TODAY}/${REPO}.${api}.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already fetched ${api} for today: ${outputFile}"; fi
else
  if [[ ! -z $GH_ECHO ]]; then echo "fetching ${api} to ${outputFile}"; fi
  curl -s -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${ORG}/${REPO}" \
    -o "${outputFile}"
fi
}

function getAllRepos {
makeOutputDir
local api=repos
local page=${1-1}
local outputFile="${STATS_DIR}/${TODAY}/${ORG}.${api}.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already fetched ${api} for today: ${outputFile}"; fi
else
  if [[ ! -z $GH_ECHO ]]; then echo "fetching ${api} to ${outputFile}"; fi
  curl -s -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/orgs/${ORG}/${api}?per_page=${GH_PAGE_SIZE}" \
    -o "${outputFile}"
fi
}

function getDownloadsByPage {
makeOutputDir
local api=releases
local page=${1-1}
local outputFile="${STATS_DIR}/${TODAY}/${REPO}.${api}.${page}.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already fetched ${api} for today: ${outputFile}"; fi
else
  if [[ ! -z $GH_ECHO ]]; then echo "fetching ${api} to ${outputFile}"; fi

  curl -s -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${ORG}/${REPO}/${api}?per_page=${GH_PAGE_SIZE}&page=$page" \
    -o "${outputFile}"
fi
}

function fetchDownloads {
makeOutputDir
local outputFile="${STATS_DIR}/${TODAY}/${REPO}.releases.all.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already condensed releases for ${REPO}: ${outputFile}"; fi
else
  if [[ ! -z $GH_ECHO ]]; then echo "condensing releases for ${REPO} to: ${outputFile}"; fi
  local to=$(getReleasePageCount)
  if [[ "${to}x" != "x" ]]; then
    for (( i=1; i<=$to; i++)); do getDownloadsByPage $i; done
    jq -s .[] "${STATS_DIR}/${TODAY}/${REPO}.releases."*json > "${STATS_DIR}/${TODAY}/${REPO}.releases.all.json"
  else
    echo "[]" > "${outputFile}"
  fi
fi
}

function fetchAllDownloads {
makeOutputDir
for repo in $(listRepoNames); do
  export REPO=$repo
  echo "Fetching Downloads for: ${REPO}"
  fetchDownloads
done
}

function getReleasePageCount {
makeOutputDir
local result=$(curl -I -s \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${ORG}/${REPO}/releases?page=1" \
| grep -i link \
| sed -n 's/.*page=\([0-9]*\).*rel="last".*/\1/p')
if [[ "${result}x" == "x" ]]; then
  echo "1"
else
  echo "${result}"
fi
}

function makeOutputDir {
mkdir -p ${STATS_DIR}/${TODAY}
}

function getStarCount {
getRepo
jq .stargazers_count ${STATS_DIR}/${TODAY}/${REPO}.repo.json
}

function listRepoNames {
local targetFile="${STATS_DIR}/${TODAY}/${ORG}.repos.json"
if outputFileExists "${targetFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already fetched ${api} for today: ${outputFile}"; fi
else
  getAllRepos
fi
jq -r .[].name ${targetFile} | sort
}

function getStarCountPages {
echo $(($(getStarCount) / $GH_PAGE_SIZE + 1))
}

function fetchStargazers {
local to=$(getStarCountPages)
for (( i=1; i<=$to; i++)); do getStargazers $i; done
}

function fetchAllStargazers {
for repo in $(listRepoNames); do
  export REPO=$repo
  echo "Fetching Stargazers for: ${REPO}"
  fetchStargazers
done
}

function condenseStargazers {
fetchAllStargazers
for repo in $(listRepoNames); do
  export REPO=$repo
  local outputFile="${STATS_DIR}/${TODAY}/${REPO}.stargazers.all.json"
  if outputFileExists "${outputFile}"; then
    if [[ ! -z $GH_ECHO ]]; then echo "already condensed stargazers for ${REPO}: ${outputFile}"; fi
  else
    if [[ ! -z $GH_ECHO ]]; then echo "condensing stargazers for ${REPO} to: ${outputFile}"; fi
    jq -s .[] "${STATS_DIR}/${TODAY}/${REPO}.stargazers."*json > "${STATS_DIR}/${TODAY}/${REPO}.stargazers.all.json"
  fi
done
}

function condenseAllStargazers {
local outputFile="${STATS_DIR}/${TODAY}/all.stargazers.json"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already condensed all stars for ${TODAY}: ${outputFile}"; fi
else
  echo "condensing all stargazers to: ${outputFile}"
  condenseStargazers
  jq -s 'flatten' "${STATS_DIR}/${TODAY}/"*stargazers.all.json > "${outputFile}"
fi
}

function stargazersToCsv {
condenseAllStargazers
local outputFile="${STATS_DIR}/${TODAY}/all.stargazers.csv"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already created stargazers csv for ${TODAY}: ${outputFile}"; fi
else
  for repo in $(listRepoNames); do
    export REPO=$repo
    echo "Converting stargazers for ${REPO} to csv"
    jq -r '.[] | { starred_at: .starred_at, login: .user.login } | [.starred_at, .login, "'"${REPO}"'"] | @csv' \
      "${STATS_DIR}/${TODAY}/${REPO}.stargazers.all.json" >> "${outputFile}"
  done
fi
echo sorting "${outputFile}" to "${STATS_DIR}/${TODAY}/all.stargazers.by.repo.csv"
sort -k3 -k1 -t "," "${outputFile}" > "${STATS_DIR}/${TODAY}/all.stargazers.by.repo.csv"
}

function stargazersPerRepo {
condenseStargazers
for repo in $(listRepoNames); do
  export REPO=$repo
  local outputFile="${STATS_DIR}/${TODAY}/${REPO}.stargazers.csv"
  if outputFileExists "${outputFile}"; then
    if [[ ! -z $GH_ECHO ]]; then echo "already created stargazers list for ${REPO}: ${outputFile}"; fi
  else
    if [[ ! -z $GH_ECHO ]]; then echo "creating stargazers list for ${REPO} to: ${outputFile}"; fi
    jq -r '.[] | { starred_at: .starred_at, login: .user.login } | [.starred_at, .login, "'"${REPO}"'"] | @csv' \
      "${STATS_DIR}/${TODAY}/${REPO}.stargazers.all.json" | sort > "${outputFile}"
  fi
done
}

function getClones {

curl -s -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${ORG}/${REPO}/traffic/clones?per=week"
}

function getTopRefferrals {

curl -s -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${ORG}/${REPO}/traffic/popular/paths"
}

function getTopRefferralSources {

curl -s -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${ORG}/${REPO}/traffic/popular/referrers"
}

function getForks {

curl -s -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${ORG}/${REPO}/forks"
}

function getPageViews {
curl -s -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${ORG}/${REPO}/traffic/views?per=week"
}



function getForkCount {
getRepo
jq .forks_count ${STATS_DIR}/${TODAY}/${REPO}.repo.json
}
function getForksPageCount {
echo $(($(getForkCount) / $GH_PAGE_SIZE + 1))
}

function fetchForks {
for repo in $(listRepoNames); do
  local totalForks=$(getForkCount)
  local pages=$(getForksPageCount)
  export REPO=$repo
  echo "$repo has $pages of forks totalling $totalForks"
done
}

function reduceAllDownloads {
fetchAllDownloads

local outputFile="${STATS_DIR}/${TODAY}/all.releases.csv"
if outputFileExists "${outputFile}"; then
  if [[ ! -z $GH_ECHO ]]; then echo "already reduced downloads to a csv for ${TODAY}: ${outputFile}"; fi
else
  for repo in $(listRepoNames); do
    export REPO=$repo
    echo "Converting stargazers for ${REPO} to csv"
    echo "Reducing Downloads for: ${REPO}"
    jq -r '.[] | {tag_name, created_at, total_downloads: (reduce .assets[] as $asset (0; if ($asset.browser_download_url | endswith("sha256")) then . else . + $asset.download_count end))} | [.tag_name, .created_at, .total_downloads, "'"${REPO}"'"] | @csv' \
    "${STATS_DIR}/${TODAY}/${REPO}.releases.all.json" >> \
    "${outputFile}"
  done
  echo "generated csv: ${outputFile}"
fi
}

function removeTempStargazerFiles {
find . -name *stargazers.[0123456789].json | xargs rm
}

function findTeamId {
local team=$1
curl -s -H "Authorization: Token $GH_ADMIN_TOKEN" \
  "https://api.github.com/orgs/${ORG}/teams" \
  | jq --arg team "$team" '.[] | select(.name==$team) | .id'
}

function addTeamToRepo {
local team=$1
local repo=$2
local teamId=$3
echo "Adding $team with teamId:$teamId to $repo"
curl -H "Authorization: Token $GH_ADMIN_TOKEN" \
  -X PUT -d '{"permission":"push"}' "https://api.github.com/teams/${teamId}/repos/${ORG}/${repo}"
}

function addTeamToAllRepos {
  local team=$1
  local repo=$2
  local teamId=$(findTeamId $team)
  for repo in $(listRepoNames)
  do
    echo "Adding team:$team to repo:$repo with teamId:$teamId"
    addTeamToRepo $team $repo $teamId
  done
}

function toStargazerData {
local inputFile="${STATS_DIR}/${TODAY}/all.stargazers.csv"
grep -v '"ziti"' ${inputFile} | grep -v '"zrok"' | sort | sed '1s/^/date,user,repo\n/'| csvtojson > "${STATS_DIR}/${TODAY}/all.other.stargazers.json"
grep '"ziti"' ${inputFile} | sort | sed '1s/^/date,user,repo\n/'| csvtojson > "${STATS_DIR}/${TODAY}/all.ziti.stargazers.json"
grep '"zrok"' ${inputFile} | sort | sed '1s/^/date,user,repo\n/'| csvtojson > "${STATS_DIR}/${TODAY}/all.zrok.stargazers.json"
echo "stargazer json written to ${STATS_DIR}/${TODAY}/all*.stargazers.json"
ls -l ${STATS_DIR}/${TODAY}/all*.stargazers.json
}

# ---------------------------------------------------------------------------
# Stargazer collection (gh-based). Replaces the older curl-per-page pipeline,
# which had no rate-limit handling and silently wrote API error objects into
# the data whenever GitHub returned a secondary-rate-limit 403 -- jq then
# choked on those objects and produced an empty chart.
#
# `gh api --paginate` walks the Link header and merges pages for us. We wrap it
# with retry/backoff so a transient 403/429 doesn't corrupt output, validate
# that each response really is a JSON array, throttle between repos, and emit a
# flat {date,user,repo} stream. The build fails hard if ziti or zrok come back
# empty so we never deploy a blank chart on top of good data.
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
  # $1 repo, $2 output file. Retries with exponential backoff. On success,
  # writes a validated JSON array and returns 0; on give-up, writes nothing
  # and returns 1 so the caller can record the failure instead of ingesting
  # a rate-limit error object.
  local repo="$1" out="$2" attempt=1 delay=10 err
  while (( attempt <= STAR_MAX_RETRY )); do
    # Capture stderr (the error reason) while stdout goes to the file.
    if err="$(gh api --paginate \
                -H "Accept: application/vnd.github.star+json" \
                "repos/${ORG}/${repo}/stargazers?per_page=${GH_PAGE_SIZE}" \
                2>&1 >"${out}.tmp")" \
       && jq -e 'type == "array"' "${out}.tmp" >/dev/null 2>&1; then
      mv "${out}.tmp" "$out"
      return 0
    fi
    rm -f "${out}.tmp"
    err="${err//$'\n'/ }"   # flatten to one line for logging
    # Only rate limiting is worth retrying. A 404 / 403-no-access is permanent
    # (e.g. GHSA advisory forks, repos the token can't see), so skip it now
    # instead of burning the whole backoff schedule.
    if ! grep -qiE 'rate limit|secondary|HTTP 429' <<< "$err"; then
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
