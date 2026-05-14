---
sidebar_label: Overview
sidebar_position: 1
---

# OpenZiti overview

OpenZiti is a free, open-source zero-trust networking platform that makes network services invisible to unauthorized
users. The project provides everything you need to create a zero-trust overlay network — controllers, routers,
tunnelers, and SDKs — so you can secure both existing applications and new ones. Whether you add zero trust at the
network level, the host level, or directly inside your application, every connection is authenticated, authorized, and
encrypted end to end.

![OpenZiti overlay network diagram](@openziti_img/ziti-overview.svg)

OpenZiti gives you **zero trust, high performance networking on any Internet connection**, without VPNs. Add it to
existing applications with tunnelers, or embed it directly with our SDKs for the strongest posture.

## Components

An OpenZiti network has a few key deployed pieces:

- **Controller**: The central coordination point. It manages configuration, identity, authentication, and authorization
  for the entire network. Every connection is validated by the controller.
  See the [controller deployment guide](@openziti2x/how-to-guides/deployments/linux/controller/deploy).
- **Routers**: Form the mesh fabric that relays traffic between endpoints. Routers continuously monitor latency and
  select the fastest path, with automatic failover.
  See the [router deployment guide](@openziti2x/how-to-guides/deployments/linux/router/deploy).
- **Edge clients**: Connect endpoints to the network. Use an [SDK](@openzitidocs/reference/developer/sdk) to embed
  zero trust directly into your application, or use a [tunneler](@openziti2x/how-to-guides/tunnelers) to add zero
  trust to existing apps without code changes.
- **BrowZer** (optional): Bootstraps zero trust in a standard web browser — no browser extension or client install
  needed. See the [BrowZer quickstart](@openziti2x/how-to-guides/browzer).

Three logical constructs govern access once the network is running:

- **Services**: The resources identities connect to. See [Services](@openzitidocs/learn/core-concepts/services/overview).
- **Identities**: Authenticated endpoints — every connection in an OpenZiti network is mutually authenticated.
  See [Identities](@openzitidocs/learn/core-concepts/identities/overview).
- **Policies**: Govern which identities can access which services via which edge routers.
  See [Policies](@openzitidocs/learn/core-concepts/security/authorization/policies/overview).

## Key concepts

- **Zero trust / application segmentation**: OpenZiti doesn't just gate access to a network — it enforces access to
  individual applications within it. Every identity requires a certificate, and access can be revoked at any time,
  closing existing connections immediately.
- **Dark services and routers**: Services and routers can be made "dark" — no open listening ports, no public
  exposure. They reach out to the fabric rather than accepting inbound connections, so nothing in your private network
  needs to receive inbound traffic.
- **End-to-end encryption**: Every connection is encrypted from endpoint to endpoint using public-private-key
  cryptography via [libsodium](https://doc.libsodium.org/), regardless of whether the underlying service encrypts its
  own traffic. All traffic is synthesized to port 443 and metadata is encrypted in transit, so attackers can't
  determine what services are in use or infer source and destination. See
  [connection security](@openzitidocs/learn/core-concepts/security/connection-security).

Ready to deploy your first network? Follow one of the [quickstart guides](@openziti2x/intro/get-started).

## NetFoundry Cloud

NetFoundry sponsors the OpenZiti project and offers a hosted version of the OpenZiti platform, great for teams that
don't want to host their own. It's free to get started and has an in-place upgrade to a paid enterprise option.

[Get started with the NetFoundry Cloud](https://netfoundry.io/products/netfoundry-platform/netfoundry-cloud-for-openziti/)
