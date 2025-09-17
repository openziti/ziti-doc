---
title: "zrok is Growing Up"
date: 2024-08-02T20:07:40Z
cuid: clzd4zgd4000109l58wnp7wue
slug: zrok-is-growing-up
authors: [MichaelQuigley]
image: /blogs/openziti/v1722357921994/c2ddeddd-f52e-41a9-ace8-26ce7bb0259c.png
tags: 
  - network
  - browsers
  - web-development
  - security
  - webdev

---

zrok has been growing pretty steadily throughout 2024. As we've grown, we've started having to deal with abuse, phishing, and other similar types of issues showing up on the service at zrok.io.

Over the last weeks, the team has worked together to figure out the best compromise to continue offering our users the best free sharing solution possible, while also offering a reasonable level of protection against abuse. We've batted around a number of different ideas.

The solution we've settled on is to introduce an "interstitial page" for free-tier accounts using public sharing. The interstitial page will be shown the first time an internet user visits a zrok public share (with a timer resetting every week). The page is there to make sure that the user visiting your share is very clear that the web resource they're visiting is shared through zrok, and very likely *not* a financial institution (or at least that they should be careful with personal information).

![](/blogs/openziti/v1722361596170/898a7bec-d03b-4aef-80bc-5860547001ef.png)

The interstitial page is designed to only be displayed to interactive clients (web browsers presenting with a `User-Agent` header starting with `Mozilla/5.0`). Other clients like `curl`, or HTTP clients from various programming langues will bypass the interstitial page.

zrok users who upgrade to any paid tier (see [pricing](https://zrok.io/pricing/)) will not have an interstitial page presented on their shares. The interstitial pages feature does not impact private zrok sharing in any way. When you `zrok access private` a share and create a private frontend, that frontend does not present interstitial pages. In those cases, we're pretty confident the user understands what they're accessing.

We're also actively working on bringing some additional capabilities to the zrok paid offerings, including "bring your own domain" support, which will allow users to create public shares using their own domain name. So, we're kind of hoping you might want to consider one of those options outside of removing the interstitial page.

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">We're expecting to enable the interstitial pages feature globally for all free-tier zrok users starting on Thursday, August 8th.</div>
</div>

If you're a self-hoster, you'll have extensive options to customize the interstitial page configuration. Each public frontend can enable or disable interstitial support, and interstitial pages can be disabled on a per-account basis.

I recently did a short zrok Office Hours video about the interstitial pages feature:

%[https://www.youtube.com/watch?v=NYjec5mIXTE&list=PLMUj_5fklasLuM6XiCNqwAFBuZD1t2lO2&index=24] 

We appreciate every zrok user. Thank you for your support and attention. If you appreciate what we're doing with zrok, it always means a lot when you can drop a star on the [zrok repo on GitHub](https://github.com/openziti/zrok).

If you have any questions or concerns, feel free to reach out on the [OpenZiti discourse using the zrok topic](https://openziti.discourse.group/c/zrok/24).
