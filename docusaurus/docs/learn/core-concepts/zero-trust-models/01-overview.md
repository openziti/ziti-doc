---
id: overview
title: Zero Trust Models
hide_table_of_contents: true
---

All OpenZiti deployment architectures can be categorized by three types of Zero Trust Edge Access Security Models. Many of them will be overlapping at least 2 of these initially, especially the brownfield deployments.  That gives customers a great deal of flexibility in terms of deployment options depending on where they are in the journey to eventually reach the ZiTi Application Access Security Model, i.e most secured.

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
