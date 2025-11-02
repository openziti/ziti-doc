---
slug: securing-nodejs-applications
title: "Securing NodeJS Applications — An Introduction to the OpenZiti SDK for NodeJS"
authors: [CurtTudor]
date: 2022-09-28
tags:
  - nodejs
  - openziti
  - zero-trust
  - sdk
---
## Securing NodeJS Applications

# Welcome

If you are a **NodeJS** app developer or DevSecOps practitioner, and application security and business agility is 
important to you, then you're in the right place.

<!-- truncate -->

Here I will take the abstract notion of app-embedded zero trust, and show you how OpenZiti uniquely positions you to achieve it in ***your NodeJS applications***.
<table>
    <tr>
      <td>
        <br/>
        <br/>
        <br/>
        <br/>
        So as our mascot Ziggy would say...  
        <br/>
       Let's get cookin' !
      </td>
      <td>
        <img src="/docs/blogs/openziti/v1663795868819/oZBNK_WSq.png?height=250" alt="How to secure NodeJS apps" />
      </td>
  </tr>
</table>

In case you haven't heard, [OpenZiti](https://openziti.github.io/ziti/overview.html) is a free, open source project, focused on bringing zero trust networking to any application. 

OpenZiti provides a best-in-class overlay network and numerous SDKs making it easy to embed secure connectivity directly into your app, without exposing incoming ports to the internet, and without VPNs!

OpenZiti is referred to as an overlay network because it provides secure connectivity on top – or “overlaying” – existing networking infrastructure, like the internet.

Everything is based on trusted identity, and we take it a step further by providing identity-specific end-to-end encryption, even before we do mTLS.

Here's an overview of an OpenZiti network:

![image.png](/blogs/openziti/v1663946224862/C-eySQ1IN.png)

