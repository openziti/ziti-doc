---
title: Ziti Developer Resources
---

import SdkQuickInfoMd from '../../learn/core-concepts/clients/_sdk-quickinfo.md';

## Edge SDKs

<SdkQuickInfoMd/>

[Explore Edge SDKs](../../reference/developer/sdk/index.mdx)

## Edge APIs

Ziti provides several APIs. One of the most visible APIs is implemented by the [Ziti Edge SDKs](./sdk/index.mdx). These provide various language bindings for [the Edge Client API](./api/index.md#edge-client-api) that is used by endpoints to authenticate and discover Ziti services. This API is provided by the Ziti controller.

The most relevant Ziti API for an integrator is [the Management API](./api/index.md#edge-management-api), also provided by the Ziti controller. The `ziti` CLI and the web UI both use the Management API for create, list, update, delete operations on Ziti entities like identities and services.

[Explore Edge APIs](./api/index.md)
