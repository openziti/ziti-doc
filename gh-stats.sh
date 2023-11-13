export GH_PAGE_SIZE=100
export ORG=openziti
export REPO=ziti
export TODAY=$(date '+%Y%m%d')
export SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export STATS_DIR="/tmp/stats"
export GH_TOKEN="${GITHUB_TOKEN}"

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

stargazersToCsv
toStargazerData
cp ${STATS_DIR}/${TODAY}/all*.stargazers.json ./docusaurus/src/pages/
