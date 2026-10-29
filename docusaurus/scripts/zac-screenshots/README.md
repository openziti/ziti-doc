# ZAC screenshots

Builds a throwaway OpenZiti network in containers, runs a doc flow through the Ziti Admin Console (ZAC), and saves the
ZAC screenshots that the flow's pages show. Each shot is taken once in light mode and once in dark mode
(`<name>-dark.png`).

```powershell
# docker if its daemon answers, else wslc; writes to docusaurus/static/img/<flow>
pwsh docusaurus/scripts/zac-screenshots/capture.ps1 -Flow add-by-url

pwsh docusaurus/scripts/zac-screenshots/capture.ps1 -Flow add-by-url -Runtime wslc -Themes light -Out build.claude/shots
```

The [`zac-screenshots`](../../../.github/workflows/zac-screenshots.yml) workflow runs the same script on a GitHub runner
and uploads the shots as an artifact. Start it from the Actions tab and pick the flow.

## Layout

| Path | What it is |
| --- | --- |
| `capture.ps1` | Host side: builds the image, starts the flow's sidecars, runs the lab container, cleans up |
| `lab.sh` | Container side: makes the lab certificate, brings up the controller, router and ZAC, runs the flow |
| `run.mjs` | Signs in to ZAC once and runs a flow's page modules in order |
| `lib/zac.mjs` | Generic ZAC driving: browser, login, cropped light/dark shots, form helpers, common ZAC actions |
| `flows/<flow>/` | Everything one doc flow needs; nothing outside it knows the flow exists |

A flow directory has:

| File | Needed | What it does |
| --- | --- | --- |
| `flow.sh` | yes | Sets the controller's names and defines `pass` (run the flow once, fail if the result is wrong) and, optionally, `setup` (extra servers, run once) |
| `flow.ps1` | no | Sets `$Aliases`, `$Sidecars` and `Start-Sidecars` for containers the flow needs beside the lab, such as an IdP |
| `<NN>-<page>.mjs` | yes | One module per doc page, named like the page. It does that page's steps in ZAC and takes that page's shots |
| `names.mjs` | no | `[from, to]` text swaps that show the lab's real names as the docs' example names in every shot |

To add a flow, copy the shape of `flows/add-by-url`, name each module after the doc page it serves, and run
`capture.ps1 -Flow <name>`. Shots go to `docusaurus/static/img/<flow>/`.

## What runs where

Everything runs on one container network. No step needs a public DNS name, a public certificate, or a cloud host.

| Container | Does |
| --- | --- |
| `zac-screenshots` (one-shot, `lab.sh certs`) | Makes a throwaway CA and a server certificate for `*.zititv.demo.openziti.org` |
| sidecars from `flow.ps1` | Whatever the flow needs beside the network, such as Keycloak for add-by-url |
| `zac-screenshots` (`lab.sh run <flow>`) | Controller, router and ZAC on the flow's public name, port 9580, plus the flow's servers, tunnelers and Playwright |

The containers use real hostnames under `zititv.demo.openziti.org` through network aliases. The lab CA goes into the
lab container's trust store, so the tunnelers and the controller trust the lab certificate the same way they would
trust a public CA.

ziti-sdk-c binds the tunneler's OIDC callback listener to `[::1]:20314` only, and a container with IPv6 off on
loopback can't bind it. With docker, `capture.ps1` turns IPv6 on with `--sysctl net.ipv6.conf.all.disable_ipv6=0`.
`wslc` has no `--sysctl`, so when IPv6 is off, `flows/add-by-url/join.sh` preloads `bind6.c`, which retries that bind
on `[::]`.

## The add-by-url flow

Rebuilds the [add-by-url lab](../../docs/how-to-guides/add-by-url/index.md). `flow.ps1` starts Keycloak on the IdP name
and sets it up with `kc-setup.sh` as in step 2; `flow.sh` serves the two services with nginx. For each theme, `pass`
does steps 3-8 in order:

1. `reset.sh` deletes everything steps 3-8 create, so each pass starts from the end of step 2.
2. `30-ext-jwt-signer`, `40-services` and `50-policies` create the signer, auth policy, services, host identity and
   policies through ZAC.
3. `host.sh` enrolls the host identity that ZAC downloaded and runs it.
4. `join.sh` adds the network by URL as `alice` and `bob`, and signs in to Keycloak with `kc-login.sh`.
5. `70-check-identities` and `80-map-existing-identities` take the step 7 and step 8 shots.
6. `join.sh carol none` does the step 8 sign-in, and `verify.sh` fails the run unless all three users can dial.

## Versions

The ziti, ziti-edge-tunnel and ZAC versions are build args in the `Dockerfile`. The Playwright image tag there must
match `package.json`.
