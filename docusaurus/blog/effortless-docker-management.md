---
title: "Effortless Docker Management"
seoDescription: "How to use OpenZiti BrowZer to securely access and manage Docker containers. Streamline container management and enhance security."
date: 2024-09-05T15:00:56Z
cuid: cm0pezxy3000p0alch287g2lt
slug: effortless-docker-management-with-private-web-access
authors: [CurtTudor]
image: /blogs/openziti/v1725481068115/9bc5870f-011f-4890-8487-23369499b5da.jpeg
tags: 
  - docker
  - opensource
  - security
  - web-security
  - openziti

---

# Overcoming Common Headaches

If you're involved with software creation or deployment, you likely use Docker. If so, the following *saga* probably rings some bells with you:

---

### A common, painful scenario

You become aware that something's not working in your Docker fleet. Maybe a service is down? You `ssh` to the the host where the containers run, and do a `docker compose ps`. Yep, it's that buggy microservice that has crashed.

No problem, I'll restart it: `docker compose restart`. Okay now let's try again. Hmm... The issue is still there. `docker compose ps` again. Sigh... the service must have just crashed immediately after starting.

I probably would have known what was happening had I been reading the log stream, but there is a lot of clutter from other services. I could get the logs for just that one service via `docker compose logs --follow myservice` but that dies every time the service dies so I'd need to run that command every time I restart the service.

I could alternatively run `docker compose up myservice` and in that terminal window if the service is down I could just `up` it again, but now I've got one service hogging a terminal window even after I no longer care about its logs.

I guess when I want to reclaim the terminal real estate I can `ctrl+P,Q`, but... wait, that's not working for some reason. Should I use `ctrl+C` instead? I can't remember if that closes the foreground process or kills the actual service...

---

OK. You get the picture. Ugh... What a headache!

Of course, it makes no sense to manage a large scale Docker deployment by connecting to each container individually or restarting processes (an orchestrator like K8S will serve that large scale use case much better). But if you've got a few containers running in a self-hosted (home?) network, the above story probably sounds familiar.

### A Better way

Memorizing docker commands is hard. Memorizing `alias`'s isn't much easier. Keeping track of your containers across multiple terminal windows is untenable.

But hang on. What if you had all the information you needed in a single *magical* terminal window where every common docker command was one keypress away?

Picture this:

![](/blogs/openziti/v1725034531527/33cfddf1-4849-4995-a5c4-18ee4df9e8a8.gif)

If that got your attention, Now, imagine if you could access the *magical* terminal window by simply opening a web browser, on any laptop or mobile device, and then navigating to a URL representing the remote host where your containers run. Everything is right there in the browser tab.

Bye-bye `ssh`.

Intrigued?

As nice as that is, It gets even better. Now, imagine the URL was internet-accessible, but ***only*** visible to you, invisible to others, thus protecting your containers from malicious actors.

This is not a fever dream. In this article, I'll show you how all this is possible today.

I'll discuss the following components that collectively implement the solution:

* Isaiah
    
* OpenZiti
    
* BrowZer
    

# The Isaiah Service

