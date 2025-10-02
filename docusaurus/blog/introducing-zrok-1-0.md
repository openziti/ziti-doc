---
title: "Introducing zrok 1.0"
date: 2025-04-09T19:48:24Z
cuid: cm9acdmkq000e08jr6pyc0zj7
slug: introducing-zrok-10
authors: [MichaelQuigley]
image: "@site/blogs/openziti/v1744209956458/656a2fe0-41e5-4628-bd06-a9b3267df001.png"
imageDark: "@site/blogs/openziti/v1744209956458/656a2fe0-41e5-4628-bd06-a9b3267df001.png"
tags: 
  - software-development
  - tools
  - security
  - developer
  - announcement

---

## What does version 1.0 mean?

It’s always a big deal when a project releases “version 1.0”. Our version 1.0 release validates all of the good things 
about zrok while improving a few areas that needed it, and also brings several exciting new features.

<!-- truncate -->

The initial release of 1.0 includes major new features like:

* A new polished API console (web interface)
    
* A new “zrok Agent” designed to streamline the management of your zrok resources and provide a web interface making zrok accessible to users who aren’t command-line natives
    
* The “zrok Canary” a new suite of tests designed to focus on both performance and reliability for production zrok environment
    

We’re going to take a look at these highlights of zrok 1.0 in this blog post. For those of you who prefer videos, I recently did a zrok Office Hours covering this same information:

