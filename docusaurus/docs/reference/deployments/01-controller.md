---
id: controller
title: Controller Deployment
sidebar_label: Controller
---

import CliLogFormats from '../../_cli-log-levels-and-formats.md'

This article is about deploying a Ziti Controller as a Linux system service. [The controller introduction](/learn/introduction/03-components.md#openziti-controller) introduces the architectural concepts used in this guide. [Kubernetes is covered separately](/guides/kubernetes/hosting/kubernetes-controller.mdx).

## Installation

The controller package is installed the same way as the `ziti` CLI and depends on the `openziti` package the provides the CLI.

The signed package sources are found [in the Linux downloads tab](/downloads.mdx?os=Linux).

## Bootstrapping

Bootstrapping happens automatically unless you disable it before running the controller service. Bootstrapping a controller involves:

1. Generating a PKI
1. Generating a configuration YAML file
1. Initializing a database with a default admin password

At a minimum, you must set these to start the service with bootstrapping enabled (the default).

1. In `/opt/openziti/etc/controller/env` (the systemd env file for the controller service)
    1. Set `ZITI_CTRL_ADVERTISED_ADDRESS` to the FQDN of the controller
    1. Temporarily set `ZITI_PWD` to the desired management password for user `admin`

### Bootstrapping the Public Key Infrastructure

Check out [the pki page](/learn/core-concepts/pki.md) for an overview of the concepts used in this deployment reference. The controller service will bootstrap a root and intermediate CA during first startup, unless they exist. 

The controller needs a CA to issue certificates for edge identities during enrollment. This CA is known as the edge signer. It's a good idea to use an intermediate CA for this purpose, as it allows you to rotate the edge signer without changing the root of trust and invalidating all edge enrollments.

The controller needs at least one client and server certificate. The client certificate is used to authenticate to other controllers in a multi-controller deployment.

Disable bootstrapping a PKI by setting `ZITI_BOOTSTRAP_PKI=false` in `/lib/systemd/system/ziti-controller.service`.

### Bootstrapping the Configuration

The controller's configuration is loaded from a YAML file ([reference](/reference/30-configuration/controller.md)). The Linux system service will generate a valid configuration during the first startup, unless one already exists. 

The filename of the configuration file, relative to the Linux service's working directory (`/var/lib/ziti-controller`), is specified in `/lib/systemd/system/ziti-controller.service` as an argument to the `ExecStart` command.

Disable bootstrapping a configuration by setting `ZITI_BOOTSTRAP_CONFIG=false` in `/lib/systemd/system/ziti-controller.service`.

### Bootstrap the Database

The controller requires a BoltDB database to store its state. The Linux system service will initialize a database with a default admin password during the first startup, unless one already exists.

You must specify the management password for the default admin user before starting the service. This is done by setting `ZITI_PWD` in `/opt/openziti/etc/controller/env` or one of `LoadCredential` or `SetCredential` in `/lib/systemd/system/ziti-controller.service`. You may delete the password after bootstrapping for security.

Disable bootstrapping the database by setting `ZITI_BOOTSTRAP_DATABASE=false` in `/lib/systemd/system/ziti-controller.service`.

## Bring Your Own State

You can bring your own PKI, configuration, database, or all three by selectively disabling the respecitve `ZITI_BOOTSTRAP_*` environment variables in `/lib/systemd/system/ziti-controller.service` and running `sudo systemctl daemon-reload` before starting the service.

You can generate a configuration with the `ziti create config controller` command, optionally mutating the result through command-line options or environment variables. You can also find an annotated sample config file from [the Ziti repo](https://github.com/openziti/ziti/blob/main/etc/ctrl.with.edge.yml).

Here's an example BASH script for migrating an existing controller state to the Linux service's working directory.

```bash
#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

pushd $(mktemp -d)

# install controller and CLI packages
curl -sS https://get.openziti.io/install.bash \
| sudo bash -s openziti-controller

# create state with the quickstart
timeout 10s ziti edge quickstart --home $PWD

# ensure service is disabled and state is clean
sudo systemctl disable --now ziti-controller.service
sudo systemctl clean --what=state ziti-controller.service

# duplicate the controller part of the quickstart state to the service working directory using the config.yml filename
# expected by the controller service
sudo cp -Rv ./pki ./db /var/lib/ziti-controller/
sudo cp -v ./ctrl.yaml /var/lib/ziti-controller/config.yml

# correct config paths
sudo sed -Ei "s|$PWD|/var/lib/ziti-controller|g" /var/lib/ziti-controller/config.yml

# disable bootstrapping
sudo sed -Ei 's|(ZITI_BOOTSTRAP_.*)=.*|\1=false|g' /lib/systemd/system/ziti-controller.service
sudo systemctl daemon-reload

# start the service
sudo systemctl enable --now ziti-controller.service
sudo systemctl status ziti-controller.service

```

## Firewall

The controller listens on a single configurable TCP port: `1280/tcp`. This TLS server employs SNI to select the correct certificate for presentation when there are multiple certificates. Ziti clients use ALPN to negotiate a connection to the router control plane (`ziti-ctrl`) or the REST APIs (`h2`, `http/1.1`).

You may set `ZITI_CTRL_ADVERTISED_PORT` in `/opt/openziti/etc/controller/env` to bootstrap with a different port.

Clients "learn" the controller's address and port when they enroll, so it is necessary to re-enroll or re-create the client if the controller's address or port changes.

## Logging

<CliLogFormats/>