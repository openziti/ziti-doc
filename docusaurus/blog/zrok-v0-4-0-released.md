---
title: "zrok v0.4.0 Released!"
date: 2023-06-27T18:48:03Z
cuid: cljen4m08000009li4hl1fz7c
slug: zrok-v040-released
authors: [MichaelQuigley]
image: "@site/blogs/openziti/v1687898203990/c35b6581-ab18-4f3d-80b7-8b2bfb7035cc.avif"
tags: 
  - network
  - security
  - networking
  - openziti
  - zrok

---

Today we celebrate the initial release of `zrok` `v0.4.0`. This new release of `zrok` introduces important new 
features and provides a stronger more extensible foundation for future growth.

<!-- truncate -->

If you're just tuning in now and want to learn more about `zrok`, visit the website at https://zrok.io/ for an overview and https://docs.zrok.io/ for details.

`zrok` has been out for a couple of months in a private beta capacity. Since then we've added a handful of important new features and capabilities. Here are some of the more important new features:

## TCP and UDP Tunnels

In addition to HTTP-based resources, `zrok` now allows users to share local TCP and UDP tunnels.

The TCP and UDP tunnels work very similarly. Here's how you can use the `tcpTunnel` backend in `v0.4.0`:

![`zrok share` command for creating a TCP tunnel.](/blogs/openziti/v1687806922797/0e19e031-b673-4ec3-b416-9703af9c7713.png)

We'll use the `tcpTunnel` backend mode with our `private` share. The target is the `<host>:<port>` destination for the tunnel.

![](/blogs/openziti/v1687886605811/9280f0cf-496d-45b3-b454-eb44fd53fff4.png)

Running that launches our `zrok share` client, and gives us the *share token* and the full command to give to remote users to access our TCP tunnel.

![](/blogs/openziti/v1687886726762/268bc129-df9c-4d55-a635-69d43536396e.png)

Our remote user runs the `zrok access private f4ke09rk2vat` command to access the tunnel, creating a local listener on their system at `127.0.0.1:9191`, which allows them to access our remote TCP resource.

![Using netcat locally to access the tunneled SSH server endpoint.](/blogs/openziti/v1687807081992/cdf0073e-e1c0-4caf-82ce-a6acb19002c4.png)

The remote user can use regular networking tools like `netcat` to access the tunnel locally on their system. In this case, we see the announcement from the SSH listener on the other end of the tunnel.

## Refreshed Web Console

`zrok` `v0.4.0` includes significant updates to the web console.

The updates include:

* a new side-by-side layout with an updated look and feel
    
* new more comprehensive activity indicators, which show both receive and transmission detail, including environment-level activity
    
* an updated network visualizer, which now includes `zrok access` details and shows relationships between `zrok share private` and `zrok access` bridges owned by the same account
    
* new metrics visualizations show historical telemetry for the last 30 days, 7 days, and 24 hours; telemetry is available at the account, environment, and share levels
    

![The `zrok` `v0.4.0` web console, showing the new access endpoints and the private links between share and access.](/blogs/openziti/v1687802216025/c81239e3-d488-4caf-882d-af88c523dea5.png)

In the screenshot above, a dashed green line shows a connection between a `zrok share private` and a `zrok access`.

![](/blogs/openziti/v1687886867051/c6b3dc7d-efff-467f-a127-59d45ed007ae.png)

`v0.4.0` includes refreshed metrics views. These capabilities will continue to grow as `zrok` matures.

## New Metrics and Limits Infrastructure

The metrics infrastructure has been completely revamped for `v0.4.0`. Metrics information now comes directly from the underlying OpenZiti network. Metrics details are now available for all share types and privacy modes.

Metrics processing is scalable to work for the smallest self-hosting environments, all the way up to massive multi-user installations. Small installations can use a single `zrok` controller to receive metrics from OpenZiti directly. Large installations can use horizontally scalable message queuing over AMQP to distribute the metrics workload across a cluster of `zrok` controller instances.

`v0.4.0` also includes a new *limits* facility providing configurable transfer quotas. If you're running your own self-hosted `zrok` service instance, you can configure quotas for transmit and receive volume at the account, environment, and share levels.

## Updated Documentation

The [docs.zrok.io](https://docs.zrok.io/) website has been refreshed with expanded and revised concept guides and details about the new sharing modes.

Future `v0.4.x` releases will continue to expand to include documentation for the growing `zrok` web console.

## Ready for use!

The official `v0.4.0` release is available on GitHub at [https://github.com/openziti/zrok/releases/tag/v0.4.0](https://github.com/openziti/zrok/releases/tag/v0.4.0).

The production service instance at zrok.io will be updated to `v0.4.0` on Wednesday, June 28th. If you use our hosted instance, be sure to update your local `zrok` client to the latest release. If you're running an out-of-date `zrok` client, you will receive an error message like this when you try to access a newer service instance:

```plaintext
[ERROR]: unable to create zrok client (expected a 'v0.3' version, received: 'v0.4.0-rc9 [ebfb039]')
```

You can replace your current `zrok` binary with a newer version and continue to use your existing `zrok` account, environments, and shares.

In addition to the usual Github releases and docker images, `zrok` `v0.4.0` is now available through Homebrew:

```plaintext
% brew install zrok
...
% zrok version
               _    
 _____ __ ___ | | __
|_  / '__/ _ \| |/ /
 / /| | | (_) |   < 
/___|_|  \___/|_|\_\

0.4.0 [brew]
```

## Private Beta

We intend to continue offering `zrok` hosting through zrok.io as a private beta for a short while. After a few weeks, we'll be opening zrok.io up to the public.

In the meantime, if you'd like to request an invitation to the private beta you can reach out to invite@zrok.io.

## What's Next?

We've got some additional exciting developments in the wings that we'll be revealing soon. The `zrok` "drives" capability is continuing to evolve, and we're also sketching out new facilities that will allow you to extend `zrok` with your own custom applications and integrations. The `proxy` backend modes are growing to include advanced capabilities for load-balancing and intelligent service routing.

Stay tuned!
