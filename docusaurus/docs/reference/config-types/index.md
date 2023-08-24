---
title: Builtin Config Types
sidebar_position: 10
---

## Overview

OpenZiti comes with some builtin configuration types. These are used to describe how to intercept or
host services.

* `intercept.v1` - used for configuring tunneler intercepts
* [`host.v2`](./host.v2.md) - used for configuring a tunneler or edge router/tunneler service
  hosting
* `host.v1` - used for configuring a tunneler or edge router/tunneler service hosting, similar to
  `host.v2`, but only allows configuration a single service endpoint
* `ziti-tunneler-server.v1` - **Deprecated** used to configure service hosting. Use `host.v2` or
  `host.v1`
  instead
* `ziti-tunneler-client-v1` - **Deprecated** used to configure tunneler intercepts.
  Use `intercept.v1`
  instead.
