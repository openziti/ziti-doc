---
title: "It's A Zitiful Life"
seoTitle: "How to enable Secure Remote Access to Plex Server via OpenZiti BrowZer"
seoDescription: "The easy way to provide secure remote access to your Plex content, without making any changes to your Plex server or making tedious/insecure router changes."
date: 2022-12-19T18:00:42Z
cuid: clbv3rvhf02u6p2nvat895sfh
slug: its-a-zitiful-life
authors: [CurtTudor]
image: /blog/v1671286570889/kpfd19y_F.jpg
tags: 
  - web
  - security
  - self-hosted
  - zerotrust

---

The [Plex Media Server](https://www.plex.tv/your-media/) is awesome because it makes it easy to access all your music, photos or videos, and stream to any device. The server is free to [download](https://www.plex.tv/media-server-downloads/#plex-media-server), self-hosting is easy, and many people run it in their homes. Doing so enables you to own and control your content without the need to upload to a cloud (or pay for it).

Once the Plex media server is running in the home, many people then want to take the next step and share their content with remote friends and family or enable access to their content while they are away from home on a vacation or business trip.

In this article, I discuss that while self-hosting your Plex media server is *easy*, the traditional techniques for providing remote access to it *arenot.* The good news is that there is a modern approach to securely sharing web apps that is worth your attention.

Here I'll introduce you to [BrowZer](https://blog.openziti.io/introducing-openziti-browzer), a novel group of open-source components from the [OpenZiti project](https://github.com/openziti/) that collectively enables you to operate private-to-the-internet web applications like Plex while still easily providing secure access for your authorized internet-based remote users using just a browser. No VPN. No plugins. No installation. No hassle.

## Remote Access?

Making a Plex media server remotely accessible over the internet is possible, but many people consider the traditional setup process to be *fraught with peril*.

There are multiple reasons for hesitation.

## Not "easy" for most

To illustrate my point, here's a snippet from the [Plex Remote-Access setup guide](https://support.plex.tv/articles/200289506-remote-access/):

![](/blog/v1671291804369/QOCHtR1Af.png)

After reading the above snippet, there's no doubt some people would then be thinking...

*"Huh?... UPnP? NAT-PMP? Manually forwarding a port? External port number? Internal IP address? ...um, never mind."*

The fact is, establishing remote access is possible using Plex's traditional technique, but it's certainly not "easy" for most people.

## Not "secure" and introduces risk

Even for those brave, tech-savvy folks who can successfully navigate the Plex remote access setup process and power through the tedious technical details, there is something else to think about. It's something that many may not consider (until after disaster strikes).

What thing am I referring to? Well, if you did follow the Plex remote access setup, you opened a port on your router. In other words... you exposed your server to anyone on the internet -- including exposing it to malicious threat actors who will welcome the opportunity to hack into your home network.

The fact is, establishing remote access is possible using Plex's traditional technique, but it's certainly not "secure" and it introduces unacceptable risk.

## Easy and Secure Remote Access

OK, problems like those described above, while real, shouldn't stop you from achieving the goal of having easy and secure remote access.

There is an easy way to provide remote access to your Plex content, without the need to make any changes to your Plex server or deal with any of the router tedium described above.

There is a way to make your Plex server invisible on the internet, secure and unassailable to malicious actors, while still simultaneously providing access to the friends and family you wanted to authorize.

And you can realize this reality without requiring your friends or family to install any additional software (*like a VPN, yuck*) on their client-side laptop, tablet, or mobile phone. And all they'd need is the browser they already use every day.

The reality I refer to is enabled by our open-source [OpenZiti](https://github.com/openziti/) project and some of its components that we collectively refer to as [BrowZer](https://blog.openziti.io/introducing-openziti-browzer).

![](/blog/v1671318547985/kIttXBpOF.png)

More background and detail on BrowZer can be read in my introductory article where I discuss [modern web app security](https://blog.openziti.io/introducing-openziti-browzer).

%%[browzer-canny-feedback] 

## Companion Video Demo

Here is a 3-min video that demonstrates streaming a movie (the holiday movie classic ***It's A Wonderful Life***) from a Plex media server to a remote user using OpenZiti BrowZer.

%[https://www.youtube.com/watch?v=0nXISwUG4yo] 

## Express Your Interest in a BrowZerPlex Pilot

We haven't yet shipped everything necessary for you to self-deploy BrowZer for your Plex network, and experience what I describe above. However...

We'd like to hear from you if you're interested in participating in a pilot (beta) program where we will work with you now to get everything set up.

If you are excited by the opportunity to be among the first to use BrowZer to securely share your Plex media content with your remote friends and family, then simply complete this [OpenZiti BrowZerPlex Pilot Form](https://forms.gle/3iA9Hsghk5KWhEzH9) and we will follow up with you shortly.

Thanks!
