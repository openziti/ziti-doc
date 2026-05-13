# Get started with OpenZiti

Learn how to set up your own open-source zero-trust network overlay and start securing your applications, whether
you're working with existing software or building something new.

OpenZiti works with your applications at whatever level makes sense. Use lightweight
[tunnelers](/how-to-guides/tunnelers/index.mdx) to add zero trust to existing applications with no code changes, or
embed our [SDKs](/reference/developer/sdk/index.mdx) directly for the strongest security posture. Either way, your
services stay dark: no open ports, no public endpoints, no exposure to unauthorized users.

:::info
Quickstarts are short-lived networks that are great for learning how to use OpenZiti. For long-lived production
deployments, see the [deployment guides](@openzitidocs/category/deployments).
:::

:::tip
If you get stuck on anything, the Discourse link is in the top-right corner of every page. Don't be afraid to ask
the community for help!
:::

## Getting started — network

The first thing you need is a network. For someone just getting started, there are four basic options:

### Run all the binaries locally

Start and stop components on your own. This is great for learning but since it's all local, keeping any services you
define actually separate from your local machine is a bit hard.

### Run locally using [Docker](https://www.docker.com)

This allows you to do more complex things like actually isolate services from yourself.

### Run on your own server

If you have a server available on the internet, you can deploy an overlay network on it and share access with others
who aren't on your local network.

## Which network option sounds right for you?

- [Run Everything Locally - no Docker](./network/local-no-docker.mdx)
- [Run Everything Locally - using Docker](./network/local-with-docker.mdx)
- [Run Everything Locally - Docker Compose](./network/local-docker-compose.mdx)
- [Run Everything Hosted](./network/hosted.mdx)
