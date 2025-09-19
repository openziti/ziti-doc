---
title: "zrok Unleashed: Top 10 Uses Explored"
seoTitle: "Top 10 Uses of zrok"
seoDescription: "Top 10 Uses of zrok as a service explored"
date: 2025-03-05T14:23:33Z
cuid: cm7w0d1v100020al7041bczp2
slug: zrok-unleashed-top-10-uses-explored
authors: [MikeGuthrie]
image: /blogs/openziti/v1741184699506/3d770cf5-535b-4f7d-8bc7-9ebbba03ebcd.png
ogimage: /blogs/openziti/v1741182634716/ac0a43f9-bcaa-492b-abde-5bb558a07181.png
tags: 
  - zrok

---

As we roll into 2025, we’re entering into an exciting time for the world of zrok. We’ve just recently 
added [support for custom domains](./zrok-custom-domains.md), and with the 1.0 release right 
around the corner, zrok is more powerful than it has ever been. We thought this was a good time to zoom out and 
take a look at how users are actually using our [hosted zrok as a service](https://myzrok.io).

<!-- truncate -->

As part of the larger open source [OpenZiti project](https://github.com/openziti/zrok/), zrok uses an [OpenZiti overlay network](https://openziti.io/docs/learn/introduction/) for any secure communications. When you start an instance of zrok, zrok will create a secure zero trust connection to the OpenZiti overlay. This connection is also how zrok can provide truly end-to-end encrypted tunnels with the `--tcpTunnel` [backend mode](https://docs.zrok.io/docs/getting-started#share-backend-modes). Given its nature, it’s difficult to know what services zrok is providing, but we were able to run some statistics based on the terminating port and make some inferences on whether or not the port was exposed as a public or private share. Here’s the list that we came up with. I found some of these use cases particularly cool, and I discovered some use cases in the process I’d never actually thought of. We’re hoping this post gives you some fresh eyes with zrok and you discover some new possibilities for how powerful it can be for resource sharing!

## #1. Local Development Servers

*Ports: 80,8000,8080,3000,3001,5173*

No surprise here! This is probably the original use case that zrok was built around, and zrok just makes it so easy to share your local environment and alleviates the need to stand up an entire shared environment just to be able to show off a local demo, collaborate on a pre-release, or share resources in a distributed developer environment. Whether you’re running apache, nginx, nodejs, or Vite, zrok allows you to easily share any of these technologies.

`zrok share public 8080`

## #2. Minecraft Servers

*Port: 25565*

Still one of the best games of all time, and considering how easy it is to run your own server and add custom mods, zrok provides an easy way to share a private game server with your friends without having to open up your firewall ports to the world.

See [this tutorial](./minecraft-over-zrok) for full details on how to run your minecraft server over zrok!

## #3. AWS Sagemaker Notebooks

*Port: 7860*

About a year ago we had a huge amount of buzz from the community that outlined how to integrate zrok with [AWS Sagemaker](https://aws.amazon.com/sagemaker/) notebooks. [Pogs Cafe](https://www.youtube.com/@pogscafe) put together some great video content that shows zrok integrated with their launcher for ephemeral AI image generation. [See zrok in action here](https://youtu.be/Tl5eHI_AMmw?si=c9JEfWi0T-Gord2s&t=56), or check out their [blog post](https://www.pogs.cafe/software/tunneling-sagemaker-kaggle).

## #4. BlueBubbles

*Port: 1234*

BlueBubbles is a free, open-source app ecosystem that allows users to send and receive iMessages on non-Apple devices. [BlueBubbles leverages zrok](https://newreleases.io/project/github/BlueBubblesApp/bluebubbles-server/release/v1.9.6) as one of its built-in proxy services so that you can run BlueBubbles server without the need for port-forwarding.

## #5. IRC - Internet Relay Chat

*Port: 6666*

The original chat server, has been alive since 1988. zrok provides a way for you to easily put modern security around your chat server with end-to-end encryption, and private access tokens with the use of [private TCP shares](https://docs.zrok.io/docs/concepts/tunnels/).

## #6. SSH

*Port: 22*

Who needs a Bastion anyway? That’s so 2010! Just leave 22 closed to the world and put a zrok private TCP share on the host and call it a day. No open ports. Simply fire up a [zrok share as a systemd service](https://docs.zrok.io/docs/guides/linux-user-share/)

## #7 - Jupyter Notebooks / AI Notebooks

*Port: 8188*

This one was a little bit ambiguous because there are multiple AI Notebook tools that all rely on this same default port. We know that [Jupyter Notebooks](https://jupyter.org/) is one of the biggest uses in this bucket, and some cloud providers like Google Cloud AI and Hauwei Cloud AI also make use of these tools.

## #8. Squid Proxy

*Port: 3128*

[Squid proxy](https://www.squid-cache.org/) is an easy-to-use caching and proxy server that can be used to give greater control over outbound traffic whether you’re testing compatibility with a corporate proxy for your application, or you need funnel traffic through a remote server’s address, zrok gives you an easy way to set this up. Just create a share that terminates on your proxy service and set your HTTP\_PROXY/HTTPS\_PROXY variables in your environment, and all http-based traffic will now filter through your zrok proxy.

## #9. FoundryVTT

*Port: 30000*

Probably my personal favorite use case for zrok. [FoundryVTT is a virtual table top game server](https://foundryvtt.com/), and zrok provides a fantastic way to host a virtual game night from your own PC while still protecting your home network. Check out this [YouTube tutorial here!](https://www.youtube.com/watch?v=x-3PODwEdDM)

## #10. NoMachine Remote Desktop

*Port 4000*

Remote desktop is incredibly handy, but it’s also something you would never want to expose as an open port on the internet. [NoMachine is a free multi-platform remote desktop tool](https://www.nomachine.com/). With the use of [private TCP shares](https://docs.zrok.io/docs/concepts/tunnels/), zrok enables you to maintain secure remote access from anywhere without ever exposing a port to the internet.

## #??? - You Tell Us!!

*Port: ???*

Got a killer idea for zrok that we missed? Post it in the comments! We always love to hear new use cases for how people are using zrok so that we can make this technology better. And if you haven’t already, help us spread the word about zrok by [giving us a star on github!](https://github.com/openziti/zrok)
