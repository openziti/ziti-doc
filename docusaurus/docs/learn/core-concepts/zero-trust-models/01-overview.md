---
id: overview
title: Zero trust models
hide_table_of_contents: true
---

All OpenZiti deployment architectures can be categorized by three zero trust Edge Access Security Models. Many deployments will use more than one model, especially in brownfield environments. Each model offers a different tradeoff between integration effort and security posture - choose the one that fits your requirements, or mix and match across services.

## App access (ZTAA)

The zero trust is maintained between Applications, and the encryption terminated in Applications

![image](/img/deployment-architecture/ZTAA.v2.png)

----

## Host access (ZTHA)

The zero trust is maintained between Application Hosts, and the encryption terminated at Application Hosts
&nbsp;

![image](/img/deployment-architecture/ZTHA.v2.png)

----

## Network access (ZTNA)

The zero trust is only maintained between Ziti Private Edge Routers, and the encryption is terminated at Ziti Private Edge Routers
&nbsp;

![image](/img/deployment-architecture/ZTNA.v2.png)
