---
title: "zrok frontdoor"
date: 2023-12-04T03:00:12Z
cuid: clpqbpz5r000h0al0gq673ks7
slug: zrok-frontdoor
authors: [KennethBingham]
image: /blogs/openziti/v1701362109736/d1421e32-6573-4cf4-933f-4878ce549965.png
ogimage: /blogs/openziti/v1701631475557/a539001d-b5c9-4144-9307-9ee59adc4ce8.png
tags: 
  - zrok

---

**zrok frontdoor** is the heavy-duty front door to your app or site. It makes your website or app available to your 
online audience through the shield of [zrok.io](http://zrok.io)'s hardened, managed frontends.

%[https://youtu.be/5Vi8GKuTi_I] 

<!-- truncate -->

## More Than the zrok Command

Suppose you've enjoyed using zrok interactively as a command-line tool and web console. In that case, you'll notice that **zrok frontdoor** leverages another ability of zrok: bot mode. That is, securely sharing a production site or service as a system daemon (background process).

> ***In case you're not sure what zrok is, take a look at the*** [***documentation site***](https://docs.zrok.io/)***. There is also a full playlist of***[***videos on YouTube***](https://www.youtube.com/playlist?list=PLMUj_5fklasLuM6XiCNqwAFBuZD1t2lO2)***.***

zrok frontends are the components of a zrok instance that proxy incoming public web traffic to zrok backend shares via OpenZiti. When you use zrok with a [zrok.io](http://zrok.io) frontend, you're using [**zrok frontdoor**](https://zrok.io/frontdoor/). [zrok.io](http://zrok.io) is zrok-as-a-service by NetFoundry, the team behind OpenZiti. You need a free account to use [**zrok frontdoor**](https://zrok.io/frontdoor/).

## The Art of 'Set It and Forget It'

Delegating the heavy lifting of internet hardening, high availability, and scaling for global delivery to **zrok frontdoor** lets you focus on crafting and developing your site or service.

The ingredients are:

* the [zrok.io](http://zrok.io) frontend cloud proxies
    
* a zrok share background service running on your server
    
* a backend target, i.e., a web server or a directory of files you want to share
    

## Awesome Features

* **Controlled access**: You can require a shared password or allow specific email addresses or domains by enabling the Google or GitHub login option when you reserve your shared subdomain. The [zrok.io](http://zrok.io) frontends enforce your authentication policy before the traffic reaches your share.
    
* **Hardened entry point:** The managed [zrok.io](http://zrok.io) frontends automatically handle failover scenarios and filter and mitigate anonymous abuse from the web.
    
* **Secure backhaul**: The data link between the [zrok.io](http://zrok.io) frontends and your zrok share service is automatically encrypted. It can't be eavesdropped, impersonated, or manipulated.
    
* **Convenient deployment**: The lightweight zrok share service installs as a Linux package or a Docker Compose project. Scripts and Ansible playbook are published with [the **zrok frontdoor** guide](https://docs.zrok.io/docs/guides/frontdoor/).
    
* **Pretty visuals**: The zrok console beautifully visualizes usage metrics over useful time frames.
    
* **Activity Logs**: Every request your share service handles is logged on your server.
    
* **Self-hostable**: You can use [**zrok frontdoor**](https://zrok.io/frontdoor/) as a launch pad. The zrok source is open under the Apache 2.0 license, includes an SDK, and is a native application on the OpenZiti platform. It's ripe for customization at every level. If you build something on [**zrok frontdoor**](https://zrok.io/frontdoor/) you can change your mind later and take full control.
    

## Share With Confidence

You can leverage any backend mode supported by the `zrok reserve public` command with **zrok frontdoor**.

* **proxy** mode: zrok proxies a target web server that you specify as an HTTP/S URL.
    
* **web** mode: zrok runs a built-in web server to host a target directory of files, such as a website or index of downloads.
    
* **drive** mode: zrok serves a target directory as a virtual network drive with WebDAV.
    
* **caddy** mode: this is my personal favorite because it's so flexible. The sharing target in this mode is a Caddyfile leveraging zrok's built-in Caddy server. Now you can do almost anything with zrok that you can do with Caddy.
    

## How Does zrok frontdoor Work?

Setting up **zrok frontdoor** is a straightforward process.

1. **Install the Service**: Choose between the Linux system service or Docker service.
    
2. **Token Configuration**: The first step involves pasting your zrok account token into the service's configuration file. This allows the service to manage a zrok environment tethered to your account.
    
3. **Specify the Share Target**: Next, you define what you want to share - it could be an HTTP/S URL for proxying or a directory of files you wish to share as a website or file index.
    
4. **Service Initiation**: Finally, start the service. The zrok service reserves a dedicated public subdomain, which appears in the zrok console as a new share dangling from the service's zrok environment.
    

![](/blogs/openziti/v1701360384297/ee1315cc-809a-4c30-a1d6-67980d2ad44b.png)

## What will you share today?

**Jump to**[**the first step for your OS**](https://docs.zrok.io/docs/guides/frontdoor)**.**

We're curious. Tell us what you shared with **zrok frontdoor** in [the OpenZiti Discourse forum](https://openziti.discourse.group/) or hit us up at [@openziti](https://twitter.com/openziti)!

Loving zrok? Spread the word and give zrok [a shiny gold star on GitHub](https://github.com/openziti/zrok)!
