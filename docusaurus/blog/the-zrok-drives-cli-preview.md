---
title: "The zrok Drives CLI Preview"
date: 2024-01-25T20:08:29Z
cuid: clrtncncs000809lg42ombo9g
slug: the-zrok-drives-cli-preview
authors: [MichaelQuigley]
image: "@site/blogs/openziti/v1706115688489/7aef0bb7-51e7-45e2-bc95-f65ec3149116.png"
imageDark: "@site/blogs/openziti/v1706115688489/7aef0bb7-51e7-45e2-bc95-f65ec3149116.png"
tags: 
  - security
  - networking
  - storage
  - peer-to-peer
  - zrok

---

With the release of `v0.4.23`, zrok now includes a set of CLI commands that simplifies the management of zrok virtual 
drives. This is an early preview of the full set of zrok Drives tools.

<!-- truncate -->

If this is your first time enountering zrok, check out the [entire zrok series](./tags/zrok) here on the [OpenZiti blog](./). Also take a look at the [Getting Started guide](https://docs.zrok.io/docs/getting-started).

## zrok Drives

Back in November, we rolled out an early preview of the new zrok `drive` backend, which introduced our first preview of secure, simple, peer-to-peer virtual network drives functionality.

The short version of the story is that the zrok drives feature introduces the ability to turn any folder on any computer, anywhere on the network, into a secure virtual network drive. The current implementation is based on WebDAV, but we've got additional implementations in the pipeline, including an S3-compatible interface.

The first preview of zrok drives allowed a zrok drives share to be accessed by any software or system that can work with WebDAV. This includes Windows Explorer, macOS Finder, and various Linux graphical desktops including Gnome Nautilus.

Check out the previous [blog post](./zrok-drives-an-early-preview) for more details about [zrok Drives](./zrok-drives-an-early-preview).

## The New CLI

The new CLI tools released with `v0.4.23` include a set of commands that should be familiar to most Linux shell users.. `zrok cp`, `zrok ls`, `zrok rm`, and `zrok mkdir`. These commands let you copy files to, from and between virtual network drives.

These commands allow you to work with any combination of:

* the local filesystem
    
* non-zrok WebDAV implementations
    
* zrok public drives
    
* zrok private drives
    

The current implementation is a preview and likely contains bugs. Getting the ergonomics and semantics to work perfectly, consistently across all of the types of storage that are supported is tricky. We'll get it right in time. So, if you run into something, file an issue at the [zrok GitHub repository](https://github.com/openziti/zrok).

Let's take a look at what kinds of things these tools can do.

First we create a virtual drive like this:

```plaintext
$ mkdir /tmp/junk
$ zrok share private --headless --backend-mode drive /tmp/junk
[   0.124]    INFO sdk-golang/ziti.(*listenerManager).createSessionWithBackoff: {session token=[cf640aac-2706-49ae-9cc9-9a497d67d9c5]} new service session
[   0.145]    INFO main.(*sharePrivateCommand).run: allow other to access your share with the following command:
zrok access private wkcfb58vj51l
```

You can use the new CLI commands to easily copy files to and from zrok drives like this:

```plaintext
$ zrok copy LICENSE zrok://wkcfb58vj51l
[   0.119]    INFO zrok/drives/sync.OneWay: => /LICENSE
copy complete!

$ zrok ls zrok://wkcfb58vj51l
┌──────┬─────────┬─────────┬───────────────────────────────┐
│ TYPE │ NAME    │ SIZE    │ MODIFIED                      │
├──────┼─────────┼─────────┼───────────────────────────────┤
│      │ LICENSE │ 11.3 kB │ 2024-01-19 12:16:46 -0500 EST │
└──────┴─────────┴─────────┴───────────────────────────────┘

$ zrok mkdir zrok://wkcfb58vj51l/stuff
$ zrok ls zrok://wkcfb58vj51l
┌──────┬─────────┬─────────┬───────────────────────────────┐
│ TYPE │ NAME    │ SIZE    │ MODIFIED                      │
├──────┼─────────┼─────────┼───────────────────────────────┤
│      │ LICENSE │ 11.3 kB │ 2024-01-19 12:16:46 -0500 EST │
│ DIR  │ stuff   │         │                               │
└──────┴─────────┴─────────┴───────────────────────────────┘
```

Copying to and from zrok drives and manipulating files and folders is very similar to the usual shell commands that most technical computer users are already familiar with.

The new CLI also supports a convenient one-way synchronization tool that is useful for ensuring that entire file trees are synchronized:

```plaintext
$ ls -l util/
total 20
-rw-rw-r-- 1 michael michael 329 Jul 21 13:17 email.go
-rw-rw-r-- 1 michael michael 456 Jul 21 13:17 headers.go
-rw-rw-r-- 1 michael michael 609 Jul 21 13:17 proxy.go
-rw-rw-r-- 1 michael michael 361 Jul 21 13:17 size.go
-rw-rw-r-- 1 michael michael 423 Jan  2 11:57 uniqueName.go

$ zrok copy util/ zrok://wkcfb58vj51l/stuff
[   0.123]    INFO zrok/drives/sync.OneWay: => /email.go
[   0.194]    INFO zrok/drives/sync.OneWay: => /headers.go
[   0.267]    INFO zrok/drives/sync.OneWay: => /proxy.go
[   0.337]    INFO zrok/drives/sync.OneWay: => /size.go
[   0.408]    INFO zrok/drives/sync.OneWay: => /uniqueName.go
copy complete!

$ zrok ls zrok://wkcfb58vj51l/stuff
┌──────┬───────────────┬───────┬───────────────────────────────┐
│ TYPE │ NAME          │ SIZE  │ MODIFIED                      │
├──────┼───────────────┼───────┼───────────────────────────────┤
│      │ email.go      │ 329 B │ 2024-01-19 12:26:45 -0500 EST │
│      │ headers.go    │ 456 B │ 2024-01-19 12:26:45 -0500 EST │
│      │ proxy.go      │ 609 B │ 2024-01-19 12:26:45 -0500 EST │
│      │ size.go       │ 361 B │ 2024-01-19 12:26:45 -0500 EST │
│      │ uniqueName.go │ 423 B │ 2024-01-19 12:26:45 -0500 EST │
└──────┴───────────────┴───────┴───────────────────────────────┘

$ zrok copy util/ zrok://wkcfb58vj51l/stuff --sync
copy complete!
```

I recently put out an office hours video showing these tools in action:

%[https://www.youtube.com/watch?v=4Moyt2IWpCk] 

We also get into a little bit of golang code in the process. It's a fairly short watch at 20 minutes.

[A detailed guide](https://docs.zrok.io/docs/guides/drives/cli/) for these commands is available at the [zrok documentation site](https://docs.zrok.io/).

If you're a fan of zrok and you find these features useful, we always appreciate a star on the [zrok repository on GitHub](https://github.com/openziti/zrok)!
