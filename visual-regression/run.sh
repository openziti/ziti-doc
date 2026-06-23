#!/usr/bin/env bash
# Visual-regression spot-check runner for the openziti.io Docusaurus site.
#
# Runs entirely locally and is the single entry point CI calls too. It builds the site,
# serves the static output, and runs the Playwright screenshot comparison against the
# curated page set in pages.ts.
#
# Baselines are NOT committed to the repo. They live as a tarball attached to a GitHub
# release (a dedicated rolling tag, default "vrt-baselines"). Pull them down to verify,
# push them up after an intentional change. The repo tree stays free of binary images.
#
# Baseline parity: Playwright screenshots are OS-specific. The published baselines are
# the Linux ones, produced inside the pinned Playwright container (--docker). Verification
# must therefore also run with --docker so the comparison happens on the same platform.
# A native run on Windows/macOS is only for eyeballing; it writes throwaway OS-suffixed
# snapshots that are git-ignored and never published.
#
# Usage:
#   ./run.sh --docker --pull-baselines          # verify against published baselines (the common case)
#   ./run.sh --docker --update --publish-baselines   # regenerate baselines and publish them
#   ./run.sh --docker --update                  # regenerate locally without publishing (inspect first)
#   ./run.sh --base-url URL --pull-baselines    # verify an already-running site (skips build + serve)
#   ./run.sh --skip-build                       # reuse an existing docusaurus/build
#   ./run.sh --gendoc                           # run ./gendoc.sh -c first (pull remotes, matches CI)
#   ./run.sh --port 5000                        # static server port (default 4173)
#   ./run.sh --baselines-tag TAG                # release tag holding the baseline tarball (default vrt-baselines)
#   ./run.sh --repo OWNER/REPO                  # target repo for gh (default: inferred from git remote)
#   ./run.sh --mount-path PATH                  # bind-mount source for --docker (default: repo root)
set -euo pipefail

VR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$VR_DIR/.." && pwd)"
DOCUSAURUS_DIR="$REPO_ROOT/docusaurus"

UPDATE=0
USE_DOCKER=0
SKIP_BUILD=0
RUN_GENDOC=0
PULL_BASELINES=0
PUBLISH_BASELINES=0
PORT=4173
BASE_URL=""
BASELINES_TAG="vrt-baselines"
GH_REPO=""
MOUNT_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --update) UPDATE=1; shift ;;
    --docker) USE_DOCKER=1; shift ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    --gendoc) RUN_GENDOC=1; shift ;;
    --pull-baselines) PULL_BASELINES=1; shift ;;
    --publish-baselines) PUBLISH_BASELINES=1; shift ;;
    --port) PORT="$2"; shift 2 ;;
    --base-url) BASE_URL="$2"; shift 2 ;;
    --baselines-tag) BASELINES_TAG="$2"; shift 2 ;;
    --repo) GH_REPO="$2"; shift 2 ;;
    --mount-path) MOUNT_PATH="$2"; shift 2 ;;
    -h|--help) sed -n '2,28p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

GH_REPO_FLAG=()
[[ -n "$GH_REPO" ]] && GH_REPO_FLAG=(--repo "$GH_REPO")
SNAPSHOTS_DIR="$VR_DIR/snapshots"

# --- Baseline storage (GitHub release asset, via gh) --------------------------------
# These run on the HOST, never inside the Playwright container (which has no gh). The
# container shares the repo via a bind mount, so baselines pulled here are visible to
# the in-container test run, and snapshots written there are visible here for publish.

pull_baselines() {
  echo ">> Pulling baselines from release '$BASELINES_TAG'"
  command -v gh >/dev/null || { echo "ERROR: gh (GitHub CLI) is required for --pull-baselines." >&2; exit 1; }
  local tmp; tmp="$(mktemp -d)"
  if ! gh release download "$BASELINES_TAG" "${GH_REPO_FLAG[@]}" --pattern baselines.tgz --dir "$tmp"; then
    echo "ERROR: could not download 'baselines.tgz' from release '$BASELINES_TAG'." >&2
    echo "       Generate and publish baselines first:" >&2
    echo "         ./run.sh --docker --gendoc --update --publish-baselines" >&2
    rm -rf "$tmp"; exit 1
  fi
  rm -rf "$SNAPSHOTS_DIR"
  tar -xzf "$tmp/baselines.tgz" -C "$VR_DIR"
  rm -rf "$tmp"
  echo ">> Baselines restored to $SNAPSHOTS_DIR"
}

publish_baselines() {
  echo ">> Publishing baselines to release '$BASELINES_TAG'"
  command -v gh >/dev/null || { echo "ERROR: gh (GitHub CLI) is required for --publish-baselines." >&2; exit 1; }
  [[ -d "$SNAPSHOTS_DIR" ]] || { echo "ERROR: no snapshots/ to publish. Run with --update first." >&2; exit 1; }
  local tarball="$VR_DIR/baselines.tgz"
  tar -czf "$tarball" -C "$VR_DIR" snapshots
  if ! gh release view "$BASELINES_TAG" "${GH_REPO_FLAG[@]}" >/dev/null 2>&1; then
    gh release create "$BASELINES_TAG" "${GH_REPO_FLAG[@]}" \
      --title "Visual-regression baselines" \
      --notes "Baseline screenshots for the visual-regression spot-check. Managed by visual-regression/run.sh; this is not a software release." \
      --prerelease
  fi
  gh release upload "$BASELINES_TAG" "$tarball" "${GH_REPO_FLAG[@]}" --clobber
  rm -f "$tarball"
  echo ">> Baselines published"
}