One component involved in the solution is Isaiah. [Isaiah](https://github.com/will-moss/isaiah) is a relatively new open-source project (*it first appeared in early 2024*). It is a self-hostable service that enables you to manage all your Docker resources on a remote server. It is an attempt at recreating the `lazydocker` command-line application while making everything available as a ***web application***.

The screencap in the above "better way" section shows Isaiah in action.

### Isaiah Deployment

You run Isaiah on the host where your containers execute -- the host you would previously `ssh` to in the '*painful scenario*' described at the top of this article.

*(NOTE: Ensure that Docker 23.0.0+ is installed on your host before proceeding)*

There are several ways to deploy Isaiah, but perhaps the easiest is via `docker compose`. Here is a `compose.yml` file you can use:

```yaml
services:
  isaiah:
    image: mosswill/isaiah:latest
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      SERVER_PORT: "80"
      AUTHENTICATION_SECRET: "some-very-long-and-mysterious-secret"
```

Then simply run `docker compose up -d`

*(NOTE: if you already have a compose file on your host, you can simply add the above* `isaiah` *section to the existing* `services` *section of your compose file)*

As you can see, this compose file will have Isaiah listening on HTTP, without TLS, on your LAN or perhaps even on the open internet. This is certainly sub-optimal from a security standpoint, but read on and I'll describe how to lock things down.

If the `AUTHENTICATION_SECRET` env var is configured, it tells Isaiah to require visitors to enter the secret when they arrive, like this:

![](/blogs/openziti/v1725117677807/06d61b16-4a94-4116-b9f3-87466ad91d82.png)

But even with the `AUTHENTICATION_SECRET` in place, and HTTP visitors hitting your host being prompted as shown above...this is still not as secure as we need it to be.

A better topology is one where your Docker host, and Isaiah, reside in a [VPC](https://en.wikipedia.org/wiki/Virtual_private_cloud), and the host has NO ports open to the internet. In this kind of deployment, the host will be completely invisible to the internet. The best (most secure) way to access the host is via a zero-trust overlay network.

# How to Easily Deploy a Zero-Trust Overlay Network

The next component involved in the solution is OpenZiti. [OpenZiti](https://openziti.io/) is an open-source project focused on bringing zero trust networking principles directly into any application. The project provides all the pieces required to implement a zero trust overlay network and provides all the tools necessary to integrate zero trust into your existing solutions.

There is a vast amount of documentation, as well as [quick starts](https://openziti.io/docs/learn/quickstarts/), on the OpenZiti site, so I will not replicate it here.

If you like what you read about OpenZiti, but you prefer not to self-host it yourself, [we](https://netfoundry.io/) also offer a zero trust networking platform. If that interests you, [reach out to us for more discussion.](https://netfoundry.io/lets-talk/)

# BrowZer

The next component involved in the solution is `BrowZer`.

The `Z` in this component's name (within the word normally spelled "*browser*") is not a typo. It is a purposeful indication that this solution, unique in today's technology offerings for securing browser-based applications, is built as part of the [**OpenZiti** project](https://github.com/openziti/).

BrowZer enables you and your organization, enterprises and self-hosting enthusiasts alike, in the cloud or at home, to operate private-to-the-internet web applications while still easily providing secure access for your authorized internet-based remote users.

I previously published a lengthy article that introduced the [concept of browZer](https://blog.openziti.io/introducing-openziti-browzer). I recommend giving it a read.

## Forward Proxy Authentication / Trusted SSO

With OpenZiti and BrowZer now in your mind, I want to return to Isaiah for a moment.

Isaiah has a feature known as *Forward Proxy Authentication*. This feature enables you to log in to an authentication portal, and then connect to Isaiah without having to type your `AUTHENTICATION_SECRET` every time.

In this mode, you protect Isaiah using your authentication portal rather than a cleartext / hashed password.

To use this mechanism, configure Isaiah using the following variables:

* Set `FORWARD_PROXY_AUTHENTICATION_ENABLED` to `true`.
    
* Set `FORWARD_PROXY_AUTHENTICATION_HEADER_KEY` to the name of the forwarded authentication header your auth proxy sends to Isaiah.
    
* Set `FORWARD_PROXY_AUTHENTICATION_HEADER_VALUE` to the value of the header that Isaiah should expect (or use `*` if all values are accepted).
    

By the way, by default, Isaiah is configured to work with [Authelia](https://www.authelia.com/) out of the box. So if you are using the Authelia IdP as your auth proxy, you can just set `FORWARD_PROXY_AUTHENTICATION_ENABLED` to `true` and be done with it (no need to configure the other variables).

## Trusted SSO Between BrowZer and Isaiah

Much like Authelia, BrowZer also works with Isaiah's *Forward Proxy Authentication* out of the box.

As you read in the browZer article linked above, browZer requires you to authenticate with an IdP before connecting to your zero-trust overlay network. A common setup is to use Auth0 as the browZer IdP and have Auth0 federate to Google. You can read about how to do this in our [browZer IdP documentation](https://openziti.io/docs/identity-providers-for-browZer-auth0).

Once you have set up your Ziti overlay network, and have set up browZer to enable web access to Isaiah, you are then using browZer as your auth proxy.

Now you can configure Isaiah with:

* `FORWARD_PROXY_AUTHENTICATION_ENABLED` to `true`, and
    
* `FORWARD_PROXY_AUTHENTICATION_HEADER_VALUE` to the value of your Google email address.
    

For example:

```yaml
services:
  isaiah:
    image: mosswill/isaiah:latest
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      SERVER_PORT: "80"
      FORWARD_PROXY_AUTHENTICATION_ENABLED: "true"
      FORWARD_PROXY_AUTHENTICATION_HEADER_VALUE: "you@gmail.com"
```

Here is what it looks like to use browZer to access a private-to-the-internet instance of Isaiah:

![](/blogs/openziti/v1725469319491/f2d0112a-e120-41da-8030-95624e4ff713.gif)

Here's what happens above:

* Brave web browser hits the URL representing the protected instance of Isaiah
    
* Brave is redirected by BrowZer to Auth0, then federated to Google (with 2FA) for authentication
    
* BrowZer bootstraps the necessary OpenZiti software into Brave tab, and the OpenZiti software loads the Isaiah web app over the zero-trust overlay network
    
* Isaiah sees that BrowZer has done the proper SSO by passing necessary info from Google to Isaiah, so no login prompt is rendered by Isaiah
    
* User is presented with Isaiah GUI welcome screen showing that "2 Containers" are running (one is Isaiah, the other is an instance of the BrowZer Bootstrapper for a staging environment)
    
* User clicks around, looks at logs for a running container, also removes an old Docker image
    

# Wrap up

Do you host a web app (like Isaiah) and want to be invisible to malicious intruders?

Do you want your users to have easy access from anywhere with no additional software on their client devices?

Do you want to do all this without making any modifications to the web app?

If so, then we hope you'll [reach out for a conversation](https://netfoundry.io/lets-talk/) about BrowZer.
