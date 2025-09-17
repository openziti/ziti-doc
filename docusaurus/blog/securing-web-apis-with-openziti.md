---
slug: securing-web-apis-with-openziti
title: "Securing Web APIs With OpenZiti — Zero Trust For Web APIs"
authors: [AndrewMartinez]
date: 2022-08-16
tags:
  - web api
  - zero trust
  - security
  - openziti
---
# Securing Web APIs With OpenZiti

In the late 2000s, I was a software engineer in the telecom industry, working on large data pipelines that would aggregate billing data from any carrier. The older the carrier, the more likely we would write a web scrapper to automate data retrieval. The new carriers had Web APIs. It was exciting and abundantly clear that these servers were exposed publicly on the internet.

These Web APIs weren't servicing commercial or residential applications for consumer billing. These were data pipelines to detailed call records and other private data. A treasure trove of information for partners and data subscribers. Needless to say, it was amusing that this attack surface was exposed so cavalierly. The only reason it was exposed on the public internet was that it was convenient.

The carrier did secure the Web API. It was one of the first times I had ever seen a Web API require a client certificate in the wild. Over time I saw more and more APIs deployed, some publicly and some inside of private networks. The ones inside private networks required weeks to months of lead time to deploy as they generally required security reviews from the carriers, restricted internal network access, and other good ideas that made software development slow but security and compliance happy.

There simply was not a fast way to provide developer-focused access to Web APIs inside of a secure private networking space. So we made do with a process that took months to set up and took days to resolve issues when something went wrong. Tickets would ping-pong between the carrier support desk, our internal IT support desk, and me, the software engineer.


# A Brighter Future

If you had shown OpenZiti to me when I was working with dozens of telecom Web APIs - I would have marveled at it. OpenZiti would have given me an SDK in the language of my choice to access a private network. It would have cut out the entire IT department, and I could swap production and test network and credentials according to my CI/CD needs. Additionally, planning and estimating my work would have become known units of work after one deployment. Said more plainly, it would have eliminated my dependencies on outside departments for secure network access, thus improving the accuracy of my estimates. 

Doing a POC would have been reduced from weeks of inter-team/company coordination to "here are your credentials, put them into this SDK, and you are connected." That is powerful.

When OpenZiti is deployed to protect a Web API, the security model inherits all of Open  Ziti's Super Powers:

- SDK or Tunneler Access - access private networks directly in software or through clients
- Private Service Address - "private DNS", custom top-level-domains, etc.
- Dark Services - service attack surfaces are reduced by adding a new layer of security
- Protocol/Data Masking - the traffic no longer appears to be web traffic to a compromised network observer
- End-To-End Encryption - traffic is only readable by the client and server no matter what in the middle is compromised
- Strong Identities - both parties know exactly who/what they are interacting with
- Role-Based Access Control & Posture Checks - restrict based on static and dynamic access policies

...and more. There are many videos about "what OpenZiti is" and I suggest you check them out at the [OpenZiti Website](https://openziti.io) or the [OpenZiti YouTube Channel](https://www.youtube.com/c/OpenZiti).

# Layers of Security & Attack Surfaces

OpenZiti provides an additional layer of security by allowing your service attack surfaces to be reduced to zero. At the minimum, the controller and one router must be addressable over traditional networking for the Open OpenZiti network to initialize. 

Compromising OpenZiti does not compromise your Web API. If the controller is compromised, it would expose them as if they were deployed without OpenZiti.  Compromising routers in the system provides no insight into the traffic's contents as the data sent between clients and hosts is end-to-end encrypted.

# Authentication Integration

On the OpenZiti project, we are also working a set of features that would allow external Web APIs to use OpenZiti identity credentials in your own API. This includes using JWTs and x509 client certificates minted by an OpenZiti network that can verify a client seamlessly without additional authentication.

# Deployment Models

Below are some example deployments of OpenZiti with API clients and API hosts. The fastest startup time for API consumers is SDK-only deployment in their consumption software. If the software cannot be modified, Tunnelers must be introduced, which require deployment.

A basic understanding of OpenZiti components is required:

- SDK - An OpenZiti SDK is a software library used to connect to an OpenZiti Network
- Tunneler - A provided or custom OpenZiti client that uses a Ziti SDK to provide host-level access to an OpenZiti Network
- Controller - A OpenZiti Controller is used to synchronize and manage an OpenZiti Network
- Edge Router - A Ziti Edge Router is a process that is deployed in an OpenZiti Network to create a mesh network and enables ingress and egress from the network

Additionally, the following components are used in the following diagrams:

- Private Network \<#\> - A network managed by a private entity
- Host - A virtual machine, physical machine, container, etc.
- API Host Software - Some software that provides a Web API
- API Client Software - Some software that consumes a Web API

*Note: The following diagrams show SDK to SDK or Tunneler to Tunneler diagrams. It is possible to mix and match SDK host/client and Tunneller host/client models.*

## SDK Host & Client Public Router

![SDK-SDK-Public Router@4x.png](/docs/blogs/openziti/v1660143492122/A-IxGQkAi.png align="left")

- Uses SDKs for both the host and client, which associates processes to identities in OpenZiti for the highest level of security
- Uses a public router deployed by the API provider
- Fast startup for API consumers


## SDK Host & Client Private Router

![SDK-SDK-Private Routers@4x.png](/docs/blogs/openziti/v1660143484083/TG8M_jfa1.png align="left")

- Uses SDKs for both the host and client, which associates processes to identities in OpenZiti for the highest level of security
- Uses a private router that requires a client to deploy the router (dial-out is required)
- API Consumer is required to deploy a Router

## Tunneler Host & Client Public Router


![TUN-TUN-Public Router@4x.png](/docs/blogs/openziti/v1660143502983/20FsHrueq.png align="left")

- Uses Tunellers for both the host and client, which associates hosts to identities in OpenZiti
- Uses a public router deployed by the API provider
- Tunnellers must be deployed

## Tunneler Host & Client Private Router

![TUN-TUN-Private Router@4x.png](/docs/blogs/openziti/v1660143496703/cVbNoLM2t.png align="left")

- Uses Tunellers for both the host and client, which associates hosts to identities in OpenZiti
- Uses a private router that requires a client to deploy the router (dial-out is required)
- Tunnellers must be deployed
- API Consumer is required to deploy a Router








