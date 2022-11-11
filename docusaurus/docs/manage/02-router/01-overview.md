---
id: router-overview
title: Deployment Overview
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './styles.module.css';

This article describes the process of deploying a router. It covers what attributes can be updated, removed and added after the deployment is completed.

## Components of Deployment

:::info Notes
Changing a router's advertised DNS entry or IP address (if not DNS-based) is not supported. To change these values after enrollment, the router must be deleted and re-enrolled.
:::

### Identity
The pki-related fields in the `identity` section of the router configuration files are important to understand. These
files are generated during the process of [enrolling](#enrollment) the router. These files do not need to exist before and will be created during the enrollment process. 
This means the process running the enrollment will need the correct privileges granted in order to write - or overwrite those files in case of re-enrollment.  
If the key specified in the identity section already exists - it will not be overwritten. Instead, it will be used during the enrollment process. In other words, you can create your own key or use existing key.

### Configuration File
The router is configured using a [yaml](https://yaml.org/) file. The configuration file can be obtained by running the `ziti` CLI binary on the destiantion host, 
but some configration options will need to be passed to match the deployment details, i.e hostname, ip, private or public routers, etc. See `Process of deployment` for more.

## Sizing Guidelines
More details can be found [here](./router-sizing)
## Process of Deployment
In order to eliminate sharing private key(s) over internet (i.e. existing key(s) located on a target host), it is best practice to run the cli router creation commands  on the target host. 

:::info Note
Ensure you are [logged in](../cli/cli-login) 
for creating/updating routers through Cli
:::

### Download ziti and ziti-router binaries
[openziti release notes and artifacts](https://github.com/openziti/ziti/releases/latest)
### Create router config file {#router-config-file}
More details found [here](./router-configuration-file)
### Add router to network {#router-create}
More details found [here](./update/router-update-cli/#create-router).
### Enroll router to create identity files {#enrollment}  
```bash
ziti-router enroll $ROUTER_NAME.yaml \
                --jwt $ROUTER_NAME.jwt
```
### Run router {#router-running} 
```bash
ziti-router run $ROUTER_NAME.yaml
```
## Update router after deployment {#router-update}
See [update section](./update/router-update-cli/#update-router) for more details
## Logging
See [logging section](../cli/logging) for more details