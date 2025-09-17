---
title: "zrok Drives (an Early Preview)"
date: 2023-11-20T19:22:36Z
cuid: clp7anfg800070al4hqmwf29o
slug: zrok-drives-an-early-preview
authors: [MichaelQuigley]
image: /blogs/openziti/v1700235073954/cdeb4c90-ffed-461e-85f1-51340728e3cd.png
tags: 
  - cloud
  - golang
  - security
  - storage
  - peer-to-peer

---

If you've been following my ["office hours" video series](https://www.youtube.com/watch?v=Edqv7yRmXb0&list=PLMUj_5fklasLuM6XiCNqwAFBuZD1t2lO2), you know that I've been mentioning something called "zrok Drives" for weeks now. With the release of `v0.4.14`, we've got our first look at some of the things that are to come.

> *In case you're not sure what zrok is, take a look at the* [*documentation site*](https://docs.zrok.io/)*. There is also a full playlist of* [*videos on YouTube*](https://www.youtube.com/playlist?list=PLMUj_5fklasLuM6XiCNqwAFBuZD1t2lO2)*.*

## Secure Peer-to-Peer Network Storage

zrok is all about making powerful, secure, peer-to-peer sharing work in a simple way. If you stop and think about it, it's pretty amazing that you can share something onto a zrok instance using a command like `zrok share private`, and then anyone with a network connection can establish *secure* peer-to-peer connectivity from anywhere in the world. zrok is built on top of [OpenZiti](https://openziti.io/), which is what gives its zero trust, peer-to-peer networking super powers.

We do this for network resources... your HTTP endpoints, your TCP and UDP endpoints; the low-level stuff of networking. We also let you share higher-level resources (files, websites, etc.) by building in our own sharing servers; you can use tools like the `web` backend to immediately stand up a fully-fledged secure web server (thanks to our friends over at Caddy).

Now, as of `v0.4.14` we have a new `drive` backend. This is the start of a whole new round of storage sharing capabilities inside zrok. The `drive` backend exposes a folder on a filesystem from anywhere on your private network to public or private users anywhere in the world.

The first storage protocol offered by zrok Drives is powered by WebDAV. We're starting with WebDAV because it can be mounted as a virtual drive from just about any operating system. Windows, macOS, and Linux all allow you to mount WebDAV shares just like any other type of network storage. WebDAV is often used as the foundation for all manner of cloud storage services that you probably already use. You can interact with the files on a WebDAV share with any software on your system, not just through a web browser.

Mount zrok Drives storage directly through things like Windows Explorer, and interact with your files using any Windows applications:

![A Windows Explorer window showing a mounted zrok drive.](/blogs/openziti/v1700503752861/77e81e88-28bb-4ec0-ab65-29592e4666e8.png)

We envision using these new zrok capabilities to augment and replace other complicated storage workflows using our own storage and our own resources. Like other zrok concepts, "Drives" is a primitive that can be used to build really clever and powerful storage sharing solutions.

With `v0.4.14`, we're only rolling out the tip of the zrok Drives iceberg; just the basic `drive` backend, which currently only supports WebDAV. This first release does not contain a whole host of other features we're currently building... single command synchronization, single-command uploads and downloads, super fast drop-boxes, and a large number of other powerful capabilities for working with your storage from literally anywhere, as if there weren't layers and layers of complexity in the middle.

## Also for the Data Center

We're cooking up some interesting new tooling and use cases designed to support production workloads using zrok. It's 2023 and you don't want your application edge exposed directly to the internet... we've got the start of a whole range of new tooling coming together that will make it just as easy to share your data center resources as it is to share things from your personal shell.

Like all of the other zrok facilities, these new "Drives" storage capabilities will integrate into your data center workloads using all of these same new data center tools that we're developing.

![](/blogs/openziti/v1700505083899/64e6a7af-6a14-4e4f-ab4e-af48a8c61791.png)

Coming next year will be an S3 storage model. We envision being able to simultaneously share your storage resources using WebDAV for end users, and S3 for your truly production workloads. Personally, I'm starting to think of zrok Drives like a crazy, next-generation, "anywhere to anywhere" NAS-like system from the future.

Put your application in the cloud and your storage wherever you want it.

## Office Hours Video Featuring zrok Drives

I did an Office Hours video giving a pretty quick tour through the new Drives preview:

%[https://www.youtube.com/watch?v=Edqv7yRmXb0] 

## Try zrok!

Check out the ["getting started" guide](https://docs.zrok.io/docs/getting-started) to get started with zrok in no time. You can be up and sharing in 5 minutes with the free zrok instance at [zrok.io](https://zrok.io/).

If you decide you'd like to self-host zrok, we've got a [convenient guide for that](https://docs.zrok.io/docs/category/self-hosting/) as well.

And if you like what we're build, we'd always appreciate a star on the [zrok GitHub repo](https://github.com/openziti/zrok).
