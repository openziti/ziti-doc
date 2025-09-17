---
title: "The NodeJS zrok SDK"
seoTitle: "The NodeJS zrok SDK"
date: 2024-05-06T20:51:11Z
cuid: clvvfsgjz00040ak37yl2b0xf
slug: the-nodejs-zrok-sdk
authors: [CurtTudor]
image: /docs/blogs/openzitiv1712869619931/10e487f3-ddb6-4d9e-ab48-0774a3bbfb2a.jpeg
tags: 
  - web-development
  - security
  - nodejs
  - zrok

---

You may be familiar with `zrok`, the open-source solution built on [OpenZiti](https://openziti.io), which makes it very easy to securely share resources over the internet. If you are already a `zrok` fan, that's great news -- Thank you for being part of our community!

If `zrok` is new to you, please check out this post [**introducing**`zrok`](https://blog.openziti.io/introducing-zrok).

`zrok` is built to enable developers to seamlessly and securely share their applications (we previously released our [`zrok` Golang SDK](https://blog.openziti.io/the-zrok-sdk), and our [`zrok` Python SDK](https://blog.openziti.io/the-python-zrok-sdk)). Using just a little code enables you to share your app through `zrok`'s robust network.

Today we are excited to expand our `zrok` SDK philosophy by introducing a NodeJS SDK (available as of `zrok` `0.4.30`), and that is what we'll discuss in this article.

The package is published as [`@openziti/zrok`](https://www.npmjs.com/package/@openziti/zrok)

We will be spinning up a local HTTP server to be served via `zrok`!

If you want to follow along you'll need to have a `zrok` environment set up. If you don't want to self-host you can sign up for a free account at [**https://zrok.io**](https://zrok.io/).

Check out the [**Getting Started**](https://docs.zrok.io/docs/getting-started/) guide for more information.

![File:Node.js logo.svg - Wikipedia](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/2560px-Node.js_logo.svg.png align="left")

## **Expanding into NodeJS**

Here is all it takes to spin up a `zrok`\-enabled web server using Express:

```typescript
let root = zrok.Load()

await zrok.init( root ).catch(( err: Error ) => 
    { console.error(err); return process.exit(1) });

let shr = await zrok.CreateShare(root, 
    new zrok.ShareRequest(
        zrok.PROXY_BACKEND_MODE, zrok.PRIVATE_SHARE_MODE, 
        "http-server", ["public"])
);
console.log(`access remotely using: 'zrok access private ${shr.Token}'`)

let app = zrok.express( shr.Token );

app.get('/', function(_: Request, res: any){
  res.write(`Hello zrok!`)
  res.end()
});

app.listen(undefined, () => {
  console.log(
    `private HTTP Server is now listening for incoming requests`
  )
})
```

Let's quickly go over what's happening here:

First, we use the `zrok` object to load the root config and initialize, and then we're off to the races.

We create a private `zrok` share, and then we call `zrok.express` using the share token we just created.

This `zrok.express` call spins up a NodeJS Express server, ***however***, the Express server is transparently instrumented by the `zrok` SDK (and its embedded [Ziti SDK for NodeJS](https://blog.openziti.io/securing-nodejs-applications)) to enable the Express web server to "bind" (i.e. host) the Ziti Service represented by the `zrok` share.

In other words, the NodeJS Express web server does ***NOT*** listen on an open TCP port as traditional NodeJS Express servers do (*because that's way too insecure*).

Instead, a `zrok`\-enabled NodeJS Express server listens ***ONLY*** for incoming Ziti connections to the private `zrok` share (*because zero-trust connections are now considered best practice, and this is how the most robust security is done these days*).

The `SIGINT` handler at the end just handles a CTRL-C event, and tears down the `zrok` share.

The above example employs a `private` share. You can opt to use a `public` share if you like; in that case, you can find it [here](https://blog.openziti.io/the-zrok-oauth-public-frontend).

To expand this example from here you would simply declare any routes your app wants to expose and it's just like producing a typical Express server. No additional complications!

## Why **Though**?

The primary reason is we want this to be easy.

Sharing what you make should be painless. You develop the application -- let `zrok` handle all the security complications.

Plus you can deploy your application anywhere. As long as the environment can reach the `zrok` host controller, it can run wherever you want it to.

It can live in a container, cloud-hosted, or even run nicely on a home server, or dev laptop.

## Coming Attractions (zrok+BrowZer)

Since the above example talks about sharing an Express web server over `zrok`, I would be remiss if I didn't mention something exciting we will release soon that will alleviate a few friction points.

To illustrate, today if you want to spin up a web server on your laptop and then [share it privately with someone](https://docs.zrok.io/docs/getting-started/#private-shares), the person you are sharing it with will need to:

* download the `zrok` binary, then
    
* execute a specific `zrok` command (which starts a local HTTP listener), then
    
* point their browser at that HTTP listener (typically running at `http://127.0.0.1:9191`)
    

The above technology certainly works in many scenarios, but there are use cases where it may not...

For example, it's possible that the person you are sharing your local web server with is not tech-savvy (e.g. my grandmother) and they can't successfully obtain and/or run the `zrok` commands on their client.

Another use case is when the remote person can't install new tooling on their machine due to a lack of permission (e.g. IT restrictions). Or they can, but they elect not to.

Another use case is when you want to share your web app with someone who wants to access it on their mobile phone (where `zrok` binaries simply can't be installed).

The above use cases could be supported perfectly if only you could share a (*magic*) URL with the people you want to share your private web server with. This is because every laptop and mobile phone already has a ubiquitous web browser, so your friends, family, and colleagues already have what they need...except the URL...

So what's this magic URL, and what makes it "magic"?

The URL you will share with people will resemble this: `https://<SOME_SHARE_TOKEN>/zrok.browzer.cloudziti.io`

(`SOME_SHARE_TOKEN` is produced by your `zrok share private` command)

[OpenZiti BrowZer provides the magic](https://blog.openziti.io/introducing-openziti-browzer) that ties everything together. We are currently testing this new `zrok+BrowZer` functionality and we will release it soon.

Once it has been shipped, we will be back here posting articles that discuss all the details, so be sure to subscribe to this blog's newsletter so you don't miss the announcements.

## **Moving Forward**

Moving forward we want `zrok` to be as accessible as possible, both in options and ease of use. Support for more languages is coming! If you want to talk about languages to support or friction points, please reach out on [Discourse](https://openziti.discourse.group/c/zrok/24)!

[  
](https://openziti.discourse.group/c/zrok/24)Also if you like `zrok` or OpenZiti and want to support it, we would very much appreciate you dropping a star on both [Github (zrok)](https://github.com/openziti/zrok) / [Github (OpenZiti)](https://github.com/openziti/ziti).

It means a lot!
