---
slug: nginx-zerotrust-api-security
title: "NGINX & ZeroTrust API Security"
authors: [AndrewMartinez]
date: 2022-12-01
tags:
  - nginx
  - zero trust
  - api
  - security
---

# NGINX & ZeroTrust API Security

![ngx_simple_pre@2x.png](/blogs/openziti/v1669908439678/tz_p-x3qS.png align="left")

*With the first version of* [*ngx\_ziti\_module*](https://github.com/openziti/ngx_ziti_module)*, it is possible to take an NGINX-exposed Web API and make it completely dark. This means no open ports in NGINX, and it brings the Zero Trust capabilities of [OpenZiti](https://github.com/openziti) to any NGINX deployment. Yes, replace open ports with open source! OpenZiti works in existing applications or new ones.*

![ngx_simple_post@2x.png](/blogs/openziti/v1669908465505/gf5pDUJQn.png align="left")

The [OpenZiti](https://github.com/openziti/) team was pondering how to make it drop-dead simple for existing API deployments sitting on the open Internet to benefit from OpenZiti. OpenZiti allows new forms of API Security in scenarios where the API is only intended for usage by a controlled set of clients or when access needs to be tightly controlled. APIs deployed permissively listening on any network are attack vectors. The reason they are deployed in this fashion is a false sense of security. For internally exposed APIs, the common idea is that "the corporate network is safe." For internet-exposed APIs, it is usually "my service is safe." Both of those concepts are never genuinely correct. The [corporate network is only safe until it is breached](https://auth0.com/blog/the-death-of-the-corporate-network/), and internet APIs have [bugs that allow remote access](https://owasp.org/www-project-top-ten). 

For APIs that aren't using OpenZiti, what do they need to get off the ground quickly? The first obvious answer was to "zitify" (add an OpenZiti SDK to an existing code base) whatever is hosting the public exposure of their API - most likely an application server, load balancer, or API Gateway. The problem with that approach is that there is a multitude of those. Each language has its application server approach, there are many cloud and self-hosted API Gateways, and there is an extensive list of load balancers. To get started, we had to choose we needed something pervasive.

NGINX is popular. About 20-30% of the internet uses it, and most developers are deployers who have used it before or heard about it. There are other solutions, like Envoy, that we are also considering if this approach gains traction. NGINX is also a front-line or edge-deployed solution - either it is already situated on the front lines for existing APIs or can comfortably be deployed there.

Most importantly, NGINX also supports a C API that allows developers to add functionality by authoring modules. We took this and created [ngx\_ziti\_module](https://github.com/openziti/ngx_ziti_module). The first version is aimed at solidifying the configuration blocks and enabling the forwarding of traffic to upstream servers from an NGINX with no open ports.

### A Note On Full Zero Trust

Now, for this setup, we aren't eliminating all of the trusted networks, which means the solution is not fully Zero Trust. The back-end API Servers are still trusting the network they are deployed on. The best use of OpenZiti is to embed every server with the OpenZiti SDK and use OpenZiti itself to load balance services between multiple hosts. This would be a complete Zero Trust set up. However, this article and the `ngx_ziti_module` assumes that the reader would like to dip their toes in OpenZiti without altering the code base for all of their servers or is in a scenario where they can't alter the server directly. OpenZiti strives to provide flexible solutions that enable a path to Zero Trust with realistic solutions for real problems.

### Example

Consider the following deployment of NGINX, which has three upstream services.

![ngx_simple_pre@2x.png](/blogs/openziti/v1669834189600/RCThUvpKI.png?height=450 align="left")


*The NGINX configuration for this deployment may look like this:*

```plaintext
error_log /dev/stderr debug;
error_log logs/error.log debug;

events {
    worker_connections  1024;
}

stream {

    server {
        listen 8080;
        proxy_pass backend.example.com:8080;
    }

    server {
        listen 8081;
        proxy_pass backend.example.com:8081;
    }

    server {
        listen 8082;
        proxy_pass backend.example.com:8082;
    }
}
```

This NGINX instance listens on three ports: 8080, 8081, and 8082. If this NGINX instance is hosted in the cloud and listening openly on the internet, anyone can attempt to connect. This leaves the instance and its back-end services open to attack - including the [top ten OWASP](https://owasp.org/www-project-top-ten/) attack vectors. Using OpenZiti the NGINX instance can be instructed to load `ngx_ziti_module` and any number of identities hosting any number of services defined in the OpenZiti network. Implementing OpenZiti via NGINX would change our scenario diagram to the following:

<img src="/blog/v1669834486585/vXVR-gs9R.png" style="height:150px"/>

To bind (host) the OpenZiti Services via the NGINX instance, we need the following configuration.

```plaintext
load_module ngx_ziti_module.so;

error_log /dev/stderr debug;
error_log logs/error.log debug;

thread_pool ngx_ziti_tp threads=32 max_queue=65536;

events {
    worker_connections  1024;
}

ziti identity1 {
    identity_file /path/to/ziti/identity1.json;

    bind http-service00 {
        upstream localhost:8080;
    }

    bind http-service01 {
        upstream localhost:8081;
    }

    bind http-service02 {
        upstream localhost:8082;
    }
}
```

The above configuration uses a single `ziti` block to load an identity named `identity1` using the configuration file `identity_file /path/to/ziti/identity1.json`. It then exposes three OpenZiti Services named `http-service00`, `http-service01`, and `http-service02`. The NGINX instance will pass all incoming OpenZiti-facilitated traffic to the designated upstream servers. 

### The Benefits

1. No open ports on NGINX
2. Strong immutable identities for clients and hosts
3. Allows OpenZiti's policies to define ACL for services
4. Bring OpenZiti's visibility into access control, activity logs, etc., replacing traditional API logging
4. Restricts access to the target backend APIs to OpenZiti connections only
5. Allows existing micro/macro-service architectures to adopt OpenZiti without altering their existing code or deployment models

### HowTo Overview

1. Create an OpenZiti network via one of the [quickstarts](https://openziti.github.io/docs/quickstarts/network/).
2. [Create a new identity](https://openziti.github.io/docs/core-concepts/identities/overview#one-time-token-ott)
3. [Enroll the new identity](https://openziti.github.io/docs/core-concepts/identities/overview#one-time-token-ott)
4. [Define your services in OpenZiti](https://openziti.github.io/docs/core-concepts/services/overview)
5. [Define your policies in OpenZIti](https://openziti.github.io/docs/core-concepts/security/authorization/policies/overview)
6. [Build the ngx_ziti_module](https://github.com/openziti/ngx_ziti_module#building)
7. [Configure NGNIX](https://github.com/openziti/ngx_ziti_module#using)