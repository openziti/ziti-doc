---
title: Quickstart Rest Service
---
import CliLoginMd from '../../_cli-login.md'

By default, the quickstart creates a [Service](/docs/quickstarts/services/index.md) for you, the 
only thing you have to do is create an identity for yourself, enroll that identity, and start making calls to the 
controller's REST API.

## Create an Identity

### Log into the Controller
This process will differ depending on which quickstart you followed. For example, if you are using docker quickstart 
you'll need to `exec` into the container, for remotely hosted networks you will need to ssh into the remote host, etc.

<CliLoginMd/>

### Create an Identity

```shell
ziti edge create identity user quickstart.rest.user -a ziti.rest.dialers -o quickstart.rest.user.jwt
```

## Enroll the Identity

Refer to [this guide](/docs/core-concepts/identities/enrolling) for enrolling your identity. The process is different 
depending on your environment. If you have set up a remotely hosted or docker hosted network you will need to copy the 
identity file `quickstart.rest.user.jwt` to the device you'll be enrolling on. For docker refer to the
[docker cp](https://docs.docker.com/engine/reference/commandline/cp/) documentation.

## Accessing the REST API

From the device your identity is enrolled on, you will now be able to access the REST 
API through the OpenZiti service.

Here is a simple curl example to get the controller version:

```shell
curl -ks https://ziti.rest.api/version
```
Output:
```shell
$ {"data":{"apiVersions":{"edge":{"v1":{"apiBaseUrls":["https://MacBook-Pro:1280/edge/client/v1"],
"path":"/edge/client/v1"}},"edge-client":{"v1":{"apiBaseUrls":["https://MacBook-Pro:1280/edge/client/v1"],
"path":"/edge/client/v1"}},"edge-management":{"v1":{"apiBaseUrls":["https://MacBook-Pro:1280/edge/management/v1"]
,"path":"/edge/management/v1"}}},"buildDate":"2022-12-12T23:22:28Z","revision":"47ed81fcf816",
"runtimeVersion":"go1.19.3","version":"v0.27.0"},"meta":{}}
```

The output is a json payload, we can clean it up a little and just get the version data from the payload using `jq`.

```shell
curl -ks https://ziti.rest.api/version | jq .data.version
```
Output:
```shell
$ "v0.27.0"
```

## Where to Go From Here

Having the REST API service sets you up for creating a "dark controller". The controller's REST API is initially set up 
to be publicly accessible. With this service allowing you access over the zero trust overlay this enables you to stop 
exposing the controller's REST API port publicly making it only accessible by those with an identity.