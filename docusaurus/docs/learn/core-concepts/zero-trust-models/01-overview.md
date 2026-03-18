---
id: overview
title: Zero Trust Models
hide_table_of_contents: true
---

All OpenZiti deployment architectures can be categorized by three Zero Trust Edge Access Security Models. Many deployments will use more than one model, especially in brownfield environments. Each model offers a different tradeoff between integration effort and security posture - choose the one that fits your requirements, or mix and match across services.

## App Access (ZTAA)

The Zero Trust is maintained between Applications, and the encryption terminated in Applications

![image](/img/deployment-architecture/ZTAA.v2.png)

----

## Host Access (ZTHA)

The Zero Trust is maintained between Application Hosts, and the encryption terminated at Application Hosts
&nbsp;

![image](/img/deployment-architecture/ZTHA.v2.png)

----

## Network Access (ZTNA)

The Zero Trust is only maintained between Ziti Private Edge Routers, and the encryption is terminated at Ziti Private Edge Routers
&nbsp;

![image](/img/deployment-architecture/ZTNA.v2.png)
