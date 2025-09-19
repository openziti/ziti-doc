---
title: "Minecraft Over zrok"
seoTitle: "Play Minecraft with friends safely and securely"
seoDescription: "Play Minecraft with friends securely without the need to open holes in your firewall!"
date: 2024-01-06T18:29:48Z
cuid: clr2egjw2000809jp0l2a50qy
slug: minecraft-over-zrok
authors: [ClintDovholuk]
image: /blogs/openziti/v1704562456124/51580b28-4e9f-4c26-9cc0-5f1a508f42cb.png
tags: 
  - minecraft
  - opensource
  - zerotrust
  - zrok

---

In 2022, we showed you [how to run a Minecraft server privately and securely using OpenZiti](./set-up-a-secure-multiplayer-minecraft-server.md).

<!-- truncate -->

Since then, we have released `zrok`, a really cool service that's built on top of OpenZiti as a ziti-native application. We also made it a free service for the world to use. If this is your first time hearing about zrok, it has some really exciting features. Read more about `zrok` over at the main site [https://zrok.io](https://zrok.io) or by [checking out previous blog posts in the `zrok` series](./tags/zrok).

We're back with a new blog showing you how you can share your Minecraft server safely and securely using `zrok`. If you want, you can watch a video covering the process here.

%[https://youtu.be/-dj_5UoL9Jw] 

## Overview

You want to play some [Minecraft](https://www.minecraft.net/) with our friends but our friends over the intenet, but you don't want to expose your [Minecraft server](https://www.minecraft.net/en-us/download/server) to the world because that's just not a good idea! You can run the server in your house or, as shown below, on some other server you have, and you want our friends to be able to connect and play in the same world! That looks like this:

![](/blogs/openziti/v1704563710705/6dadcf5a-390f-4182-b543-75e4ed84a618.png)

To make this happen, you'll need to follow the docs [and install `zrok`](https://docs.zrok.io/docs/getting-started/#installing-the-zrok-command), then [invite yourself to the platform](https://docs.zrok.io/docs/getting-started/#generating-an-invitation), and finally, for every environment you want to share, you'll need to [enable that environment](https://docs.zrok.io/docs/getting-started/#enabling-your-zrok-environment). I'm not going to cover all that here, but you need to do those things first before moving on.

## Sharing the Minecraft Server

Ok, after enabling `zrok` on your computer, on your friend's computer, and on the machine that runs the Minecraft Server, the next step is to share the Minecraft server. If you watch the video, you'll see I started with a default share from `zrok` that creates an ephemeral share. This type of share is different every time you share it. If that's what you want, great, but in this blog, I'm going to show you how to **reserve** a share instead. A [reserved share](https://docs.zrok.io/docs/concepts/sharing-reserved/) is not ephemeral, it's the same every time you access it. This makes it easy to remember how to access the share over and over since it will be the same.

Once the Minecraft server is running, log onto that machine and establish a `zrok` [reserved share](https://docs.zrok.io/docs/concepts/sharing-reserved/). Obviously, you'll need to change the unique-name shown below (mymcserverjan06). A couple of notes, these commands assume you are using `bash` and to make it easy to read, the commands are shown using the line-continuation character, `\`. If the command doesn't work for you, it's probably easiest to just put the commands on one line. ALSO note that `zrok` won't let you use `_` characters nor `-` characters at this time, so you'll have to make do without those characters for now:

```bash
zrok reserve private 127.0.0.1:25565 \
  --backend-mode tcpTunnel \
  --unique-name mymcserverjan06
```

With the reserved share created, you can now start sharing the Minecraft server using:

```bash
zrok share reserved mymcserverjan06
```

`zrok` will show you something that looks like this. Notice that you're running a "tcpTunnel" and the share is "private". Only people enabled on your `zrok` network will be able to access this server and they'll need to run `zrok` and [access](https://docs.zrok.io/docs/concepts/sharing-private/) the share using the share token. ***VERY COOL***!

![](/blogs/openziti/v1704564787671/fc31256d-75d2-4652-8668-879a411484f3.png)

## Accessing Your Minecraft Server

You've successfully shared your Minecraft server, but it's useless without being able to acces it! To access the server, you just need to run the `zrok` command and `access` the share just like it shows:

```bash
zrok access private mymcserverjan06 --bind 127.0.0.1:25565
```

When running it on your local computer, `zrok` will show you something like this:

![](/blogs/openziti/v1704565050740/0ead10fd-e0d1-4490-807c-b65b13456426.png)

Once you see that, you're ready to connect in Minecraft! Open up Minecraft, click on Multiplayer, choose "Direct Connection" and you're connected! (if you're wondering, the gif is limited to 10fps for size). You can also choose to edit/save the server, if you prefer to do that.

![](/blogs/openziti/v1704565346389/46285049-0628-4e0d-9bf5-8b96f61e9029.gif)

## **Summary - Share the Project**

That's all there is to it! Now you can run your Minecraft server wherever you like and have your friends join your game!

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [giving the project a star on GitHub](https://github.com/openziti/zrok/). It really does help to support the project! And if you haven't seen it yet, check out [**https://openziti.io**](https://openziti.io). OpenZiti is also free and open source, and it's what powers `zrok` security. It's a zero trust overlay network and platform for building other secure-by-default applications. Consider giving [that project a star too](https://github.com/openziti/ziti)!

Tell us how you're using `zrok` and OpenZiti on [**X <s>twitter</s>**](https://twitter.com/openziti), [**reddit**](https://www.reddit.com/r/openziti/), or over at our [**Discourse**](https://openziti.discourse.group/). Or you can check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