%[https://www.youtube.com/watch?v=cIqkbnv-xAQ] 

# History

I keep a detailed journal of my work. I like to save screenshots documenting interesting points in the development of the projects that I work on. Sometimes it’s fun to go back and look at them. Here’s a little look into zrok screenshots over the years.

First, starting in 2022, here is a `v0.2` screenshot. `v0.2` predates [zrok.io](https://zrok.io/) and the hosted service. This is the very first version of zrok that had a “console” and integrated metrics:

![](/blogs/openziti/v1744133087807/9da95d37-6436-49c6-967a-21f74f292e92.png)

`v0.2` also predates `private` sharing in zrok. This was just a proof-of-concept exercise to see what a secure public reverse proxy solution on top of OpenZiti might look like.

Then we developed `v0.3`, which added private sharing and introduced the concept of a “backend mode”:

![](/blogs/openziti/v1744133265428/52aa2f76-017c-4336-8a54-b1775041c49b.gif)

The “visualizer” concept was first introduced in `v0.3`. This version of the visualizer is similar to what we ended up with in `v0.4`.

The main goal of the `v0.4` series was to develop zrok into a platform that could support a zrok as a service ([zrok.io](https://zrok.io/)). A lot of refinement and polish went into making `v0.4` usable and useful for a wider range of users:

![](/blogs/openziti/v1744133390425/30237eb1-fa20-483c-86e9-25b1be9a8b68.png)

Every time there is a major refresh of the zrok user interface, I feel like the new version feels like a substantial leap forward.

This brings us to the first major feature of zrok `v1.0`, which is the updated API console.

# The New API Console

The new zrok API console (the primary “web interface”) has received a major refresh for `v1.0`. In addition to new branding, the technology under the covers has been streamlined as well. Here are some screenshots so you can get the vibes:

![](/blogs/openziti/v1744134630638/d2d3ba1c-f4e7-4f93-b094-1e9c013c7052.png)

These things are subjective, but I very much look at this new user interface and feel the same way about it that I’ve felt about previous iterations… it looks like a substantial improvement in polish and usability versus the previous version.

Under the covers the API console has been re-developed in Typescript using Vite. It’s still a React application, but the stack has been radically cleaned up and simplified. This new stack will give us a solid platform to extend and build on going forward.

The new API console retains the same visual approach to navigating your zrok resources as the previous release… but in addition, the new API console provides a “tabular” mode to easily filter and sort the contents of your account:

![](/blogs/openziti/v1744134838383/6ac1f878-3e82-4fef-b862-c6ca674c14ce.png)

When sorted by activity, the tabular mode operates kind of like a “top” command for your zrok account.

For users with large, active accounts, the sorting and filtering features can help you to zero in on the specific resources you’re looking for. The selection state is maintained between the visualizer and tabular modes, allowing you to search and then quickly visualize.

The forms and dialogs have also received a lot of attention and polish:

![](/blogs/openziti/v1744134927112/36f17c1f-ebc7-4d88-8537-7d5dcc6d7eca.png)

We’re excited about the new streamlined look-and-feel, too.

# zrok Agent

If you’re a zrok power user who has ever used more than a single `zrok share` or `zrok access`, you’ve surely run into the issue where you’ve needed to manage a number of zrok processes. Some of them might go in `systemd`. Some of them might sit in terminal windows. You might even `nohup` some of them into the background.

zrok v1.0 introduces a new “zrok Agent” to make this situation much simpler. The Agent is a kind of intelligent “process manager” for all of your zrok shares and accesses. It’s designed to work well for both end-user environments (for developers and end-users) and also for headless production environments.

When you’re not running the zrok Agent, the v1.0 command-line works the way it always has… If you run a `zrok share`, you’ll end up with a single process for that share, like this:

![](/blogs/openziti/v1744135682541/8178eb22-1424-4dfb-8f32-4bea6987dc6b.png)

But when I start the new zrok Agent using the `zrok agent start` command, we get a different operating mode. With the zrok Agent running, if I do a `zrok share`, I get a different result:

![](/blogs/openziti/v1744135820048/21f79d74-b5bd-4cfe-becf-4d1454bcf487.png)

Notice that the `zrok share public` command above returned immediately, displaying the share token and the URL for my new share. When I ran `zrok share public` with the Agent running, the Agent was detected and the process for my new share was managed by the Agent automatically.

With the zrok Agent you’ll have a single process to manage. You can put your `zrok agent start` command into `systemd` using the `zrok-agent` package for Linux. You can `nohup` it. You can just stash it away in a terminal window somewhere. You can run it as a Windows service. But once you’ve managed that single process, your whole zrok experience becomes simpler.

You might also notice the `zrok agent status` command in the terminal above. That command is used to display the shares and accesses being managed by the Agent.

There are additional commands under the `zrok agent` tree for managing shares and accesses:

![](/blogs/openziti/v1744135943261/4141ac00-4a3d-4801-aa52-6d6d0c19b6bf.png)

And the `zrok agent release share` command can direct the agent to release the share.

The zrok Agent also includes a `localhost` web interface, which can be used to create and remove shares from the agent… yes, when you’re running the zrok Agent you can create new shares *without using the command-line* interface!

![](/blogs/openziti/v1744136149257/08b3caad-b8c5-4741-9e95-ec497afd5fff.png)

The zrok “Agent console” is an early preview and a work-in-progress. There are currently a limited subset of share types that can be created through the Agent console, but we expect to elaborate this into a first-class interface over the next handful of releases.

We expect the zrok Agent console to grow into a super useful desktop assistant for managing your local zrok shares and accesses. This will be especially helpful for non-CLI users.

## Remote Agent Administration

We’re not quite there yet, but we’re very excited about one of the features we’re actively developing for the zrok Agent… opt-in “remote administration”. Imagine you have a headless system somewhere with an enabled zrok environment running a zrok Agent. Sure, you could `ssh` into that system to create and manage shares. But what if you could simply enroll your zrok Agent so that it can be managed from the central zrok API console… from anywhere?

This kind of remote administration would allow you to create and release shares and accesses on remote environments through the zrok API console. Need to get into a remote system without direct access? This could be a way to make that very simple. This also allows you to shut down shares and accesses when you’re not using them, increasing security.

Remote administration will be completely opt-in and will be the kind of capability you can enable only when you need it. If you do not enroll your Agent, then that Agent is an island unto itself that you can only access locally. You’ll be in control.

# zrok Canary

We take the reliability and performance of zrok very seriously. So seriously that we’re developing a set of performance and reliability tooling into zrok that we collectively refer to as the “zrok Canary”.

For the initial 1.0 release, we’ve re-worked the old `zrok test loop public` infrastructure into a more polished set of tools underneath `zrok test canary`.

We expect to continue elaborating these tools into a wide suite of monitors and tests to properly validate all of the major operating conditions of a zrok instance. And we expect to be rolling these tools out across [zrok.io](https://zrok.io/) as they’re available to give us deeper and better visibility into how zrok is operating.

# Switching to 1.0

To switch to 1.0, simply obtain a zrok binary at `v1.0.2` or later, and your existing environments will automatically be migrated to the new version, transparently.

# The Medium-term Roadmap

There are a lot of exciting new features and capabilities lined up for the `v1.0.x` release series!

## zrok for OpenZiti Networks

Have an existing OpenZiti network? Want to quickly and easily add zrok capabilities to your OpenZiti network on-demand? We’re taking a good look at how best to add and remove zrok as a capability of an existing OpenZiti network.

## Remote Agent Administration

Enroll your zrok Agent for remote administration through the zrok API console. Un-enroll the instant you’re done. All communications between your zrok Agent and the zrok instance will be handled securely through the OpenZiti overlay.

## A Complete zrok Agent Console

Do everything through the zrok Agent console that you can do through the command-line. Keep this interface on your desktop and never touch the zrok CLI again.

## Reserved Namespace Improvements

Everyone wants the same names for their reserved shares: `staging`, `testing`, etc. We’ll be taking a good hard look at how to give users better, more specific namespaces allowing them to use the names that they want to use.

## More zrok Drives; Making Drives More Useful

Magic wormholes. Drive-by upload boxes. Ephemeral downloads. We’ll be looking at ways to build on the proof-of-concept that is the current zrok Drives implementation, making it useful for all kinds of data-in-motion use cases.

## API Console Timeline and Notifications

See how your zrok resources have changed over time. Answer questions like “when exactly did I remove that share?” We’ll also be looking at notifications and working on providing better mechanisms for communicating with users.

## OpenZiti HA Control Plane Integration

OpenZiti has an HA control plane and we’re going to teach zrok how best to take advantage of that. zrok is one of our examples of best practices around “Ziti Native Applications” and we’re going to continue and expand that tradition to include HA.

# Thank you!

Thank you for supporting zrok. We’re really looking forward to seeing where the 1.0 roadmap takes us.

If you like zrok, it’s always very much appreciated if you take a moment to drop a star onto the [zrok repository on GitHub](https://github.com/openziti/zrok). We literally see and appreciate every repository star.

If zrok is an important part of your workflow, maybe you would consider getting a subscription on [zrok.io](https://zrok.io/)? Those subscriptions are an incredibly helpful signal that we’re on the right track.

If there is anything we can do to improve zrok or if you’ve run into anything we can help with, please reach out to us at our [OpenZiti Discourse forum](https://openziti.discourse.group/c/zrok/24). There is a [zrok category](https://openziti.discourse.group/c/zrok/24), and we’re standing by ready to help.