# Derive the pinned Playwright image from the dependency version so the browser binaries
# in the container match the @playwright/test version we install.
PW_VERSION="$(grep -oE '"@playwright/test":[[:space:]]*"[0-9.]+"' "$VR_DIR/package.json" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

# --- Docker mode: do gh work on the host, run build+serve+test in the container -----
if [[ "$USE_DOCKER" == "1" ]]; then
  [[ "$PULL_BASELINES" == "1" ]] && pull_baselines
  # gendoc.sh runs git (it clones the sibling _remotes repos), so it must run on the HOST,
  # not in the container: this checkout may be a linked git worktree whose real .git dir
  # lives elsewhere and is not reachable from inside the mount. The container only needs
  # the files gendoc produces, not git. -d skips gendoc's own build (the container builds);
  # -c keeps existing clones; -l skips SDK API doc generation (doxygen/wget/swift) which the
  # curated page set does not exercise. Drop -l if you add an SDK reference page to pages.ts.
  if [[ "$RUN_GENDOC" == "1" ]]; then
    echo ">> Running gendoc.sh on the host (git is not usable inside the container)"
    ( cd "$REPO_ROOT" && ./gendoc.sh -c -d -l )
  fi
  IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-jammy"
  echo ">> Running build/serve/test inside $IMAGE for Linux baseline parity"
  inner=()
  [[ "$UPDATE" == "1" ]] && inner+=(--update)
  [[ "$SKIP_BUILD" == "1" ]] && inner+=(--skip-build)
  inner+=(--port "$PORT")
  [[ -n "$BASE_URL" ]] && inner+=(--base-url "$BASE_URL")
  # Bind-mount source. Defaults to the repo root, which is correct on Linux, WSL, and CI.
  # If your Docker daemon needs a different host path form (e.g. Docker Desktop reached
  # from a non-Linux shell), pass it with --mount-path. No platform detection here.
  host_mount="${MOUNT_PATH:-$REPO_ROOT}"
  # No -t: this must run in non-tty contexts (background shells, CI). corepack enable
  # provisions the yarn version pinned in docusaurus/package.json; surface its errors.
  docker run --rm \
    -v "${host_mount}:/work" -w /work \
    -e CI="${CI:-}" \
    "$IMAGE" \
    bash -lc "corepack enable && /work/visual-regression/run.sh ${inner[*]}"
  [[ "$PUBLISH_BASELINES" == "1" ]] && publish_baselines
  exit 0
fi

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo ">> Stopping static server (pid $SERVER_PID)"
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

install_vr_deps() {
  echo ">> Installing visual-regression dependencies"
  ( cd "$VR_DIR" && npm install --no-audit --no-fund --silent )
  # In the Playwright image the matching browser is preinstalled; elsewhere this fetches it.
  ( cd "$VR_DIR" && npx playwright install chromium >/dev/null )
}

run_playwright() {
  local args=(test)
  [[ "$UPDATE" == "1" ]] && args+=(--update-snapshots)
  echo ">> Running Playwright (${args[*]})"
  ( cd "$VR_DIR" && npx playwright "${args[@]}" )
}

# In the non-docker (native / base-url) path, gh runs here directly.
[[ "$PULL_BASELINES" == "1" ]] && pull_baselines

# Mode A: site already running somewhere. Just point the tests at it.
if [[ -n "$BASE_URL" ]]; then
  export VRT_BASE_URL="$BASE_URL"
  echo ">> Testing already-running site at $BASE_URL"
  install_vr_deps
  run_playwright
  [[ "$PUBLISH_BASELINES" == "1" ]] && publish_baselines
  echo ">> Done. HTML report: $VR_DIR/playwright-report/index.html"
  exit 0
fi

# Mode B: build + serve locally.
if [[ "$SKIP_BUILD" != "1" ]]; then
  if [[ "$RUN_GENDOC" == "1" ]]; then
    echo ">> Running gendoc.sh -c (pull remote doc sources)"
    ( cd "$REPO_ROOT" && ./gendoc.sh -c )
  fi
  echo ">> Installing docusaurus dependencies"
  ( cd "$DOCUSAURUS_DIR" && yarn install --frozen-lockfile )
  echo ">> Building docusaurus site"
  ( cd "$DOCUSAURUS_DIR" && yarn build )
fi

if [[ ! -d "$DOCUSAURUS_DIR/build" ]]; then
  echo "ERROR: $DOCUSAURUS_DIR/build does not exist. Run without --skip-build first." >&2
  exit 1
fi

export VRT_BASE_URL="http://127.0.0.1:${PORT}"
echo ">> Serving built site on $VRT_BASE_URL"
( cd "$DOCUSAURUS_DIR" && yarn serve --port "$PORT" --host 127.0.0.1 --no-open ) &
SERVER_PID=$!

echo ">> Waiting for server to respond"
for i in $(seq 1 60); do
  if curl -fsS "$VRT_BASE_URL/" -o /dev/null 2>/dev/null; then
    echo ">> Server is up"
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "ERROR: static server exited before becoming ready" >&2
    exit 1
  fi
  sleep 1
  if [[ "$i" == "60" ]]; then
    echo "ERROR: server did not become ready in 60s" >&2
    exit 1
  fi
done

install_vr_deps
run_playwright
[[ "$PUBLISH_BASELINES" == "1" ]] && publish_baselines
echo ">> Done. HTML report: $VR_DIR/playwright-report/index.html"
