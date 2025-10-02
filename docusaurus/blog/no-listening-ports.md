---
title: "No Listening Ports?"
date: 2024-04-26T00:38:15Z
cuid: clvfy2395000009jr8jb1hy8b
slug: no-listening-ports
authors: [ClintDovholuk]
image: "@site/blogs/openziti/v1702587204755/fa35d4ba-8bea-412b-91be-298e9db9d73b.png"
imageDark: "@site/blogs/openziti/v1702587204755/fa35d4ba-8bea-412b-91be-298e9db9d73b.png"
tags: 
  - appsec
  - zerotrust
  - zero-trust-security

---

Not too long ago, I authored a post about why [Go is Amazing for Zero Trust](./go-is-amazing-for-zero-trust.md). In that post, I write about one of OpenZiti's superpowers that allows your applications to have no listening ports by integrating an OpenZiti SDK into it. It's always interesting writing content that makes perfect sense to you but after you publish it, someone immediately asks a question that's so obvious, you wonder how it is you, and everyone that reviewed it missed it. I published that blog post, and the first (well-deserved) [response was](https://www.reddit.com/r/golang/comments/18hykre/comment/kdb2ftb/?utm_source=reddit&utm_medium=web2x&context=3):

<!-- truncate -->

![](/blogs/openziti/v1702558877739/79b66b3b-bf99-49eb-88ec-d30ffa66a808.png)

This question is very common because it sounds totally impossible that a server could have no listening ports. It's not impossible, and it's not something novel; it uses a technique where your clients and servers securely connect to an intermediary server that **does listen** on the IP-based underlay network and brokers the connection. (OpenZiti calls these edge routers)

Instead of a classic architecture that looks like this, with an open port in your firewall and a listening port on your network's IP-based network:

![](/blogs/openziti/v1714093416860/2e64e723-83c0-4e40-b3b3-51b9432128be.png)

you leverage an OpenZiti overlay network where the server and client both dial outbound and connect to the OpenZiti mesh, deployed on the internet.

![](/blogs/openziti/v1714092838970/ee29aef7-e29c-461a-bb00-a68ccb2d40e3.png)

## Network Programming Overview/Review

> *If you're a seasoned pro and understand enough about network computing, skip this section.*

If you are not familiar with network programming (and honestly, how many of us **really** are), one of the guides that makes its way around social media routinely is [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/html/). It really is a great slice of the internet, and well worth your time. I think it's useful to be modestly familiar with network programming in general. We won't be diving into the depths of sockets here but that link will teach you an amazing amount about network programming. This post covers, from a high level, how two processes on two different computers can communicate with each other.