If you want to learn more about what an OpenZiti network is, and the various ways we make it programmable, we invite you to visit our main [OpenZiti documentation site](https://openziti.github.io/ziti/overview.html).

It's important to know that you can incrementally implement your rollout of OpenZiti.  

You can begin by running our [Ziti Desktop Edge](https://apps.apple.com/app/id1460484572) (or [Mobile Edge](https://apps.apple.com/us/app/ziti-mobile-edge/id1460484353)) software on your client (we have versions for Mac, Windows, and Linux).

That approach would look like this:

![image.png](/blogs/openziti/v1664213475093/cePW5PfP0.png)

Once you're up, running, and comfortable with your OpenZiti network, you would then work towards the ***ultimate goal*** of having app-embedded zero trust networking built directly into both your client and server software, by using our OpenZiti SDKs.  

That would look like this:

![image.png](/blogs/openziti/v1664214142956/ZmA3_879t.png)

No more need to run VPN-like OpenZiti edge software.




# Installation

The OpenZiti SDK for NodeJS is published to [NPM](https://www.npmjs.com/package/@openziti/ziti-sdk-nodejs), and it's now waiting for you.

Our DevX philosophy is to always eliminate as much friction as we can, so we made it possible for you to install the OpenZiti SDK for NodeJS just like you would any other package, via:

```
npm i @openziti/ziti-sdk-nodejs
```
or
```
yarn add @openziti/ziti-sdk-nodejs
```

Simple. Straightforward. Familiar.

## Native Addon

The OpenZiti SDK for NodeJS is implemented as a [NodeJS Addon](https://nodejs.org/api/addons.html) (a.k.a. "*Native Addon*", a.k.a. "*Native Module*").

This is why our NodeJS SDK is actually implemented in C. Here's how GitHub breaks it down:

![image.png](/blogs/openziti/v1663801229089/K2VwyFi2B.png?width=400)

Internally, the OpenZiti SDK for NodeJS embeds the [OpenZiti SDK for C-language](https://github.com/openziti/ziti-sdk-c).  

The core OpenZiti capabilities (e.g. identity enrollment, communications with OpenZiti control-plane, etc.) within our C-SDK are wrapped by our NodeJS-SDK, and that core power is then exposed to NodeJS apps at the JavaScript language level.

Beyond these core OpenZiti capabilities, additional capabilities exist within the OpenZiti SDK for NodeJS that are specific to the types of web server frameworks that reside in the NodeJS ecosystem (*more on that below*).

## N-API

The OpenZiti SDK for NodeJS leverages the [N-API](https://nodejs.org/api/n-api.html
) (an abstraction of the underlying V8 JavaScript engine).

Details surrounding the N-API are beyond the scope of this article, but if you're curious about architectural structure and flow and about what actually happens when your NodeJS code calls one of our APIs, like `ziti_dial` for example,  take a peek at the following diagram:

![image.png](/blogs/openziti/v1663862820471/SgksvyXlp.png)

We'll cover this in greater detail in future articles.

## Compilation?

You might be wondering: 
> *Hey wait... if this SDK is implemented in C language code, does that mean it needs to be compiled when I install it?  Am I at risk of being dragged into a quagmire of compiler/linker tooling nightmares*

Nope. 

There is no need for install-time compilation of the OpenZiti SDK for NodeJS.  

We did the heavy-lifting for you ahead of time (...*again, to reduce friction*).

We baked some special sauce into the `@openziti/ziti-sdk-nodejs` npm package that executes during the `npm i` (or `yarn add`) command.

These mechanisms will dynamically determine what **OS** you are using, what **NodeJS version** you are using, and what **CPU Architecture** you are using, and it will then automatically download a pre-built binary (*that we publish during our SDK release process*).  

The binary that is installed for you is the one that is suitable for the environment where you are doing the install.

Sweet!

## Server-side web application platform support

There are many server-side web application platforms built upon NodeJS.  You may be using one of them and wonder whether these platforms are supported by the OpenZiti SDK for NodeJS.  

Spoiler alert... the answer is ***yes***!

![image.png](/blogs/openziti/v1663857963037/IfNqwmW1l.png)

![image.png](/blogs/openziti/v1663799247907/l0bwWvRBp.png)

Except for a couple JavaScript-related server-side frameworks (circled above in red), all others are currently supported by the OpenZiti SDK for NodeJS.

> *Note that one of my upcoming blog articles will do a deep technical dive into the underpinnings of the OpenZiti NodeJS SDK, how it transparently integrates with ExpressJS, and how with just a couple lines of code the SDK makes it trivial for a Node/Express web server to host a Ziti service and listen for incoming Ziti connections instead of listening on a port open to the internet.  Be sure to subscribe to this blog to to ensure you won't miss these further educational materials*

# Basic usage

The OpenZiti SDK for NodeJS can be used with apps written in the [CJS style](https://nodejs.org/api/modules.html#modules-commonjs-modules) as well as the more modern [ESM style](https://nodejs.org/api/esm.html#modules-ecmascript-modules).

Some code snippets below are crafted as CJS, and some as ESM, to illustrate differences in coding style.

### Importing the SDK
CJS
```js
const ziti = require('@openziti/ziti-sdk-nodejs');
```
ESM
```js
import ziti from '@openziti/ziti-sdk-nodejs';
```

### Identity enrollment

Once you have [created an OpenZiti enrollment token](https://openziti.github.io/ziti/identities/creating.html#creating-an-identity), it is easy to perform the enrollment, and create an [OpenZiti Network Identity](https://openziti.github.io/ziti/identities/overview.html?tabs=tabid-new-ca-ui%2Ctabid-new-identity-ui) from the enrollment token, using the `ziti_enroll` API, as shown in the demo app below:

ESM
```js
import fs from 'fs';
import ziti from '@openziti/ziti-sdk-nodejs';

const ziti_enroll = async (jwt_path) => {
    return new Promise((resolve, reject) => {
        let rc = ziti.ziti_enroll(jwt_path, (data) => {
            if (data.identity) {
                resolve(data);
            } else {
                reject(data);
            }
        });
    });
};

let jwt_path = process.argv[2];

console.log('Specified Enrollment JWT is (%o)', jwt_path);

let data = await ziti_enroll(jwt_path).catch((data) => {
    console.log('Enroll failed with error (%o)', data);
});

if (data) {
    console.log("data is:\n\n%s", data);

    if (data.identity) {
        fs.writeFileSync('identity.json', data.identity);
    }
}

process.exit(0);
```

You would run the above app like this: 
```
node index.js path/to/enrollment.jwt
```

If the enrollment JWT file is valid (e.g. unexpired, not enrolled previously, etc.), then the app will write the OpenZiti Identity file in the local directory with the name ```
identity.json```.

### Authenticate with Control Plane

Authenticating your client or server app onto the OpenZiti network is done via the ```
init``` API. 

In the snippet below, let's assume you exported the path to the ```
identity.json``` file created in the above example into an env var named ZITI_IDENTITY_FILE. 

With that in place, network authentication is one API call away, as shown here:

```
// Somehow provide path to identity file, e.g. via env var
const zitiIdentityFile  = process.env.ZITI_IDENTITY_FILE;
// Authenticate ourselves onto the Ziti network
await ziti.init( zitiIdentityFile )
  .catch(( err ) => { /* probably exit */ });
```

Following that, you're now free to read and write data across the network, as discussed below.

### Make a client-side REST call to a dark service

Once your OpenZiti network has been configured with a [service](https://openziti.github.io/ziti/services/overview.html?tabs=create-service-ui), your NodeJS app can make REST calls to it.

Let's assume there is a web server on your network, and it is represented by the OpenZiti Service name ```myDarkWebService```. You'd make REST calls to that service from your NodeJS app like this:

```
const on_resp_data = ( obj ) => {
    console.log(`response is: ${obj.body.toString('utf8')}`);
};

// Perform an HTTP GET request to a dark OpenZiti web service
ziti.httpRequest(
  'myDarkWebService', 
  'GET', 
  '/',              // path
  ['Accept: application/json' ], // headers
  undefined,        // optional on_req cb 
  undefined,        // optional on_req_data cb
  on_resp_data      // optional on_resp_data cb
);
```

The above example used GET, but POST operations, and all other REST verbs, are supported too.

### Host a server-side OpenZiti service

If you have a NodeJS/ExpressJS web server, and you want to make it dark to the internet, we have you covered.

Here is how things are traditionally done (without OpenZiti), which involve the risks of opening a TCP port to the internet, and listening for insecure, unauthenticated incoming connections:
```js
import express from 'express';
let app = express();
app.listen(myExposedTCPport, function() { ... }
```
The attack vector above can be easily eliminated with OpenZiti.

Here is how things are done with the OpenZiti NodeJS SDK, involving none of the risks of opening an insecure TCP port to the internet, and instead, listening only for pre-authenticated, secure, trusted OpenZiti connections:
```js
import express from 'express';
let app = ziti.express( express, zitiServiceName );//<-easy peasy
app.listen(ignored, function() { ... }
```

That's right. 

**With only a single-line code change** (the ```ziti.express``` call), **your web server is now capable of being dark on the internet.**

**Nothing else in your existing ExpressJS web server code needs to change!**

Existing routing, middleware, etc., all operates the same as it always did... but now you enjoy the comfort of knowing that if a connection comes in, it is from a trusted identity on the client side.  

No malicious actors can see your dark web server, and thus, no malicious actors can attack it.

# Next Steps

The API exposed by the OpenZiti NodeJS SDK extends beyond the examples rendered above, so we encourage you to come explore the repo.

### Projects using this SDK

You might also want to check out a couple of our projects that use the OpenZiti NodeJS SDK (*yes, we use OpenZiti, to build more OpenZiti*):

- Call a Dark Webhook from GitHub Actions ([Ziti Webhook Action](https://github.com/openziti/ziti-webhook-action)). We self-host a dark instance of [Mattermost](https://netfoundry.io/why-we-switched-to-mattermost/)) at our company, and this webhook tooling is a way we securely allow our GitHub Actions CI pipelines to post status messages to developer-oriented notification channels on a Mattermost app that would otherwise be inaccessible to the GitHub runners.

- [Zitified Ziti Admin Console](https://github.com/openziti/ziti-console), optionally capable of hosting a Ziti service.

### Connect with us

We'd love to hear from you about your NodeJS-based applications and whether or not you decide OpenZiti is the right fit to secure them, so please join us and your peers in conversation:


- Main OpenZiti [repo](https://github.com/openziti/ziti) - please give us a star!
- OpenZiti NodeJS SDK [repo](https://github.com/openziti/ziti-sdk-nodejs)
- Join [discussion](https://openziti.discourse.group/)
- Follow [@openziti](https://twitter.com/openziti)

We are here to help.

Also feel free to leave us comments or questions below, right here on this article. 

