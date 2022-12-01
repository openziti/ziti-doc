---
id: controller
title: Controller Deployment
sidebar_label: Controller
---

The Ziti Controller is responsible for authenticating incoming connections from identities and authorizing their access to services. The Ziti Controller provides two RESTful APIs: client and management. Take a look at the [API doc page](/api/rest/) for more info.

## Public Key Infrastructure

You will need a PKI setup for Ziti. If you follow one of the [quickstart guides](../quickstarts/network/) then a PKI will be generated for you. This is probably the best way to start out. Pay particular attention to the PKI-related fields in the configuration file, and check out [the pki page](./pki).

## Configuration

The Ziti Controller's configuration is loaded from a YAML file. If you follow one of the [quickstart guides](../quickstarts/network/) a configuration file will be generated. You can generate a configuration with the `ziti create config controller` command, optionally mutating the result through command-line options or environment variables. You can also find an annotated sample config file from [the Ziti repo](https://github.com/openziti/ziti/blob/main/etc/ctrl.with.edge.yml).

## Logging

See [logging](./04-cli-basics.md#logging) for more details

<!-- TODO: host sizing guidance -->
