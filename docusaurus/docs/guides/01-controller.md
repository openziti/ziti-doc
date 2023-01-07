---
id: controller
title: Controller Deployment
sidebar_label: Controller
---

import CliLogFormats from '../_cli-log-levels-and-formats.md'

This article provides some guidance for deploying a Ziti Controller. You can go back and read [the controller component introduction](../learn/introduction/index.mdx#openziti-controller) if needed.

## Public Key Infrastructure

You will need a PKI setup for Ziti. If you follow one of the [quickstart guides](/docs/learn/quickstarts/network/) then a PKI will be generated for you. This is probably the best way to start out. Pay particular attention to the PKI-related fields in the configuration file, and check out [the pki page](./pki).

## Configuration

The Ziti Controller's configuration is loaded from a YAML file. If you follow one of the [quickstart guides](/docs/learn/quickstarts/network/) a configuration file will be generated. You can generate a configuration with the `ziti create config controller` command, optionally mutating the result through command-line options or environment variables. You can also find an annotated sample config file from [the Ziti repo](https://github.com/openziti/ziti/blob/main/etc/ctrl.with.edge.yml).

## Firewall

The controller listens on several configurable server ports that must be exposed.

- `1280/tcp`: client sessions and management API
- `6262/tcp`: router control plane

You may configure the controller to expose management functions on separate port if you wish to limit network access for password authenticators.

## Logging

<CliLogFormats/>