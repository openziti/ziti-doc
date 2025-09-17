---
title: "Announcing the zrok Public Beta!"
date: 2023-07-25T15:15:12Z
cuid: clkifuqp8000009mmc6jcau1w
slug: announcing-the-zrok-public-beta
authors: [MichaelQuigley]
image: /docs/blogs/openzitiv1690218347002/fb39d742-b2a5-45c8-ab30-f782f588b794.avif
tags: 
  - opensource
  - networking
  - peer-to-peer
  - zerotrust
  - zrok

---

`zrok` is officially in public beta. Feel free to [download the latest release](https://github.com/openziti/zrok/releases/latest) of `zrok` and invite yourself to the public instance using the `zrok invite` command (there is no longer an invite token requirement):

```plaintext
$ zrok invite 

enter and confirm your email address...

> michael.quigley@netfoundry.io 
> michael.quigley@netfoundry.io 


[_Submit_]

invitation sent to 'michael.quigley@netfoundry.io'!
```

After you submit your email, you'll receive an email with a link to complete your registration through the `zrok` web console.

![](/docs/blogs/openziti/v1690217651594/1c8a7251-410a-4134-8b1f-ad2ea28fcacb.png)

After you've logged in through the web console, use the "Enable Your Environment" function in the drop-down menu by clicking on your email address. The Enable Your Environment dialog contains a shortcut to the `zrok enable` command that you'll use to link your shell environment to your `zrok` account.

![](/docs/blogs/openziti/v1690217712774/3bce830b-2848-4466-9e5b-6ab7db442974.png)

Once your shell environment is enabled, you're free to create and access shares. See the [getting started guide](https://docs.zrok.io/docs/getting-started) for more details.

This public beta includes all of the capabilities of `zrok`, including HTTP endpoint sharing, file and website sharing, and the new [TCP and UDP "tunnel" capability](https://docs.zrok.io/docs/concepts/tunnels/) recently introduced in the `v0.4.0` release.

See the previous blog post on the [`v0.4.0` release](https://blog.openziti.io/zrok-v040-released) for more detail.

`zrok` is deeply committed to open source. If you like the `zrok` concept, but don't want to use the service hosted by [NetFoundry](https://netfoundry.io/), you can fully [self-host](https://docs.zrok.io/docs/guides/self-hosting/self_hosting_guide/) `zrok` in your environment.

Learn more about `zrok` at [zrok.io](https://zrok.io/) and the project's [GitHub](https://github.com/openziti/zrok) at:

[https://github.com/openziti/zrok](https://github.com/openziti/zrok)

Feel free to reach out if we can help. And if you like `zrok`, adding a star to the repo always means a lot.

## What's coming next?

We're in the middle of preparing some exciting new functionality!

First up is a set of clean, simple SDKs for powering your own applications and integrations on top of `zrok`. Use our peer-to-peer sharing infrastructure to design and enable clever solutions, secured through the power of the [OpenZiti](https://openziti.io/) network overlay. The `zrok`SDK is designed to make this complicated capability easy to implement and secure.

Next, we'll be rolling out powerful new HTTP resource proxying, including concepts like request routing, load balancing, and other smart features to level up your HTTP resource sharing.

After that we'll be rolling out our `zrok` "drives" feature, which we're hoping will be a serious contender in peer-to-peer filesharing. Want to quickly set up teleporters and wormholes and dropboxes for files? Want to collaboratively share files directly with your colleagues without going through a third party? Want to mount a `zrok` drive as a folder on your desktop? How about managing collections of files and resources for distributed production environments? Those are all things on our roadmap.

And there's lots more where that came from... see the `zrok` [development roadmap](https://github.com/orgs/openziti/projects/16) for more details!
