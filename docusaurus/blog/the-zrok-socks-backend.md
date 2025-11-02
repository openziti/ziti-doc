---
title: "The zrok SOCKS Backend"
date: 2024-03-20T15:26:19Z
cuid: cltzyhmeo000408l66jxqc3do
slug: the-zrok-socks-backend
authors: [MichaelQuigley]
image: "@site/blogs/openziti/v1710175565287/a8245615-e2da-4e08-a8d8-494cc919ff40.png"
imageDark: "@site/blogs/openziti/v1710175565287/a8245615-e2da-4e08-a8d8-494cc919ff40.png"
tags: 
  - privacy
  - internet
  - networking
  - geolocation
  - secure
  - zrok

---

zrok provides a number of powerful tools for [sharing private resources](https://docs.zrok.io/docs/getting-started). 
In addition to our multiple flavors of proxy support, web hosting, low level TCP and UDP sharing, and network drives 
support, zrok now includes the ability to hide or alter your IP address.

<!-- truncate -->

zrok facilitates this type of privacy by layering on another type of tunneling callled SOCKS. SOCKS is a protocol that was developed in the mid-1990's, and according to Wikipedia "is a de facto standard for circuit-level gateways (level 5 gateways)."

> The circuit/session level nature of SOCKS make it a versatile tool in forwarding any TCP (or UDP since SOCKS5) traffic, creating an interface for all types of routing tools. It can be used as:
> 
> * A circumvention tool, allowing traffic to bypass Internet filtering to access content otherwise blocked, e.g., by governments, workplaces, schools, and country-specific web services.[<sup>[13]</sup>](https://en.wikipedia.org/wiki/SOCKS#cite_note-13) Since SOCKS is very detectable, a common approach is to present a SOCKS interface for more sophisticated protocols:
>     
>     * The [Tor](https://en.wikipedia.org/wiki/Tor_(anonymity_network)) onion proxy software presents a SOCKS interface to its clients.[<sup>[14]</sup>](https://en.wikipedia.org/wiki/SOCKS#cite_note-14)
>         
> * Providing similar functionality to a [virtual private network](https://en.wikipedia.org/wiki/Virtual_private_network), allowing connections to be forwarded to a server's "local" network:
>     
>     * Some SSH suites, such as [OpenSSH](https://en.wikipedia.org/wiki/OpenSSH), support dynamic port forwarding that allows the user to create a local SOCKS proxy.[<sup>[15]</sup>](https://en.wikipedia.org/wiki/SOCKS#cite_note-15) This can free the user from the limitations of connecting only to a predefined remote port and server.
>         

The zrok implementation of SOCKS (v5) allows you to split the sharing and access portions of the SOCKS tunnel between two different zrok environments. This means you can run a `zrok share` on a host in the cloud, or in some other location on the planet, and then use that share as a secure tunnel, allowing you to access the internet from that location.

In practice, it looks like this:

![](/blogs/openziti/v1710945991755/f045989c-aed6-4840-8f37-f55adb84c4bf.png)

If the environment running the `zrok share private -b socks` were running on a host in Japan, and the `zrok access private` was running on a host in the United States, and the user's web browser (in the United States) is configured to use the local SOCKS access (on `127.0.0.1`), then the end user will appear to be browsing from the host in Japan.

*Like all zrok shares, the SOCKS share can be set up in seconds and removed just as easily when it is no longer needed.*

All modern web browsers support SOCKS. There is tooling available for all modern operating systems that allow most applications to be "wrapped" with SOCKS, such that all of their network traffic can be intercepted and re-routed through the SOCKS proxy.

Here is a recent [zrok Office Hours](https://www.youtube.com/watch?v=5Vi8GKuTi_I&list=PLMUj_5fklasLuM6XiCNqwAFBuZD1t2lO2) video that illustrates the `socks` backend in action:

%[https://www.youtube.com/watch?v=j0dcQGjgQMM] 

Be aware that fully securing your traffic using SOCKS can be tricky in some cases. Modern web browsers allow you to configure a SOCKS host and also allow you to configure whether or not DNS resolution is also routed through SOCKS:

![](/blogs/openziti/v1710865302956/4f7889c8-4334-45b6-ab0f-48e20f44757f.png)

Notice that Firefox includes a checkbox to enable "Proxy DNS when using SOCKS v5". Like any security or tunneling solution, you'll want to be sure that you understand the implications of various configuration options and audit that they're working correctly in your environment.

This is the basic approach for creating and using the `socks` backend:

1. Create a zrok environment (using `zrok enable`) on a host with network locality that you would like to share (in a foreign country, for example)
    
2. In the environment with the remote network locality, run `zrok share private --backend-mode socks` (consider adding `--closed`) to share that network locality as a SOCKS share
    
3. Ensure that your local environment (where you want to access the remote network locality) is enabled using `zrok enable`
    
4. Run `zrok access private <token>` in your local environment. `<token>` is given to you from the `zrok share private` command above and can also be retrieved from the zrok web console
    
5. By default, the `zrok access` command above will create a SOCKS listener at the address `127.0.0.1:9191`. Use that address to configure your web browser (or `tsocks`, or SocksCap) to enable to SOCKS-based connectivity
    

There are numerous inexpensive VPS and VM solutions that would be very effective for siting a `zrok share private -b socks` SOCKS share. This is a simple way to locate your network access on a different host on the internet. A lot of VPS and VM providers allow you to allocate a host for a short period of time, and then dispose of it when you no longer need it. Kind of a "burner phone" for the internet.

The shared zrok infrastructure in your self-hosted environment, or on zrok.io has no way to observe your actual traffic. That traffic is all end-to-end encrypted through the OpenZiti overlay. zrok is just acting as a secure transport.

If you run into any issues or need assistance, feel free to reach out on the the [OpenZiti Discourse](https://openziti.discourse.group/c/zrok/24). There's a great community there to help you.

It always means a lot to the folks working on zrok when you're take a minute to drop a star on the [zrok's GitHub repository](https://github.com/openziti/zrok). It helps us to know that the work we're doing on zrok is important to you.
