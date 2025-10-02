---
title: "Put some Ziti in your Caddy"
date: 2023-10-24T12:29:14Z
cuid: clo4aztln000e08l82w2lb5fg
slug: put-some-ziti-in-your-caddy
authors: [EugeneKobyakov]
image: "@site/blogs/openziti/v1698150167579/59e96908-6587-4f29-b51b-73e523108133.png"
tags: 
  - caddy
  - openziti
  - zerotrust
  - securenetworks

---

In this post I'll continue showing the power of OpenZiti and its SDK. This time I'll show you how we [zitified](https://openziti.io/docs/reference/glossary/#zitification-zitified-zitify) [Caddy Server](https://caddyserver.com/).

<!-- truncate -->

If you're a regular reader of this blog, the concept of `zitification`, i.e. embedding OpenZiti SDK into you application, should be familiar to you. We've covered this topic before -- here are some links if you're new to this blog, or missed them:

* [Zitifying SSH](./zitifying-ssh.md)
    
* [Securing NodeJS Apps](./securing-nodejs-applications.md)
    
* [Secure Python Website](./got-5-minutes-secure-your-python-website-with-zero-trust.md)
    

Zitification allows you as a developer to achieve a true end-to-end secure overlay connectivity between your applications.

# What is Caddy Server

> Caddy 2 is a powerful, enterprise-ready, open source web server with automatic HTTPS written in Go 
- Caddy simplifies your infrastructure. It takes care of TLS certificate renewals, OCSP stapling, static file serving, reverse proxying, Kubernetes ingress, and more. 
- Its modular architecture means you can do more with a single, static binary that compiles for any platform.

These two bullet points are really important. I will show how zitifying Caddy Server simplifies your infrastructure, and how easy it was to do it with caddy server's approach to extensibility.

# Simplifying Infrastructure

Typically, if you have a website or a web application in a data center (or at home/office), and you want to protect it from outside traffic (no open Internet ports) you need to deploy some kind of proxy agent (like [Ziti Edge Tunnel](https://openziti.io/docs/reference/tunnelers/linux/)) that would connect to the overlay network, accept service connection requests and proxy them to your target server. This means that

* you need to maintain another piece of networking machinery
    
* the last mile (or a few feet) of your connection goes over an unprotected overlay
    

**common deployment with Ziti Edge Tunnel**
![Common OpenZiti Host Access deployment](/blogs/openziti/v1697632056486/244e5ebb-8767-4477-98ae-3350e99d68e0.png)

By embedding OpenZiti SDK into your server, you solve both problems at the same time.

**app-embedded deployment**
![Zitified Caddyserver deployment](/blogs/openziti/v1697632190555/f8a81c74-df47-4870-8644-2082ebd8bfec.png)

# Caddy Server plugin

OpenZiti project published a [Caddy plugin](https://github.com/openziti-test-kitchen/ziti-caddy) that makes it all very easy.

All you have to do is [import](https://github.com/openziti-test-kitchen/ziti-caddy/blob/main/cmd/ziti-caddy/main.go#L8) `ziti-caddy` plugin in your Caddy Server main. Caddy Server plugin framework takes care of bootstrapping OpenZiti SDK (driven by configuration in `Caddyfile`)

Github project has a [sample configuration and bootstrap](https://github.com/openziti-test-kitchen/ziti-caddy/tree/main/sample), but in short steps are like this:

* deploy an [OpenZiti network](https://openziti.io/docs/learn/quickstarts/)
    
* create [service](https://openziti.io/docs/learn/core-concepts/services/overview) and [identity](https://openziti.io/docs/learn/core-concepts/identities/overview)
    
* configure Caddy Server
    

```bash
http:// {
	# ziti address format: ziti/<service_name>[/<terminator>]@<ziti_identity_file>
	bind ziti/caddy-service@caddy-host.json

	file_server {
	    root /usr/share/doc
		browse
	}
}
```

There you have it, two lines of code -- one in the your Go file, and one in configuration -- and you website is only accessible on OpenZiti network.

# Next Steps

Try it out and give us feedback on [Discourse](https://openziti.discourse.group/).

Further reading:

* [Securing Web APIs With OpenZiti](./securing-web-apis-with-openziti)
    
* [zrok with the Power of Caddy](./zrok-with-the-power-of-caddy)
