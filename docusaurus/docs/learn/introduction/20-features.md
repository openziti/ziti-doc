---
id: features
title: Features
---

# Features

**OpenZiti** superpowers are distinguished between security, performance/reliability, and ease of management. 

## Security

### Private ‘Dark’ Networking
Applications are increasingly exposed to the public internet (and networks, layer 3/4 in general). Open ports them vulnerable to threats / subject to vulnerability exploitation, or traditional private networking (VPNs, firewalls etc.) are cumbersome or unusable. OpenZiti makes them dark and invisible from the internet, with no holes from the firewalls. It makes it more reliable and focused management on the server preventing any unauthorized users from entering the server.

### Built-In, Not Bolted On
Traditional network security is exposed to the internet with at least some open ports allowing attackers to scan and potentially find an exploit. OpenZiti provides the ability to be embedded directly into the app using an SDK removing this threat and making security even stronger – i.e., we are not even trusting the host OS network, nor does the developer need to know port/IP.

### Zero Trust
Traditional systems allow users to connect before they authenticate. Many give access to the network without using separate firewalls and access control points – which slows down developers and burdens operators. OpenZiti mandates authentication and authorisation before any connectivity can be established using a strong identity. When connectivity is created, it can be micro-segmented using least privilege and attribute-based access control.

### Trusting Endpoints 
Clients and servers are assumed to be trusted if they comply with higher-level access controls. OpenZiti, as part of authentication and authorisation before connecting, allows posture checks to be set up to check endpoints pass certain tests, including MFA, AD domain membership, MAC address, OS version and required processes.

### E2E Encryption 
We want to increase the security of our data across the network and, in general, are moving from TLS to mTLS but need to handle keys, PKI, and distribution. OpenZiti implements its own PKI, handles bootstrapping trust and provides both mTLS and end-to-end encryption by default (built on Libsodium). Our approach ensures low overhead, no need for keys, and prevents unintended users from viewing and modifying data.

### Flexible Identity 
Other technology stacks require using identity providers (IdP) from massive organisations. OpenZiti provides its internal system of strong identity using x509 and JWTs. It also allows you to bring an external IdP.

### Private Authenticated DNS 
We need to set up and maintain a public DNS which can be queried or attacked while naming must follow specific IP/DNS specifications. OpenZiti does not need to rely on global DNS; authenticated and private DNS is implemented and accessed only by enrolled endpoints. You do not need to name services according to top-level domain etc.

### No Port Inference 
Attackers can use port sniffing to discern information on data flows (e.g., port 22 is SSH data). With OpenZiti, everything will be synthesised into port 443, all traffic will appear as Port 443. Attackers cannot figure out what services you use/immune to port sniffing.
No Source/Destination Inference – Attackers can intercept traffic and determine source and destination as valuable information for an attack. OpenZiti encrypts metadata as it moves across the overlay, removing this threat.

## Performance and Reliability

### The Fabric [Overlay Mesh Network] 
Traditional connectivity is point-to-point, meaning any issues (e.g., high latency) anywhere on the underlying networking causes performance and reliability issues. OpenZiti provides an overlay with high availability and scalability across the mesh combined with active load balancing combined with smart routing to pick the lowest latency paths automatically.

### Service Health 
If issues exist in the end-to-end path of an application, it stops working with no knowledge as to why. OpenZiti implements service dial health metrics to successfully understand which route responses are returned. This allows us to understand the overall service health of the application network and where unhealthy connections are to determine the most likely cause rapidly.
 
## Easy Management

### Addressability 
We are normally subject to the limitation of DNS while having poor visibility on who is connecting, when, where etc. – especially if a company has a huge number of devices and apps. OpenZiti builds identity into every connection allowing direct addressability and circumventing top-level domain naming.
Network Management – Large-scale networks are difficult to measure and report usage, success, and other measurements. OpenZiti uses its embedded identity for each connection to easily understand, measure and report on services and who ‘exactly’ tries to connect, utilizations, success rates, latency, and more.

### Server to Client 
Various means to have a server communicate to the server (e.g., HTTP polling or WebSocket) have drawbacks and are not zero trust. OpenZiti allows any endpoints to communicate to other endpoints. There is no concept of client/server. Therefore, applications can be hosted and accessed by any other participating endpoint (as long as it has passed their authentication and authorisation checks).

### Application Portability 
Application operators and users must consider how and where their applications will be hosted and set up various controls (e.g., firewalls). OpenZiti-powered applications can be hosted anywhere without worrying about managing ports, IP, DNS etc., while users can access them from anywhere without thinking about ‘being on the network’ as the network moves wherever they do.

### Easy Integration 
Developers need to identify/configure their applications to interact with the networking – e.g., specifying the application ports/IP that will be used. OpenZiti is seamless and easy to integrate, and if using SDKs, developers do not need to specify (or even care about) ports/IPs or the underlying network.

### Multiple options of deployment
Deploying software to desktop/server is never an easy task. Applications powered by OpenZiti enable you to reduce the deployment time & effort. You can integrate the SDK directly into the application that's already being deployed. If you can't integrate, you can use [Pre-built tunnelers and proxies for a variety of operating systems, including mobile](../../reference/tunnelers) to allow existing applications and networks to take advantage of an OpenZiti deployment.
