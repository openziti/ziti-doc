---
title: "The Road Ahead for zrok"
date: 2023-02-22T17:55:42Z
cuid: clefz7tjy000409l2fd68ako3
slug: the-road-ahead-for-zrok
authors: [MichaelQuigley]
image: /docs/blogs/openzitiv1676487591508/4549ff85-029e-442a-bcbc-94db870e9d63.jpeg
tags: 
  - networking
  - roadmap
  - openziti
  - zerotrust
  - zrok

---

> If you're not sure what `zrok` is, see our blog post [introducing `zrok`](https://blog.openziti.io/introducing-zrok).

Now that `v0.3` has been released the `zrok` team is spending time collecting feedback and building our roadmap for what's coming next in `v0.4`.

As always, our [project board](https://github.com/orgs/openziti/projects/16) on [Github](https://github.com/openziti/zrok) is always up to date with the latest low-level roadmap details. Don't forget to see the tabs at the top of the board for specific views filtering on each major release.

Here's a high-level preview of some of the things that we're working on for `zrok v0.4`.

## TCP and UDP Tunneling

In `v0.4`, you're going to be able to create low-level network tunnels like this:

```plaintext
$ zrok share private --backend-mode tunnel udp:127.0.0.1:53
```

A corresponding `zrok access private` command will allow a remote user to access your shared UDP endpoint locally on their system.

This will also work for TCP.

The new tunnel backend mode will allow you to quickly and easily share tunnels for all manner of low-level TCP and UDP protocols, including things like SSH, RDP, VNC, and various gaming and sharing protocols, etc.

## zrok "Drives"

In `v0.4`, `zrok` will include "drive" functionality, allowing users to create private virtual drives exposed as `zrok` shares. The `zrok` tooling will include powerful CLI utilities to make reading and writing these decentralized, peer-to-peer drives very frictionless and intuitive right from your shell environment.

Image a command like:

```plaintext
$ zrok share private --backend-mode drive ${HOME}/Documents
```

And then using commands like:

```plaintext
$ zrok send a_big_archive.zip 3exk5stntix9
copied 1 file for 833477 bytes to '3exk5stntix9'
```

Or:

```plaintext
$ zrok mount 3exk5stntix9
3exk5stntix9::> ls
-rwxr-xr-x 1 michael michael   2353 Jan 31 11:50 zrok_deployment.drawio
-rwxrwxr-x 1 michael michael  64358 Jan 31 11:51 zrok_deployment.png
-rwxrwxr-x 1 michael michael  21116 Jan 30 14:26 zrok_docs_share.png
3exk5stntix9::> get zrok_deployment.png
received 64358 bytes to 'zrok_deployment.png'
3exk5stntix9::> put my_file.png
sent 128834 bytes to 'my_file.png'
```

Or even:

```plaintext
$ zrok recv 3exk5stntix9
copied 5 files for 12187888 bytes to '/home/michael/3exk5stntix9'
```

Like all of the other types of shares supported by `zrok`, drives will be peer-to-peer and decentralized. We intend to include support for both public and private drive shares.

Got massive storage space? Implement your own replacement for one of the large, centralized cloud storage solutions!

## Streamlined Invite Process

There's been occasional confusion around how invite tokens work in `v0.3`. We're going to spend some cycles working on streamlining and improving the invitation and registration process for `v0.4`.

## Web Console Improvements

The web console will be getting another round of refinements for `v0.4`. The explorer interface will be receiving a round of usability improvements and will incorporate all of the additional details about shares, environments, reservations, and usage that are not present in `v0.3`.

### Change Password, Revoke Secret

There is no specific function for changing an account password in `v0.3`. The current workaround is to use the `Forgot Password?` link in the web console. `v0.4` will introduce a password change function directly in the web console.

And if you've ever accidentally let your secret token escape... you'll be able to revoke and generate a new one in `v0.4`.

## Vanity Share Tokens

We're considering introducing the ability to request a specific token when creating reserved shares for `v0.4`. Something along the lines of:

```plaintext
$ zrok reserve private --backend-mode web . --named myBigShare
```

Other users will be able to access your share using:

```plaintext
$ zrok access private myBigShare
```

## TLS for Controller and Frontends

In `v0.4` you'll be able to configure HTTPS listeners for both the controller and any `zrok access` frontends. This will make spinning up HTTPS-enabled `zrok` components simpler, eliminating the need for nginx in a lot of deployment scenarios.

## TUI and CLI Refinements

`v0.4` will see several improvements to the TUI and the CLI, including:

### Refined Reserved Sharing Workflow

We're considering some refinements to the `zrok reserve`/`zrok share reserved` workflow, possibly reducing the number of commands involved.

We're also looking at allowing you to change the reservation status of an existing public or private share to a reserved share through the TUI. Shared something ephemerally and then decided you want to keep it around as a reserved share? This new TUI change we're considering would allow you to do that easily.

### Additional `zrok config` Options

Currently, `zrok config` is only used to set the `apiEndpoint` address (to configure your service instance). In `v0.4`, we'll be introducing new `zrok config` options that allow you to control various behaviors of the operation of the TUI and CLI. Want to configure headless mode by default? Want the URL parser to use HTTPS by default? Options like that will be configurable through `zrok config`.

`zrok config` was intended to be conceptually similar to `git config --global`.

### Single-command Multi-share

Want to launch multiple shares through a single command? We're working on that for `v0.4`.

### XDG Base Directory Specification

`zrok` currently uses `${HOME}/.zrok` to store secrets and configuration. We're considering adjusting this to be compatible with the XDG Base Directory Specification for `v0.4`:

https://specifications.freedesktop.org/basedir-spec/latest/

## Improved Metrics

`zrok` `v0.3` has a minimal, proof-of-concept metrics implementation that is primarily used to draw sparkline graphs for activity against public shares. Metrics in `v0.3` are generated by the frontend and delivered to the controller.

`v0.4` will see significant improvements to its metrics infrastructure to support new and refined capabilities, including:

### OpenZiti Metrics

All of the metrics in `v0.4` will be coming directly from the underlying OpenZiti overlay network.

### Bandwidth-based Limits

`v0.3` has support for simple resource-based limits. A limit on the number of environments and shares can be configured per instance. This was the absolute minimum we felt we needed to support to allow external users to start working with our shared `zrok.io` instance.

`v0.4` will incorporate bandwidth-based limits. This will allow a service instance to limit the amount of traffic per account, environment, and share. We feel this is necessary for us to open up access to `zrok.io` to a larger pool of users.

### Sparklines Everywhere

`v0.3` only has working sparkline graphs for public shares. With the new metrics subsystem based on OpenZiti metrics, we'll be able to provide much deeper analytics for all kinds of shares, and we'll also be able to potentially incorporate traffic data into the web console's explorer view.

## Back-porting to v0.3

As much as possible we'll attempt to try to back-port the most pressing features from the `v0.4` development stream back into `v0.3`. We expect to get capabilities like secret token revocation incorporated in `v0.3` very quickly. We'll be monitoring many of the other improvements so that we can get them into your hands as quickly as possible.

## Forward to v0.5

Things get a little hazier the further out into the future we get, but the general idea for `v0.5` will be to focus on the non-technical end-user experience. The plan is to ship a desktop client for `zrok` that quietly sits in your toolbar or tray, and is available for rapid sharing and access from one or more `zrok` service instances.

We'll continue to refine and improve our shell-based experience, but the goal will be to expand the usefulness of `zrok` for a wider group of users looking for integration with their desktop experience.
