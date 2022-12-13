import CliLoginMd from '../../_cli-login.md'
# Starting With Services

Once you have your zero trust overlay network in place and you want to start using it, you'll be wondering where to begin. You can start 
in a few different directions. Depending on your experience and what you're looking to do you'll have numerous directions to go in.

This page will hopefully give you some insight into some of the choices you can make.

## The REST API Service

By default, the quickstart creates a service for you, the only thing you have to do is create an identity for yourself, 
enroll that identity, and start making calls to the controller's REST API.

### Create an Identity

Log into the controller; this process will differ depending on which quickstart you followed. For example, if you are 
using docker quickstart you'll need to `exec` into the container.

<CliLoginMd/>

Once logged in, create an identity for yourself.

```shell
ziti edge create identity user quickstart.user -a quickstart.rest.user -o quickstart.user.jwt
```

Note the `-a` option, here we are creating the user with an attribute called `quickstart.rest.user`. This attribute is
required for any user that needs access to the REST API through the automatic service that is created for the quickstart.
The REST API Service Config was created specifically allowing identities with this attribute to access this service. The
name of the user is `quickstart.user` though this can be whatever name you prefer. The `-o` option outputs the identity
token to a file which can also be whatever name you prefer.

### Enroll the Identity

Refer to this [guide](/docs/core-concepts/identities/enrolling) for enrolling your identity. The process is different 
depending on your environment. If you have set up a remotely hosted or docker hosted network you will need to copy the 
identity file `quickstart.user.jwt` to the device you'll be enrolling on. For docker refer to the
[docker cp](https://docs.docker.com/engine/reference/commandline/cp/) documentation.

### Accessing the REST API

Now that enrollment is complete, from the device your identity is enrolled on, you will now be able to access the REST 
API through the service. Let's go ahead and try this with a simple curl example.

```shell
curl -ks https://ziti.rest.api/version
```
Output
```shell
$ {"data":{"apiVersions":{"edge":{"v1":{"apiBaseUrls":["https://MacBook-Pro:1280/edge/client/v1"],
"path":"/edge/client/v1"}},"edge-client":{"v1":{"apiBaseUrls":["https://MacBook-Pro:1280/edge/client/v1"],
"path":"/edge/client/v1"}},"edge-management":{"v1":{"apiBaseUrls":["https://MacBook-Pro:1280/edge/management/v1"]
,"path":"/edge/management/v1"}}},"buildDate":"2022-12-12T23:22:28Z","revision":"47ed81fcf816",
"runtimeVersion":"go1.19.3","version":"v0.27.0"},"meta":{}}
```

The output is a json payload, we can clean it up a little and just get the actual version from the payload using `jq`.

```shell
curl -ks https://ziti.rest.api/version | jq .data.version
```
Output
```shell
$ "v0.27.0"
```

### Where to Go From Here

Having the REST API service sets you up for creating a "dark controller". The controller's REST API is initially set up 
to be publicly accessible. With this service allowing you access over the zero trust overlay this enables you to stop 
exposing the controller's REST API port publicly making it only accessible by those with an identity.

## Zero Trust Application Access

OpenZiti is really about embedding zero trust directly into your applications. If you are a developer, you might want to start with 
your favorite language and start your OpenZiti journey with "zero trust application access". This means you'll take an SDK and embed it 
into an application you write! It's probably best to explore the best SDK for your language and find samples for that SDK to use. 
[The landing page](/) has links to all the SDKs to choose from.  

## Zero Trust Host Access

If you're not a developer, or if you have an application which you can't (or don't want to) change you can start with "zero trust host 
access". For this, you will install an [OpenZiti tunneller](../../core-concepts/clients/tunnelers/index.mdx) on your "clients" and on your "servers" and 
provide access to your services using these executables. If this sounds like a good place to start, 
[check out the host access quickstart](./ztha.md).