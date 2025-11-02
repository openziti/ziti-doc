---
title: "Zitification"
date: 2021-07-19T15:01:35Z
cuid: cl474tt6y02vs82nvanu32thu
slug: zitification
authors: [ClintDovholuk]
image: "@site/blogs/openziti/v1654785931484/SGu2ETR_s.jpeg"
imageDark: "@site/blogs/openziti/v1654785931484/SGu2ETR_s.jpeg"
tags: 
  - security

---

"Zitification" or "zitifying" is the act of taking an application and incorporating a Ziti SDK into that application. Once an  
application has a Ziti SDK incorporated into it, that application can now access network resources securely from anywhere in  
the world provided that the computer has internet access: NO VPN NEEDED, NO ADDITIONAL SOFTWARE NEEDED.

<!-- truncate -->

Integrating a Ziti SDK into your application and enrolling the application itself into a Ziti Network provides you with_  
tremendous_ additional security. An application using a [Ziti Network](https://openziti.github.io/docs/introduction/intro/) configured with a truly zero-trust mindset will be  
**IMMUNE** to the "expand/multiply" phases of classic [ransomware attacks](https://netfoundry.io/ztna-ransomware/). As recent events have shown, it's probably not  
a case of if your application will be attacked, but when.

In these posts we're going to explore how common applications can be "zitified". The first application we are going to focus  
on will be `ssh` and it's corollary `scp`. At first, you might think, "why even bother" zitifying (of all things) `ssh`  
and `scp`? These applications are vital to system administration, and we have been using `ssh` and  
`scp` "safely" on the internet for years. Hopefully you're now interested enough to find out in the first post:  
[zitifying ssh](./zitifying-ssh.md)

If you'd prefer to read about other zitifications, a running list of zitified apps will be updated below:

*   [ssh->zssh](./zitifying-ssh.md)
*   [scp->zscp](./zitifying-scp.md)
*   [Kubernetes cluster manager - kubectl](./tunneling-ingress-to-kubernetes-workloads.md)
