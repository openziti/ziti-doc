---
id: deployment
title: Router Deployment
---

import CliLogin from '../../../_cli-login.md'
import CliLogFormats from '../../../_cli-log-levels-and-formats.md'

This article is about deploying a Ziti router as a Linux system service or Docker container. [This page](/learn/introduction/03-components.md#openziti-router) provides an overview of these concepts. [Kubernetes is covered separately](/guides/kubernetes/hosting/kubernetes-router.mdx).


Routers provide Ziti network entry and exit points for clients and smart routing through the mesh. You must have at least one router that is advertising an edge connection to clients. If you have more than one router, you must configure transport links between them to form the fabric mesh. This reference is about deploying a Ziti router as a Linux system service or Docker container.

## Installation

The router package depends on the `openziti` package that provides the `ziti` CLI executable.

The signed package sources are found [in the Linux downloads tab](/downloads.mdx?os=Linux).

## Bootstrapping

You will be prompted for the bootstrapping configuration listed below if the Linux package is installed interactively, unless the answer is already known in the env file.

Bootstrapping happens automatically unless you disable it before running the router service. Bootstrapping a router involves:

1. Generating a one-shot configuration file from env answers and defaults
1. Enrolling the router with the controller

At a minimum, you must set these to start the service with bootstrapping enabled (the default).

1. In `/opt/openziti/etc/router/env` (the systemd env file for the router service)
    1. Set `ZITI_CTRL_ADVERTISED_ADDRESS` to the FQDN of the controller.
    1. Set `ZITI_ENROLL_TOKEN` to the resulting token (JWT)

Additionally, you probably want to set these:

1. In `/opt/openziti/etc/router/env` (the systemd env file for the router service)
    1. Set `ZITI_ROUTER_ADVERTISED_ADDRESS` to the permanent FQDN of the router (default is the system's hostname, which may not be resolvable by clients). This value can not be changed after enrollment.
    1. Set `ZITI_ROUTER_MODE` to `tproxy` (default is `host`) if this router's built-in tunneler will provide a transparent proxy for dialing services. This changes the requirements for kernel capabilities and DNS configuration.

### Bootstrapping the Configuration

The router's configuration is loaded from a YAML file ([reference](/reference/30-configuration/router.md)). The Linux system service will generate a valid configuration during the first startup, unless one already exists. 

The filename of the configuration file, relative to the router's working directory, is given as an argument, e.g., `entrypoint.bash run router1-config.yml`. The default is `config.yml`.

Explore configuration option variables by running `ziti create config environment --help`. Any of these may be set in the env file or the Docker environment to influence the bootstrapped configuration.

Disable bootstrapping a configuration by setting `ZITI_BOOTSTRAP_CONFIG=false` in `/lib/systemd/system/ziti-router.service` or the Docker environment.

### Bootstrapping the Enrollment

You must provide an enrollment token. Obtain the token by administratively creating the router.

```text title="Create a router"
ziti edge create edge-router "AcmeRouter1" \
    --tunneler-enabled \
    --jwt-output-file path/to/token.jwt
```

[Learn more about managing routers with the CLI](/guides/deployments/20-router/40-cli-mgmt.md).

The systemd service looks for the token in `/opt/openziti/etc/router/.token` if env var `ZITI_ENROLL_TOKEN` is empty. The file must be readable by root (not others).

`ZITI_ENROLL_TOKEN` may be defined for the systemd service in `/opt/openziti/etc/router/env` or in the Docker environment when running as a container.

The router will enroll with the controller during the first startup. The one-time enrollment token is consumed during the enrollment process and a private key is generated in the router's working directory.

Disable bootstrapping enrollment by setting `ZITI_BOOTSTRAP_ENROLLMENT=false` in `/lib/systemd/system/ziti-router.service` or in the Docker environment.

## Bring Your Own State

You can bring your own configuration or enrollment by selectively disabling the respecitve `ZITI_BOOTSTRAP_*` environment variables in `/lib/systemd/system/ziti-router.service` or the Docker environment.

You can generate a configuration with the `ziti create config router` command, optionally mutating the generated config with a combination of command-line args and environment variables. Find an annotated sample config file from [the Ziti repo](https://github.com/openziti/ziti/blob/main/etc/edge.router.yml).

Here's an example BASH script for migrating an existing controller state to the Linux service's working directory.

```bash
#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

pushd $(mktemp -d)

# install router and CLI packages
curl -sS https://get.openziti.io/install.bash \
| sudo bash -s openziti-router

# create state with the quickstart
timeout 10s ziti edge quickstart --home $PWD

# ensure service is disabled and state is clean
sudo systemctl disable --now ziti-router.service
sudo systemctl clean --what=state ziti-router.service

# duplicate the controller part of the quickstart state to the service working directory using the config.yml filename
# expected by the controller service
sudo mkdir -pv /var/lib/ziti-router/
sudo cp -v ./quickstart-router.* /var/lib/ziti-router/
sudo mv -v /var/lib/ziti-router/{quickstart-router.yaml,config.yml}

# correct config paths
sudo sed -Ei "s|$PWD|/var/lib/ziti-router|g" /var/lib/ziti-router/config.yml

# disable bootstrapping
sudo sed -Ei 's|(ZITI_BOOTSTRAP_.*)=.*|\1=false|g' /lib/systemd/system/ziti-router.service
sudo systemctl daemon-reload

# run only the controller in the background using the quickstart state so the enrolled router can check in
nohup ziti controller run ctrl.yaml &

# start the service
sudo systemctl enable --now ziti-router.service
sudo systemctl status ziti-router.service
```

## Firewall

The router listens on a single configurable TCP port: `3022/tcp`. Ziti clients use ALPN to negotiate a connection to the edge (`ziti-edge`), fabric links (`ziti-link`), or health-check APIs (`h2`, `http/1.1`).

You may set `ZITI_ROUTER_PORT` in `/opt/openziti/etc/router/env` or the Docker environment to bootstrap with a different port.

Clients "learn" the router's address and port when they poll the controller for authorized routers, so it is not necessary to re-enroll or re-create the client if the router's address or port changes. Simply change the config, bounce the router, and it will begin advertising the new address and port. This works because the system service and Docker container both auto-renew their server certificate every startup, and the certificate's DNS subject alternative name is set in the router's config.yml file. If you set `ZITI_AUTO_RENEW_CERTS=false` then it's necessary to administratively re-create the router or run at least once with the `--extend` flag.

## Agent

The router provides an IPC agent for administration. The agent listens on a Unix domain socket inside the filesystem namespace of the router service. Here's an example for querying the router's agent for statistics.

```text
systemctl show -p MainPID --value ziti-router.service \
| xargs -rIPID sudo nsenter --target PID --mount -- \
    ziti agent stats
```

```buttonless title="Output"
goroutines: 38
OS threads: 20
GOMAXPROCS: 16
num CPU: 16
```

## Logging

<CliLogFormats/>
