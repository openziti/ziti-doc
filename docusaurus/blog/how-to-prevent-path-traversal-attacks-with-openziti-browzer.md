---
title: "How to Prevent Path Traversal Attacks with OpenZiti BrowZer"
date: 2024-05-22T18:49:58Z
cuid: clwi6i6r100040ajobbs12wyv
slug: how-to-prevent-path-traversal-attacks-with-openziti-browzer
authors: [MikeGorman]
image: /blogs/openziti/v1716212854203/849ab21c-0082-49fb-9a05-a52dd554bb41.png
tags: 
  - opensource
  - security
  - cve

---

The web has revolutionized how the world operates, enabling everything from banking and shopping to social media and general business transactions. However, as with all technological advancements, malicious actors quickly found ways to exploit the web for fraudulent activities. The anonymity provided by internet usage allowed criminals to deceive users and providers, leading to significant financial losses. In response, technologies like SSL/TLS and public trust architectures were developed to enhance security, helping users verify the servers they communicate with and feel more secure in their online interactions. Despite these measures, software is inherently fallible, as it is created by humans who can make mistakes.

Criminals continually discover and exploit these vulnerabilities, using sophisticated techniques to steal information and steal or extort money. Rather than defraud users directly, they turned to stealing information by attacking the applications. BrowZer, part of the OpenZiti project, prevents one of the most common attack techniques listed in the [OWASP Top 10](https://owasp.org/www-project-top-ten/) and elsewhere, Broken Access Control.

%%[request-browzer-demo] 

## The Threat of Path Traversal

Some of the worst incidents occur when simple mistakes are made in software design, allowing vulnerabilities like path traversal attacks.  For those unfamiliar with the term, path traversal is a relatively simple attack strategy of appending paths to the URL of a website.  For example, one might usually go to [https://www.mywebsite.com](https://www.mywebsite.com).  One can append a path, like [https://www.mywebsite.com/users](https://www.mywebsite.com/users). In a vulnerable application, these requests or uploads will return data or take actions without the user having logged in.

There are 3 separate CWE's mapped to Broken Access Control specifically tied to path traversal, CWEs [22](https://cwe.mitre.org/data/definitions/22.html), [23](https://cwe.mitre.org/data/definitions/23.html), and [35](https://cwe.mitre.org/data/definitions/35.html).   Tools like [DirBuster](https://www.kali.org/tools/dirbuster/) and [ffuf](https://github.com/ffuf/ffuf) take in wordlists and can run thousands of paths against a site automatically, logging any path that receives something other than an error, and giving malicious actors a list of potentially exploitable paths.  Highly automated systems can do much more, scraping and analyzing the data for value, allowing the actor to scan large numbers of sites and receive a list of targets ranked by potential value.  More so, when particular exploits are located, these actors can scan the Web and automatically scrape data in known instances of the vulnerable sites.

[![](/blogs/openziti/v1716216190969/7b88062c-3f06-47a2-95c8-25cc7696acb8.png)](https://www.hackingarticles.in/comprehensive-guide-on-path-traversal/)

These types of vulnerabilities and attacks they enable are not trivial.  As of 5/17/24, there are [4,846 CVEs](https://nvd.nist.gov/vuln/search/results?isCpeNameSearch=false&query=directory+traversal&results_type=overview&form_type=Basic&search_type=all&startIndex=0) in the CVE database referring to directory traversal.  These attacks are at the root of some of the largest incidents, [Equifax](https://www.infosecinstitute.com/resources/hacking/equifax-breach-exploit/), and [Synology NAS](https://www.exploit-db.com/exploits/30475) devices, as well as popular tools like [Jenkins](https://www.securityweek.com/poc-published-for-critical-fortra-code-execution-vulnerability/).  Even applications meant to protect corporate data, [Fortinet](https://nvd.nist.gov/vuln/detail/CVE-2018-13379) and [Pulse Secure VPNs](https://www.tenable.com/cve/CVE-2019-11510), fell victim to these types of attacks.    There have been vulnerabilities in frameworks, like Apache Struts, used to create web applications, meaning those built with these frameworks are likely to be vulnerable; this is the root vulnerability of the Equifax breach. 

All the companies in the cases above have responded quickly to provide patches and other support to their customers to address the issues once discovered, but in many cases, the damage was done.  Zero day exploits travel through the hacker community much more quickly than the affected products can respond.  Even information for virtual patching, web application firewall rules to apply until the software can be updated and similar measures often arrive far too late.

The fundamental problem is that the authentication and authorization functions, those processes that make sure the user is who they say they are, and decide what they are allowed to do are part of the information system itself.  This allows an exploit to gain critical information from unauthenticated remote users. This of the worst kinds of vulnerabilities, as it is open to the entire network for potential exploitation, either publicly on an open site, or to malicious actors and APTs within enterprise environments.  [BrowZer](https://openziti.io/docs/learn/quickstarts/browzer/), a project of the OpenZiti project sponsored by NetFoundry, addresses this fundamental design issue by moving the authentication of the user completely outside of the actual information system only allowing authorized connections after authentication is complete.

## Browzer Breaks the Path

BrowZer allows a completely clientless connection to protected systems by dynamically loading into the web browser a package that creates a secure connection to assets protected by OpenZiti.  How is this different than Pulse Secure or Foritnet which also create secured tunnels?  The BrowZer agent is completely independent of the application it is placed in front of.  Once authenticated, using one of a multitude of authentication services, the system loads the client dynamically into the local browser and creates a new connection from that software to the OpenZiti network, which provides connectivity to the application.  This prevents any unauthenticated user from reaching the application in question.  Actors can't initiate a path traversal or other unauthenticated attack because it can't reach the actual application until the authentication and authorization have occurred.

![](/blogs/openziti/v1716219804073/1292c372-d81a-45d7-896f-9c0b6f2ef782.png)

[OpenZiti](https://openziti.io) is a software network overlay providing secure communication through a true network, with provisioning, monitoring, and highly granular communication permissions allowing microsegmentation and other Zero Trust features to be applied to networks and applications at a network connectivity level.  This allows for a common centralized platform to allow and monitor traffic throughout a dispersed network of applications, devices, users, and workloads.  BrowZer is one method of accessing the network's resources without having to control the system or application used to access it to load a client or embed into the software using the available SDKs.
