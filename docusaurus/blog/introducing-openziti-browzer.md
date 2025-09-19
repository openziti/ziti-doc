---
title: "Introducing OpenZiti BrowZer"
seoDescription: "Open source components to enable private-to-the-internet web application security while still easily providing access for authorized remote users."
date: 2022-09-12T21:49:23Z
cuid: cl7zashi604a0fxnv038w59b1
slug: introducing-openziti-browzer
authors: [CurtTudor]
image: /blogs/openziti/v1662574403443/kofV_IBBh.jpg
tags: 
  - web-development
  - security
  - zerotrust

---

# Introduction

I am pleased to introduce you to `BrowZer`, a new group of open source components that collectively enable you and your organization, enterprises and self-hosting enthusiasts alike, in the cloud or at home, to operate private-to-the-internet web applications while still easily providing secure access for your authorized internet-based remote users.

<!-- truncate -->

The `Z` in this article's title, within the word normally spelled "*browser*", is not a typo. It is a purposeful indication that we are bringing you a solution, unique in today's technology offerings, for securing browser-based applications. This solution is built as part of the [Open**Z**iti](https://github.com/openziti/) project.

OpenZiti enables developers to embed secure networking into their applications, as code. With BrowZer, we extend that revolution by also enabling developers to automatically embed [zero trust](https://openziti.github.io/ziti/overview.html) networking in the browser, transforming it into a full-fledged OpenZiti client.

In this context, *private* doesn't mean *invite only*. Here, private means the web application is *dark* — with no open incoming ports on your cloud instance — nor any port-forwarding on your home internet cable modem/router.

And while your web application will be invisible to, and thus protected from, malicious attackers on the internet, BrowZer still facilitates simple and secure access for remote users that you authorize. And it does so without requiring your users to install any additional software on their client-side laptop, tablet, or mobile phone. Again, all they need is the browser they already use every day.

Also noteworthy is that BrowZer places no burden upon web application developers to first instrument or otherwise make any modifications to the web application itself in order to enable remote access to its dark deployment.

This is a great enabler. For example, if you are operating a web app licensed from a 3rd party that you want to make dark (e.g. [Mattermost](https://netfoundry.io/why-we-switched-to-mattermost/)), and you can't make alterations to it, there's no problem. The same goes for a web app you *can* alter, but elect not to.

BrowZer has you covered because it does the necessary [Zitification](./zitification.md) instrumentation of your web application automatically, on the fly, as it is being loaded from the web server to the user's browser. It's what I call touchless-Zitification. More details on how this is accomplished are discussed below.

%%[browzer-canny-feedback] 

OK, that was a mouthful, so let's unpack what was just said.

# Traditional Web App Security

To help you better understand how BrowZer works, and why we are building it, let's first consider an example that highlights the traditional challenges that can occur when remote users require access to a critical web application located in a private network.

Usually, some kind of gateway bridges access into a private network. For example, the gateway could be a VPN or an SSH bastion host. Both solutions offer varying degrees of security, but, the side effects might not be acceptable.

![image.png](/blogs/openziti/v1662656432216/z6354leaK.png)

This traditional access model is not well suited for cloud-native highly ephemeral environments (like K8S). Also, scaling this type of solution as company workforces and infrastructure grows or fluctuates also creates substantial pain points and complexity for administrators.

Speaking of pain, remote users typically dislike or experience technical struggles installing, configuring, and using VPN software on their (*sometimes personal*) laptops and mobile phones.

Let's not forget that once users gain access to these private networks using traditional access models, they can access any system on the network, and not just the intended target. The dangerous follow-on is that if the credentials used to access the VPN or SSH host fall into the wrong hands, a malicious actor could access the entire network.

Traditional workflows typically place a firewall inside private networks that restricts what users have access to in order to safeguard against this risk. However, managing internal firewalls is time-consuming, tedious, error-prone, and wasteful, when the system granting access should have followed the principle of least privilege from the outset.

# Modern Web App Security via BrowZer

BrowZer's mission is to simplify workflows involved with providing zero trust access to private web applications while simultaneously reducing the attack surface associated with traditional solutions.

With OpenZiti in general, and certainly with BrowZer, access is based on the trusted identity of the user, rather than their network location. The user first authenticates to the network, then connects to the network, and only then, based on their assigned roles, can they connect to web applications made available to them — with role-based access controls (RBAC).

It bears repeating:

BrowZer enforces a pattern of ***authenticate-before-connect*** and the ***principle of least privilege*** for your web applications.

Trusted [identities](https://openziti.io/docs/learn/core-concepts/identities/overview) and roles are a core principle in OpenZiti BrowZer. They define which users are allowed to connect with which specific set of web applications.

For example, with BrowZer, you could grant only developers access to connect to a Jenkins web app and grant only HR members to a payroll web app, even while both web apps are operating within the same private network.

This model allows BrowZer to define logical sets of web applications and removes the brittleness associated with static IP addresses.

# Big Picture

The diagram below depicts how various components connect to each other in a BrowZer deployment.

![image.png](/blogs/openziti/v1663013534461/fw9fqJOaE.png)

Although this diagram shows the target web app example is [Apache Guacamole](https://guacamole.apache.org/), BrowZer supports any web app. If you are unfamiliar with Guacamole, it is an open-source RDP, VNC, and SSH gateway. And yes, BrowZer supports HTML5-based RDP.

%%[star-us-on-github] 

> *Note that my upcoming blog articles will do deep technical dives into BrowZer RDP support, so be sure to subscribe to this blog to receive further educational materials*

Now let's discuss the various BrowZer components.

## Authentication in a BrowZer Environment

Below is a (*simplified*) diagram depicting the network-auth flow from user to a web application in a BrowZer environment.

![image.png](/blogs/openziti/v1662733522760/XoZApNB43.png)

You'll notice that similar to the traditional model, there is still a gateway (*more details on that below*). But with BrowZer, the user doesn't provide a unique VPN credential or SSH key.

Instead, users need to perform a **single sign-on** (SSO) that provides a strong assertion of the user's identity.

BrowZer requires that an Identity Provider (IdP) be associated with the network. Which IdP is used is up to you. It could be ADFS, AzureAD, Okta, Auth0, ...whatever.

You can even enable [MFA](https://en.wikipedia.org/wiki/Multi-factor_authentication) if you like. This is pluggable by design.

The example in the above diagram shows BrowZer using Auth0 which in turn federates out to Google for authn, but BrowZer doesn't care who the IdP is. It uses OpenID Connect (OIDC) protocol to integrate with your IdP. Bring whatever your favorite or existing solution is. BrowZer just needs your web application users to be able to prove who they are.

> *While there are no burdensome VPN credentials or SSH bastion host keys to manage, BrowZer does involve a little upfront administration in the Ziti network to inform the control plane about the IdP. Note that my upcoming blog articles will do deep technical dives into BrowZer-IdP integration, so be sure to subscribe to this blog to receive further educational materials*

![image.png](/blogs/openziti/v1662670313410/t71lKyYuC.png)

With a small amount of network admin work out of the way, the user-facing flow that BrowZer enables for your dark web application is intentionally designed to be very simple, and friction-free.

On the client side, it will look like the following:

1. open your favorite browser (on a laptop, mobile phone, tablet, etc)
    
2. surf to URL representing dark web app (see discussion of gateway below)
    
3. perform an SSO
    
4. enjoy using the dark web app
    

No fuss.

BrowZer authenticates and authorizes web request flows, and maps users to web applications at a logical [service](https://openziti.io/docs/learn/core-concepts/services/overview) level. This is important because it lets you elevate from the dynamic details — no more worrying about IP addresses.

# The BrowZer Gateway (Ziti HTTP Agent)

As mentioned above, BrowZer environments have a gateway. But unlike traditional approaches (like VPNs) where all network traffic from all remote users funnels into and is concentrated within a single gateway, BrowZer takes a different, and novel approach.

In an OpenZiti BrowZer deployment, the component that acts as the gateway is something we refer to as the **HTTP Agent**.

The HTTP Agent has the following responsibilities:

* Ensure all incoming HTTP requests have an established BrowZer-Session, and if they do not, to redirect out to the IdP so the user can authenticate themselves
    
* Inject a component into the browser — something we refer to as the Ziti BrowZer Runtime (see discussion of the ZBR below)
    
* Respond to requests from the now browser-resident-ZBR to load other BrowZer components — namely the Ziti BrowZer Service Worker, and the Ziti BrowZer WebAssembly — to complete the Zitified web app boot-strapping process.
    

The Ziti HTTP Agent then gets out of the way.

# The Ziti BrowZer Runtime (ZBR)

The ZBR is a JavaScript component that is transparently injected into the web app as it is being loaded into the browser. Once the ZBR is resident within the browser, all further traffic between the browser and the dark web application does not involve the HTTP Agent at all.

> *Note that my upcoming blog articles will do deep technical dives into the Ziti BrowZer Runtime, so be sure to subscribe to this blog to receive further educational materials*

For now, just understand that the ZBR will intercept all `fetch`, `XHR`, and `WebSocket` requests, as well as some HTML5 events.

If something is happening in the browser that requires contact with the dark web app, the ZBR is responsible for facilitating it.

All HTTP requests are examined, and those requests targeting the dark web app are transparently routed directly from the browser to a Ziti Edge Router on the network, where the requests will ultimately be delivered to the dark web app residing inside the network.

If an HTTP request targets a resource that is not associated with the dark web app (e.g. a POST to Google Analytics), the ZBR will simply let it go to the raw internet for processing.

# The Ziti BrowZer Service Worker (ZBSW)

The ZBSW is a JavaScript component that is transparently injected into the web app by the ZBR as it is being loaded. Once the ZBSW is resident within the browser, all network requests originating within the DOM (e.g. loads of JavaScript, CSS, fonts, etc) are examined, and those requests that are targeting the dark web app are transparently routed directly from the browser to a Ziti Edge Router on the network, where the requests will be delivered to the dark web app residing inside the network.

If a DOM request targets a resource that is not associated with the dark web app (e.g. a resource load from the [JsDelivr](https://www.jsdelivr.com/) CDN), the ZBR will simply let it go to the raw internet for processing.

# The BrowZer WebAssembly

In addition to the JavaScript components described above, BrowZer involves some WebAssembly components as well.

BrowZer does some heavy lifting involving dynamic PKI (key-pair generation, CSR generation, x509 certificate acquisition), it also does its own mTLS handshakes and message encrypt/decrypt.

Yes, you heard that right. BrowZer does not use the browser's native ability to do mTLS.

BrowZer does all crypto work itself, at the JavaScript runtime level.

The reasons for this revolve around the necessity to employ x509 certs to accomplish trusted connections between the browser and the Edge Router(s). Since nothing can be installed on clients ahead of time, including certificates, the certificates are acquired from the control plane dynamically (a ZBR-to-Controller conversation), and the certs are subsequently used by mTLS logic within the ZBR.

BrowZer also does some end-to-end (E2E) encryption if you enable it. E2E encryption means that data passing between the browser-resident web app JavaScript, and the dark web app server, is encrypted even ***before*** it gets written to the wire at the mTLS level.

Translation: double encryption for your web app traffic as it traverses the network.

> *Note that my upcoming blog articles will do deep technical dives into the Ziti BrowZer WASM, and how mTLS and E2E encryption work is done at the JavaScript runtime level, so be sure to subscribe to this blog to receive further educational materials*

# Wrap up

Do you host a web app and want to be invisible to malicious intruders?

Do you want your users to have easy access from anywhere with no additional software on their client devices?

Do you want to do all this without making any modifications to your web app?

If you are nodding yes, then we hope you'll reach out for a conversation about BrowZer.

%%[curt-hs-test] 

Please stay tuned to this blog for more information concerning how you can get started.
