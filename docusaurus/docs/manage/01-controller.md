---
id: controller
title: Controller
---

# Ziti Controller

The Ziti Controller is the process that coordinates a [Ziti Networks](xref:zitiOverview#overview-of-a-ziti-network). It
is responsible for authenticating incoming connections from identities. It also authorizes access to services for any
given identity. The Ziti Controller provides two RESTful APIs for other processes to interact with it. Take a look at
the [API doc page](/api/rest/) for more info.

### Prerequisite - PKI

Public Key Infrastructure (PKI) is a complex topic. See the [pki](pki) page for additional details
about the sort of needs and considerations relevant to the Ziti Controller. You will need a correct PKI setup for Ziti
to work. If you follow one of the [quickstart guides](../quickstarts/network/), a full PKI will be
generated for you. This is probably the best way to start out.

## Sizing Guidelines

The Ziti Controller and Ziti Routers are still in the process of being stress tested. We recommend starting with a small
scale deployment until key performance indicators start to hint that the server requires more resources. A
[Ziti Networks](xref:zitiOverview#overview-of-a-ziti-network) will have two important metrics: CPU and network capacity.
Modest sized networks require minimal investments in infrastructure. Start with small machines and increase as needed.

## Configuration

The Ziti Controller is configured using a [yaml](https://yaml.org/) file. If you follow one of the
[quickstart guides](../quickstarts/network/) a configuration file will be generated. You can also find a
sample config file from the [ziti repo](https://github.com/openziti/ziti/blob/release-next/etc/ctrl.with.edge.yml).

Each section is annotated and should provide you enough information to modify a given setting. Most of the fields are
straight-forward. The pki-related fields are the ones you will need to pay particular attention to. See
the [pki](pki) page for relevant information on pki settings.

## Logging
See [logging](04-cli/03-logging.md) for more details