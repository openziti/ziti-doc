---
title: "The safest way to make Portainer Internet accessible"
date: 2024-10-03T16:15:23Z
cuid: cm1thzk20000908jq6fic8x00
slug: the-safest-way-to-make-portainer-internet-accessible
authors: [CurtTudor]
image: /blog/v1727532608880/5fb5b813-b9cf-4fe7-9d36-ffb921cda67a.jpeg
tags: 
  - security
  - web-security
  - portainer
  - zerotrust
  - ziti

---

If you run Portainer, and you seek a modern, flexible recipe for how to make it secure while also providing flexible access to your authorized users, this article is for you.

A question that sometimes gets asked is: *What types of companies, self-hosters, or general use cases, will gain the greatest benefit from using* [*OpenZiti BrowZer*](https://blog.openziti.io/introducing-openziti-browzer)?

To help answer the “*who benefits*” question, much like I did in a [previous article](https://blog.openziti.io/effortless-docker-management-with-private-web-access), this article will frame the answer in the context of a web application named [Portainer](https://www.portainer.io/) (a web-accessible container management platform) when it needs to be internet-facing.

`NOTE: Upcoming articles will describe how similar techniques employing BrowZer can be used to protect and secure other popular web applications. So be sure to subscribe to this blog to be notified when those articles are published.`

# Why is Portainer interesting?

Portainer can be used to manage Docker, Kubernetes, and other container environments. It is primarily a web-based management interface, designed to be accessed via a browser. The web-based approach provides convenient access and centralized management, allowing users to interact with their container infrastructure …***from anywhere***.

Companies benefiting from Portainer include teams with limited in-house container management expertise, those with rapid deployment requirements, those having resource constraints/constrained IT budgets, or teams with members of varying skills, technical and non-technical. It also benefits those with a security and compliance focus.

Hobbyists and IT enthusiasts can also benefit from Portainer to manage containerized services for personal projects, home automation, media servers, and more.

Need to check on something in your docker fleet… while you are standing in line at the coffee shop? Just open a browser on your phone, and surf to your Portainer instance. Easy. Convenient. Powerful.

However…as the old saying goes: *Don’t run with scissors*.

Portainer is an exceptionally privileged piece of software, and it has near root-level access to your Container infrastructure, so you had better make sure your Portainer instance is safe from malicious actors.

# How to secure Portainer (without BrowZer)

Getting Portainer up and running is very straightforward using their standard deployment scripts.

When I decided to kick the tires, I used the following code in a `docker compose` file:

```yaml
  portainer:
    image: portainer/portainer-ce:2.21.0
    restart: unless-stopped
    ports:
      - "8000:8000"
      - "8080:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./portainer_data:/data
```

But when you've decided to allow access to Portainer from the public internet, things require more work.

Various [writeups](https://www.portainer.io/blog/how-to-correctly-secure-portainer-when-presented-on-the-internet) have been [published](https://www.portainer.io/blog/how-to-secure-your-portainer-installation) by the friendly folks on the Portainer team to provide advice on how to secure Portainer. While not wrong, the instructions are (in my opinion) inflexible and antiquated.

They mention `port forwarding` the Portainer UI ports (http:9000/https:9443) from a public IP to Portainer.

> This implies you must open some ports to the internet. Having ports open to the internet is something we on the [OpenZiti project](https://openziti.io/), as well as all zero-trust advocates in general, will advise against.

They strongly recommend network ACLs on your firewall, so you only allow access from known trusted IP addresses.

> This is painful and tedious to set up correctly. It is technically out of reach for many. And, it is also incredibly brittle and inflexible (recall my coffee shop reference — this use case would be precluded in this scenario).

They even question if you want to expose it to the internet directly at all, and instead, suggest you set up a VPN.

> VPN deployment and configuration is a non-starter for many because of complexity, and inflexibility.

They assert that Portainer's internal authentication system should **never** be used when presenting Portainer to the internet, but instead you should configure an authentication system to use a suitably secure external mechanism, such as "LDAP" or "OAuth" (the latter of which supports 2FA/MFA).

> Again, this is getting to be a heavy lift for many teams.

Understandably, they suggest you force/enable the **HTTPS only** option, and upload your own x509 certificates.

> Many would have given up before this :(

# How to secure Portainer (with BrowZer)

A better topology is one where Portainer resides in a [**VPC**](https://en.wikipedia.org/wiki/Virtual_private_cloud), and the host has NO ports open to the internet. In this kind of deployment, Portainer will be completely invisible to the internet.

I hear you thinking: *How do I access Portainer over the web if it’s invisible*?

The answer is via a zero-trust overlay network that requires authentication before you (or anyone) can connect to it.

### **How to Easily Deploy a Zero-Trust Overlay Network**

The component that implements the zero-trust overlay network solution is OpenZiti.

[**OpenZiti**](https://openziti.io/) is an open-source project that brings zero-trust networking principles directly into any application. The project provides all the pieces required to implement a zero-trust overlay network and provides all the tools necessary to integrate zero trust into your existing solutions.

### **BrowZer**

The next component involved in the solution is `BrowZer`.

The `Z` in this component's name (within the word normally spelled "*browser*") is not a typo. It is a purposeful indication that this solution, unique in today's technology offerings for securing browser-based applications, is built as part of the [**OpenZiti project**](https://github.com/openziti/).

BrowZer enables you and your organization, enterprises, and self-hosting enthusiasts alike, in the cloud or at home, to operate private-to-the-internet web applications while still easily providing secure access for your authorized internet-based remote users.

I previously published a lengthy article that introduced the [**concept of browZer**](https://blog.openziti.io/introducing-openziti-browzer). I recommend giving it a read.

There is a vast amount of documentation, as well as [**quick starts for BrowZer**](https://openziti.io/docs/learn/quickstarts/browzer/example/), on the OpenZiti site.

There is also some related ZitiTV content:

%[https://www.youtube.com/watch?v=ZPkOQbVEnW0&t=816s] 

NOTE: If you like what you read about OpenZiti, or what you saw in the above ZitiTV episode, but prefer not to self-host it yourself, [**we**](https://netfoundry.io/) also offer a [zero-trust networking platform](https://netfoundry.io/). If that interests you, [**reach out to us for more discussion.**](https://netfoundry.io/lets-talk/)

Here is a diagram that describes at a high level how browZer operates:

![](/blog/v1727968501738/3fa80598-cf57-48f0-9fe3-c3dae201a33d.png)

### Example of Accessing Portainer over BrowZer

Here is what a user would experience using browZer to access a private-to-the-internet instance of Portainer:

![](/blog/v1727804563586/4b5e5d9a-5a4f-461a-8bb7-cfe4232d091a.gif)

Here's what happens above:

* Brave web browser hits the public URL representing the protected instance of Portainer. This is where the BrowZer Bootstrapper runs.
    
* The BrowZer runtime is loaded into Brave by the BrowZer Bootstrapper
    
* Brave is redirected by BrowZer runtime to Auth0, then federated to Google (with 2FA) for authentication
    
* Using the OIDC auth token received from Auth0, the BrowZer runtime then (transparently) authenticates onto the Ziti overlay network and then bootstraps the necessary x509 certs into the Brave tab, and the BrowZer runtime then loads the Portainer web app over the [mTLS](https://en.wikipedia.org/wiki/Mutual_authentication#mTLS)\-based zero-trust overlay network from the Portainer server which is invisible to the internet.
    
* User is presented with Portainer login screen, and user authenticates using Portainer’s internal authentication system (no need to integrate or setup an external "LDAP" or "OAuth" system)
    
* User clicks on BrowZer button, looks at various BrowZer settings, HTTP throughput chart, BrowZer changelog, BrowZer feedback form, etc
    
* User is presented with Portainer GUI welcome screen showing that 2 Containers are running (one is Portainer, the other is an instance of the BrowZer Bootstrapper for a staging environment)
    
* User clicks around, looks at logs for a running container, also removes an old Docker image, and then logs out
    

# The BrowZer Difference

In the above section, we discussed how difficult it can be to properly secure Portainer using “*traditional techniques*”.

BrowZer uses more modern, game-changing techniques that can not only properly secure your Portainer, but do it more easily, more flexibly, and more thoroughly.

With BrowZer there is:

* no need to expose Portainer ports to the internet or mess around with port forwarding.
    
* no need to fuss with network ACLs on your firewall, or only allow access from statically configured IP addresses.
    
* no need to install VPN software on clients.
    
* remote access from ANY device that has a browser.
    
* remote access from ANY location on the internet.
    
* no need to alter Portainer AT ALL (use it off the shelf).
    
* retained ability to use Portainer’s built-in auth system.
    
* 2FA/MFA for free (use whatever IdP you want)
    
* not only is there HTTPS/TLS, but also automatic mTLS, and even end-to-end XChaCha20-Poly1305 encryption ***before*** data hits the mTLS wire.
    

# **Wrap up**

Do you host a web app (like Portainer) and want to be invisible to malicious intruders?

Do you want your users to have easy access from anywhere with no additional software on their client devices?

Do you want to do all this without making any modifications to the web app?

If so, then we hope you'll [**reach out for a conversation**](https://netfoundry.io/lets-talk/) about BrowZer.
