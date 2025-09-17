---
title: "zrok Custom Domains"
seoDescription: "Introducing zrok custom domains: Use your own domain for zrok shares, boosting brand identity and share visibility for Pro plan users"
date: 2025-02-12T20:17:23Z
cuid: cm72cr7mq000408la89h44kh2
slug: zrok-custom-domains
authors: [NickPieros]
image: /docs/blogs/openzitiv1739389834988/18400a05-53fc-45ca-b458-c4c56b7b4b81.png
tags: 
  - dns
  - zrok
  - myzrok

---

With the latest release of [myzrok.io](http://myzrok.io) we are excited to announce the introduction of [custom domains](https://docs.zrok.io/docs/myzrok/custom-domains/)!

## TL;DR

You can now use your own domain when creating [zrok](https://zrok.io) shares! With a zrok custom domain you’ll be able to create shares like `<token>.your.domain.com` instead of `<token>.share.zrok.io`. You’ll need to bring your own domain and have a [myzrok.io](http://myzrok.io) Pro plan to get started. Creating a zrok custom domain via myzrok will create a zrok frontend for you. This will allow you to create [ephemeral shares](https://docs.zrok.io/docs/concepts/sharing-public/) or [reserved shares](https://docs.zrok.io/docs/concepts/sharing-reserved/) using your domain name instead of zrok’s!

## What is myzrok?

[myzrok](http://myzrok.io) is the self-service billing portal for your zrok account. This is where you can upgrade your zrok to the different plans outlined on our [pricing page](https://zrok.io/pricing/) to receive increased data, share, and environment limits based on your needs. This is also where you will now be able to create and manage custom domains if you have a Pro plan!

## Why Custom Domains?

Up to this point, all [zrok](https://zrok.io) hosted shares have been created using the `share.zrok.io` domain. This is great when you want to get something hosted quickly and easily. However, there are situations where it would be really nice to host a share on your own domain to make it identifiably yours. This is where custom domains come into play.

## How Does it Work?

You can set up your custom domain in just a few easy steps:

1. Bring your own custom domain name
    
2. Create DNS records for certificate validation and traffic routing
    
3. Wait for zrok to validate your records and finalize configuration
    
4. Start sharing!
    

You only need to do this once, after that you can create your shares like normal but utilize your domain instead of zrok’s!

Can’t wait to get started? Check out the step by step instructions in our [guide here](https://docs.zrok.io/docs/myzrok/custom-domains/)!

## Custom Domains in Action

Let’s take a look at how custom domains make zrok even more useful. Let’s say that I own a company `acme-corp` and I’ve got an upcoming convention I would really like to demo my latest software at. Rather than deploying to an environment, I could run my demo locally and use zrok to create a reverse proxy, which would allow others to access it. This works great, but by sharing my demo via a `zrok share` command, I would end up with a share link like `https://sjy8zgif4s8w.share.zrok.io/`. While this is nice and simple, the link generated doesn’t really identify my company, making it harder to leave a lasting impact. This is where a zrok custom domain comes in!

To do this I first create a zrok custom domain `demo.acme-corp.com` using the `acme-corp.com` domain.

![](/docs/blogs/openziti/v1739205451276/20f27da7-7f4e-4f77-90da-eb3ec06b4cd8.png)

Once the custom domain is created, I simply create a few DNS records for `acme-corp.com`. Within a few minutes I’m able to use the `demo.acme-corp.com` domain in my zrok shares!

![](/docs/blogs/openziti/v1739205561400/54eb0324-fcfa-4fff-9ef4-afc54bd352c8.png)

By creating a custom domain, I have also created a [zrok frontend](https://docs.zrok.io/docs/guides/self-hosting/personalized-frontend/). This will create shares in the form of `<token>.demo.acme-corp.com`. This is much more identifiable to my company however, it still leaves me with the share token at the start of my share. I can improve this by creating a [reserved share](https://docs.zrok.io/docs/concepts/sharing-reserved/). This will reserve a unique identifier for me to use in place of my share token. Not only can I make my share even more branded towards my specific use case, but I can also start and stop it and still maintain the same link!

I’ll first set my frontend as the default for my environment, then I’ll create a reserved share for the resource I want to share. In this case it’s a demo app running on localhost:4000

```bash
zrok config set defaultFrontend demo-acme-corp_YS6RyLSod
zrok configuration updated


zrok reserve public --unique-name "summit" http://localhost:4000
[   0.388]    INFO main.(*reserveCommand).run: your reserved share token is 'summit'
[   0.388]    INFO main.(*reserveCommand).run: reserved frontend endpoint: https://summit.demo.acme-corp.com

zrok share reserved "summit"
```

I can then have people visit `summit.demo.acme-corp.com` to check my demo

![](/docs/blogs/openziti/v1739206842262/d9f16273-9aa1-4d66-bbce-eb4f744a36f2.png)

Success!

![](/docs/blogs/openziti/v1739206905400/6c6c4029-af97-4ece-9f7a-d95d4fab185e.png)

This is a relatively simple example of how custom domains can be used to enhance your zrok experience. There are many times where I might want to share something a bit more permanent than a demo, such as a production app. This is where I could take advantage of [zrok frontdoor](https://docs.zrok.io/docs/guides/frontdoor/) alongside my custom domain. A zrok frontdoor would allow me to run zrok alongside my production app, enabling me to publicly expose access to it via a reserved share!

## Wrapping Up

If you’re ready to dive in and create your own custom domain head over to [myzrok.io](http://myzrok.io), sign up for a Pro plan and navigate to the custom domains page ( icon). For a more in-depth look at how to setup a custom domain you can [check out the guide here](https://docs.zrok.io/docs/myzrok/custom-domains/).

If you find this interesting and like what we’re doing, [consider starring the project on GitHub](https://github.com/openziti/zrok)! zrok is open source and built on [OpenZiti](https://github.com/openziti/ziti), which is another great project to check out and star if you haven’t done so already!

If you want to show us how zrok or ziti have been improving your workflow or have feedback you’d like to share with the team we’d love to hear from you over at  [X](https://twitter.com/openziti), [reddit](https://www.reddit.com/r/openziti/), or at our [Discourse](https://openziti.discourse.group/)!
