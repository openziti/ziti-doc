# ZAC screenshots

Rebuilds the [add-by-url lab](../../docs/how-to-guides/add-by-url/index.md) in containers, does steps 3-8
through the Ziti Admin Console (ZAC), and saves the ZAC screenshots that the lab pages show. Each shot is taken once
in light mode and once in dark mode (`<name>-dark.png`).

```powershell
# docker if its daemon answers, else wslc; writes to docusaurus/static/img/add-by-url
pwsh docusaurus/scripts/zac-screenshots/capture.ps1

pwsh docusaurus/scripts/zac-screenshots/capture.ps1 -Runtime wslc -Themes light -Out build.claude/shots
```

The [`zac-screenshots`](../../../.github/workflows/zac-screenshots.yml) workflow runs the same script on a GitHub runner
and uploads the shots as an artifact. Start it from the Actions tab.

## What runs where

Everything runs on one container network. No step needs a public DNS name, a public certificate, or a cloud host.

| Container | Does |
| --- | --- |
| `zac-screenshots` (one-shot, `lab.sh certs`) | Makes a throwaway CA and a server certificate for `*.zititv.demo.openziti.org` |
| `zac-screenshots-kc` | Keycloak on `addbyurl-idp.zititv.demo.openziti.org:9780`, set up by `kc-setup.sh` as in step 2 |
| `zac-screenshots` (`lab.sh run`) | Controller, router and ZAC on `addbyurl.zititv.demo.openziti.org:9580`, the two nginx services, the tunnelers, and Playwright |

The containers use the lab's real hostnames through network aliases, and `lib.mjs` swaps them for the docs'
`example.com` names before each shot. The lab CA goes into the lab container's trust store, so the tunnelers and the
controller trust Keycloak and the controller's public certificate the same way they would trust a public CA.

ziti-sdk-c binds the tunneler's OIDC callback listener to `[::1]:20314` only, and a container with IPv6 off on
loopback can't bind it. With docker, `capture.ps1` turns IPv6 on with `--sysctl net.ipv6.conf.all.disable_ipv6=0`.
`wslc` has no `--sysctl`, so when IPv6 is off, `join.sh` preloads `bind6.c`, which retries that bind on `[::]`.

For each theme, `lab.sh` does the lab in order:

1. `reset.sh` deletes everything steps 3-8 create, so each pass starts from the end of step 2.
2. `capture.mjs build` creates the signer, auth policy, services, host identity and policies through ZAC.
3. `host.sh` enrolls the host identity that ZAC downloaded and runs it.
4. `join.sh` adds the network by URL as `alice` and `bob`, and signs in to Keycloak with `kc-login.sh`.
5. `capture.mjs identities` and `capture.mjs carol` take the step 7 and step 8 shots.
6. `join.sh carol none` does the step 8 sign-in, and `verify.sh` fails the run unless all three users can dial.

## Versions

The ziti, ziti-edge-tunnel and ZAC versions are build args in the `Dockerfile`. The Playwright image tag there must
match `package.json`.