I don't know it for a fact, I just know it's true; the vast majority of networking applications written, are written using ["Internet Protocol" (IP)](https://en.wikipedia.org/wiki/Internet_Protocol). IP is so pervasive and has been so successful every operating system implements it, every programming language has standard library calls for it, and we use it every day. You're using it right now, to read this blog post. [HTTP](https://en.wikipedia.org/wiki/HTTP), the way your browser got this post's content, is built on [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol). TCP is built on IP.

Your browser opened a connection to a server "listening" somewhere on the open internet. You've seen diagrams like this a million times, it looks something like this:

![](/blogs/openziti/v1702561537782/039ce6d7-0a6e-4bd9-9487-6427dc422550.png)

So, what does it mean for the server to be "listening"? When that server started, it made a system call using whatever language the server was written in. You can start your own server right now if you have [Python](https://www.python.org/) installed. Change to any folder and run: `python3 -m http.server 9000`. Bam! That server just "listened" on a port. Under the hood, python asked the operating system to create a socket and then "bound" port 9000 to that socket. If the operating system obliges, a new entry will be tracked by the operating system for your running server.

Python, by default, thinks you probably intend to be able to access this server from **any** other computer on your network, so Python used a special IP, `0.0.0.0` when doing the bind. This special IP address means "any IP address assigned to any network interfaces on the host", not one specific IP address. This allows any network packets that arrive at the computer's network interface to be routed to the server we just started. When packets arrive at the computer via any IP assigned to that host, the operating system uses the destination port of the incoming request (9000 in this example) to locate the socket to send the packet to. In this case, network packets are sent to the Python program we just started for processing. This is how you're able to navigate to [http://localhost:9000](http://localhost:9000) and see a directory listing of whatever folder you were in when you started the server.

![](/blogs/openziti/v1702586347425/27860954-2476-4cf4-a94a-4878dccbfa2e.png)

### Network Tooling

But how do we **know** the port is listening? Every operating system provides tooling for inspecting open sockets. One common tool to look at open sockets that ships with most operating systems is [`netstat`](https://en.wikipedia.org/wiki/Netstat) . If you ran the Python, you can now try running `netstat`. Open a shell and type: `netstat -lnt`. You'll see something like:

![](/blogs/openziti/v1702562979059/1cef7371-7707-4dbb-9798-952b1f923879.png)

Notice we have a `LISTEN`ing socket, bound to `0.0.0.0`, on port `:9000`. Cool! Now any tooling that is IP-aware can connect to this server. For example, your browser, `curl` or any tool that is IP-aware (which is pretty much any networking tool).

## No Listening Ports

Ok, with the primer out of the way, usually when I say or write "OpenZiti allows your server process to have no listening ports," this is the immediate reaction.

![](/blogs/openziti/v1702563443920/8f6d633b-8553-4791-9ec5-b486f6548125.gif)

It's normal. I get it. How can there be a connection, if there's no listening port? There's **definitely** a listening port **somewhere**, right? Surely there must be and it's true, there are ports somewhere listening because we live in a world dominated by IP. The question becomes where that listening port is, and where it is **NOT**. When you start a process with an [OpenZiti SDK](https://openziti.io) and instruct that process to "bind" a service with OpenZiti, you're not actually asking the operating system to create a socket and you'll also notice there's no port needed when "binding."

Instead of a program binding to a socket with a port, it "binds" the program to an OpenZiti concept called a terminator. A terminator is a logical representation that informs the OpenZiti mesh network where to send packets. It's similar to the idea of the IP tuple of `source address:source port:destination address:destination port` but it's a listener on the OpenZiti overlay network, not a socket:port combination on the local machine.

> What's important is that the server does **not** open a socket on the operating system that is routable to the program. This is the critical point: *There are****no listening sockets/ports****at the IP layer of that operating system.*

I've revised the diagram shown above and added the OpenZiti SDK and the OpenZiti overlay components. Here's what a server listening on an OpenZiti overlay looks like:

![](/blogs/openziti/v1702565484739/9d9bc59d-3a3f-4b31-bb02-406f47562997.png)

It looks remarkably similar to the previous diagram for a good reason; we want the eperience of binding a server to the OpenZiti overlay to feel very similar to binding ports on an IP-based underlay network. Notice the OpenZiti overlay shown above has three routers deployed, all on the internet. **That is where listening ports are located**. There are no listening ports in the private network space and no listening ports on the server. Connecting to the OpenZiti routers requires a strong, cryptographically verifiable identity (X509 certificate, JWT, etc), and all connections in an OpenZiti overlay are always [mutually authenticated](https://en.wikipedia.org/wiki/Mutual_authentication) and connections from a client to a server are always end-to-end encrypted.

A server process listening on an OpenZiti overlay network is **unattackable and undiscoverable** through classic IP-based tooling, because there are no open ports to connect to and probe and attack. The only way to attack the process is through the OpenZiti overlay network itself. Getting onto the OpenZiti overlay requires clients to be authenticated using that strong identity but they also need to be **authorized** to send traffic to the HTTP server! Just having a strong identity associated to the overlay network is not enough.

The OpenZiti mesh network is responsible for delivering the packets from an OpenZiti-aware client to the OpenZiti-enabled server, similar to how underlay routers would deliver packets on IP-based networks. Traffic still traverses the underlay network; IP isn't removed from the equation. Instead, the traffic is sent via the overlay network, with all the additional security the OpenZiti zero trust overlay network provides. The overlay network itself will have listening ports, but crucially, not your server.

So the next time you see or read, "your server has no listening server ports," hopefully, it will make more sense!

## Share the Project

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [**starring us on GitHub**](https://github.com/openziti/ziti/). It really does help to support the project! And if you haven't seen it yet, check out [**https://zrok.io**](https://github.com/openziti/ziti/). It's totally free sharing platform built on OpenZiti! It uses the OpenZiti Go SDK since it's a ziti-native application. It's also [**all open source too!**](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [**X <s>twitter</s>**](https://twitter.com/openziti), [**reddit**](https://www.reddit.com/r/openziti/), or over at our [**Discourse**](https://openziti.discourse.group/). Or you prefer, check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
