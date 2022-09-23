---
sidebar_position: 3
title: Overview
---

# Deployment Edge Architectures

All openziti deployment architectures can be categorized by three types of Zero Trust Edge Access Security Models. Many of them will be overlapping at least 2 of these initially, especially the brownfield deployments.  That gives customers a great deal of flexibility in terms of deployment options depending on where they are in the journey to eventually reach the ZiTi Application Access Security Model, i.e most secured.
    &nbsp;

1. **ZiTi App Access (ZTAA)**

    The Zero Trust is maintained between Applications, and the encryption terminated in Applications
    &nbsp;

    ![image](images/ZTAA.jpg)

    :::info [**Click me for more details**](./ztaa.md)
    :::

    &nbsp;

1. **ZiTi Host Access (ZTHA)**

    The Zero Trust is maintained between Application Hosts, and the encryption terminated at Application Hosts
    &nbsp;

    ![image](images/ZTHA.jpg)

    :::info [**Click me for more details**](./ztha.md)
    :::

    &nbsp;

1.  **ZiTi Network Access (ZTNA)**

    The Zero Trust is only maintained batween Ziti Private Edge Routers, and the encryption is terminated at Ziti Private Edge Routers
    &nbsp;

    ![image](images/ZTNA.jpg)

    :::info [**Click me for more details**](./ztna.md)
    :::