# Removed quickstart pages (record)

This folder used to hold several "run the overlay this way" quickstart pages. They were removed while reworking Get
started around the single `ziti run quickstart` command (with the `--zac` flag for the admin console). This file records
what was deleted, why, and what unique content was lost, so it can be recovered or relocated later.

The pages themselves are recoverable from git history at their original paths under
`docusaurus/docs/get-started/network/`. This file is prefixed with an underscore so Docusaurus does not build it.

## Where to find the originals in git

The last commit that still contains every original file (before this rework deleted them) is:

- commit `d0a3d04f4e0dde6c20bc071ab793381c5d8f8773` ("rebase with main and update to newer component")
- on branch `add-get-started`

Even after the deletions are committed on top, that commit remains the reference point. To read or restore a page from
it:

```bash
# print a deleted page to stdout
git show d0a3d04f:docusaurus/docs/get-started/network/local-kubernetes.mdx

# restore one back into the working tree
git checkout d0a3d04f -- docusaurus/docs/get-started/network/local-docker-compose.mdx

# list everything that lived in that folder at that commit
git ls-tree -r --name-only d0a3d04f -- docusaurus/docs/get-started/network/
```

Original filenames: `local-no-docker.mdx`, `hosted.mdx`, `local-with-docker.mdx`, `local-docker-compose.mdx`,
`local-kubernetes.mdx`.

## Why they were removed

- The new `ziti run quickstart --zac` is the getting-started path now. It stands up a controller, a router, and the
  console from one command, which is far simpler than any of these walkthroughs.
- They duplicated the deployment guides. Docker and Kubernetes deployment are already covered, and more currently, under
  `how-to-guides/deployments/20-docker` and `how-to-guides/deployments/30-kubernetes`.
- Their command style had aged. They used the older `openziti/quickstart` container scripts, `zitiLogin`, and the
  `ziti edge ...` command forms rather than the current top-level `ziti ...` commands.

## What was removed

### local-no-docker.mdx ("Run locally without Docker")

Removed earlier in this rework. It taught the old `expressInstall` flow sourced from `ziti-cli-functions.sh`, with
`startController` / `startRouter` / `zitiLogin` helper functions and env-file sourcing.

- What was lost: the shell-function install path and its env-var customization (ports, network name, config location).
- Superseded by: `ziti run quickstart`, whose flags (`--ctrl-address`, `--router-address`, `--ctrl-port`,
  `--router-port`, `--home`, `--instance-id`) cover the same customization far more directly.

### hosted.mdx ("Run OpenZiti anywhere")

- What was lost: the walkthrough for standing OpenZiti up on an internet-accessible host.
- Superseded by: the deployment guides under `how-to-guides/deployments`, which is where a long-lived, publicly reachable
  install belongs. This was really a deployment, not a two-minute quickstart.

### local-with-docker.mdx ("Run in a Docker container")

Ran the whole stack from the single `openziti/quickstart` image using `run-controller.sh` and `run-router.sh`.

- Covered: creating a docker named volume and a user-defined docker network, network-alias addressing between
  containers, an `access-control.sh` init container to create the default edge-router and service-edge-router policies,
  a second-router example on an alternate port, hosts-file addressing for access from outside docker, and testing via
  `docker exec` plus `zitiLogin` and `ziti edge list edge-routers`.
- What was lost: the single-image containerized walkthrough with hand-managed docker networking.
- Superseded by: `how-to-guides/deployments/20-docker` (per-component containers) and `ziti run quickstart` for a quick
  local look.

### local-docker-compose.mdx ("Run with Docker Compose")

Brought the overlay up with `docker compose up` using `get.openziti.io/dock/docker-compose.yml` and a `.env` file.

- Covered: the stock compose file and a `simplified-docker-compose.yml` variant, plus stop and volume-retention behavior.
- Unique content lost: the blue / red / purple multi-network topology demo. It illustrated underlay isolation, public
  versus private routers, a transit-only "fabric" router, and a dark `web-test-blue` service reached over the overlay
  without an exposed port. The accompanying diagram asset `docker-compose-overview.svg` is still in this folder, unused,
  so the demo can be rebuilt from it.
- Salvage recommendation: this demo is pedagogical, not a quickstart. If kept, relocate it under `learn/` rather than
  Get started.
- Superseded (basic compose only) by: `how-to-guides/deployments/20-docker`.

### local-kubernetes.mdx ("Run on Kubernetes")

The "miniziti" walkthrough: a full local Kubernetes overlay on `minikube`.

- Covered: a `miniziti` minikube profile, the `ingress` and `ingress-dns` addons, patching `ingress-nginx` for
  SSL passthrough, installing `cert-manager` and `trust-manager` CRDs, the OpenZiti `ziti-controller` and `ziti-router`
  Helm charts with the `values-ingress-nginx.yaml` values, CoreDNS `*.miniziti.internal` forwarding, and per-OS
  (Windows/WSL2, macOS, Linux) host DNS and `minikube tunnel` setup. It offered both a one-shot `miniziti.bash` script
  and the equivalent manual steps.
- Unique content lost: an end-to-end service demo. It created client and host identities, intercept and host configs, a
  service, bind and dial policies, installed the OpenZiti `httpbin` Helm chart as a dark demo API, added the client
  identity to a tunneler, and tested reaching `httpbin.miniziti.private` over the overlay, plus the console at
  `/zac/` and cleanup steps.
- Superseded (Helm install only) by: `how-to-guides/deployments/30-kubernetes`. The self-contained miniziti demo and its
  httpbin service exercise are not replicated there and are the main thing lost.

## Rewritten (not deleted): services/index.md "Create your first service"

The `get-started/services/index.mdx` page was rewritten, not removed. The original version is preserved at commit
`d0a3d04f` (path `docusaurus/docs/get-started/services/index.md`).

- Old approach: secure a "brownfield" HTTP server. It required the reader to stand up a separate web server
  (`docker run ... openziti/hello-world`), install a client-side tunneler and a server-side tunneler, then wire up
  `intercept.v1` / `host.v1` configs, a service, dial and bind service-policies, and router policies, largely with the
  older `ziti edge ...` command forms. It also leaned on the now-removed docker-compose quickstart's bundled
  `web-test-blue` server.
- Why rewritten: it made the first-service experience heavy (extra server, two tunnelers) and used stale command forms.
  The new `ziti run quickstart` already leaves a tunneler-enabled router on the same machine, so a first service can
  target something already running (the controller's own REST API at `127.0.0.1:1280`, or local SSH) with no extra
  server to install.
- What was lost: the before/after diagrams (`before-openziti.png`, `after-openziti.png`, still in the services folder)
  and the detailed 12-step CLI walkthrough with the full `openziti/hello-world` example output.

## Known follow-ups (broken inbound links to fix later)

Removing these pages leaves dangling links in pages that were not touched. These will fail a production build
(`onBrokenLinks: 'throw'`) until repointed or removed:

- `docs/learn/quickstart-walkthrough.md` links to `local-no-docker`, `local-with-docker`, `local-docker-compose`, and
  `hosted`. This page describes the old `expressInstall` process and is itself a strong candidate for removal or rewrite.
- `docs/get-started/services/index.md` links to `local-no-docker` and `hosted`.
- `docs/get-started/zac/index.mdx` links to `local-no-docker` and `hosted`. This page is already out of the sidebar.

Versioned docs under `openziti_versioned_docs/version-1.x/` and the blog post about Pi Day also reference the old paths,
but those are frozen snapshots and external URLs, so they were intentionally left alone.
