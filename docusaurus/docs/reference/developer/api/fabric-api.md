---
title: Fabric API
position: 90
---

The fabric management API `/fabric/v1` is provided by the controller and consumed by administrative clients like the `ziti fabric` CLI. The API is enabled in the controller configuration by adding a `fabric` binding to a web listener. Both `fabric` and `edge-management` APIs are commonly bound to the same web listener because they are used together for Ziti network administration.

Learn more about enabling the fabric API in [the `web` section of the controller configuration here](/reference/30-configuration/controller.md#web).

<!-- https://github.com/openziti/fabric/blob/main/specs/swagger.yml -->
