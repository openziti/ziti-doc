---
id: router-deployment
title: Router Deployment
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './styles.module.css';

The Ziti Router is the entry point for Ziti-based clients. It is responsible for authenticating incoming connections by
verifying the connecting client has a valid network session.  It also routes traffic to whatever the
destination is for the given service. In simple deployments can have a single router as is the case
with the [Ziti Network Quickstart](../../quickstarts/network/index.md).

## Deployment

This article describes the process of deploying a router. It covers what attributes can be updated, removed, and added after the deployment is completed.

:::info Notes
Changing a router's advertised DNS entry or IP address (if not DNS-based) is not supported. To change these values after enrollment, the router must be deleted and re-enrolled.
:::

### Identity

The pki-related fields in the `identity` section of the router configuration files are important to understand. These files are generated during the process of [enrolling](#enroll-router-to-create-identity-files-enrollment) the router. These files do not need to exist before and will be created during the enrollment process. This means the process running the enrollment will need the correct privileges granted in order to write - or overwrite those files in case of re-enrollment. If the key specified in the identity section already exists - it will not be overwritten. Instead, it will be used during the enrollment process. In other words, you can create your own key or use existing key.

### Configuration File

The router is configured using a YAML file. The configuration file can be obtained by running the `ziti` CLI binary on the destiantion host, but some configration options will need to be passed to match the deployment details, i.e hostname, ip, private or public routers, etc. See `Process of deployment` for more.

## Process of Deployment

It is advisable to generate private keys on the same host where they'll be used to avoid duplication. This minimizes opportunities for theft and misuse.

:::info Note
Ensure you are [logged in](../cli/cli-login)
for creating/updating routers through Cli
:::

### Download Binaries

You will need the `ziti` and `ziti-router` executables: [OpenZiti Releases](https://github.com/openziti/ziti/releases/latest)

### Create Router Config File {#router-config-file}

More details found [here](./02-configuration.md)

### Add Router to Network {#router-create}

More details found [here](./update/router-update-cli/#create-router).

### Enroll Router to Create Identity Files {#enrollment}

```bash
ziti-router enroll $ROUTER_NAME.yaml \
                --jwt $ROUTER_NAME.jwt
```

### Run Router {#router-run}

```bash
ziti-router run $ROUTER_NAME.yaml
```

## Update Router After Deployment {#router-update}

See [update section](./update/router-update-cli/#update-router) for more details

## Logging

See [logging section](../cli/logging) for more details
