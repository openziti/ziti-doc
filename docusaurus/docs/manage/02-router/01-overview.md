---
id: router-deploying-overview
title: Deployment Overview
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './styles.module.css';

In this article, we are describing the process of router deployment and what attributes can be updated, removed, added after the deployment is completed.  
:::info Notes
Currently, the DNS name or IP address can not be changed after the deployment, because it requires to update the `Sans` section of the router server certificate. To do that one would need to re-enroll the router, which can not be done without creating a new router.
:::
## Components of Deployment
<Tabs>
<TabItem value="Identity" label="Identity" attributes={{className: styles.green}}>
The pki-related fields in the `identity` section of the router configuration files are important to understand. These
files are generated during the process of [enrolling](#enrollment) the router. These files do not need to exist before and will be created during the enrollment process. 
This means the process running the enrollment will need the correct privileges granted in order to write - or overwrite those files in case of re-enrollment.  
If the key specified in the identity section already exists - it will not be overwritten. Instead, it will be used during the enrollment process. In other words, you can create your own key or use existing key.
</TabItem>
<TabItem value="Config" label="Configuration File" attributes={{className: styles.orange}}>
The router is configured using a [yaml](https://yaml.org/) file. The configuration file can be obtained by running the `ziti` CLI binary on the destiantion host, 
but some configration options will need to be passeed to match the deployment details, i.e hostname, ip, private or public routers, etc. See `Process of deployment` for more .
</TabItem>
</Tabs>

## Sizing Guidelines
More details can be found [here](03-sizing.md)
## Process of Deployment
In order to eliminate sharing private key(s) over internet (i.e. existing key(s) located on a target host), it is best practice to run the cli router creation commands  on the target host. 
1. ### Download ziti and ziti-router binaries
    [openziti release notes and artifacts](https://github.com/openziti/ziti/releases)
1. ### Create router config file {#router-config-file}
    More details found [here](02-configuration.md)
1. ### Login to Controller {#controller-login}
    Ensure you are [logged in](../04-cli/logging-in.md).
1. ### Add a new router to the network based on the created config {#router-create}
    <Tabs groupId="routerType">
    <TabItem value="Private" label="Private Router with Edge" attributes={{className: styles.green}}>

    ```bash
    ziti edge create edge-router $ROUTER_NAME_PREFIX \
                                --jwt-output-file $ROUTER_NAME_PREFIX.jwt
    ```

    </TabItem>
    <TabItem value="Gateway" label="Private Router with Edge and Tunneler" attributes={{className: styles.orange}}>

    :::info Notes
    `--no-travesal` flag is not required, but keep in mind that private routers are stub routers and setting it to true disables transitive routing through it.
    In other words, only connections destined for this router will be routed to it by the samrt routing algorithm. `--tunneler-enabled or just -t` flag indicates the tunnel mode.
    :::

    ```bash
    ziti edge create edge-router $ROUTER_NAME_PREFIX \
                                --jwt-output-file $ROUTER_NAME_PREFIX.jwt \
                                --tunneler-enabled --no-traversal 
    ```

    </TabItem>
    <TabItem value="Public" label="Public Router with Edge" attributes={{className: styles.red}}>

    ```bash
    ziti edge create edge-router $ROUTER_NAME_PREFIX \
                                --jwt-output-file $ROUTER_NAME_PREFIX.jwt
    ```

    </TabItem>
    </Tabs>
1. ### Enrolling router to create identity files {#enrollment}  
    ```bash
    ziti-router enroll $ROUTER_NAME_PREFIX.yaml \
                    --jwt $ROUTER_NAME_PREFIX.jwt
    ```
1. ### Running router {#router-running} 
    ```bash
    ziti-router run $ROUTER_NAME_PREFIX.yaml
    ```
## Updating router configuration after deployment {#router-update}
See [update section](04-update.md) for more details
## Logging
See [logging section](../04-cli/logging.md) for more details