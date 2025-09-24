---
title: "Private DNS on Windows"
seoTitle: "Private DNS on Windows using OpenZiti"
seoDescription: "A short article that discusses how the Ziti Desktop Edge for Windows from the OpenZiti project provides secure, authenticated DNS for users."
date: 2023-03-15T21:06:11Z
cuid: clfa69o4m000509lbe5qagw7h
slug: private-dns-on-windows
authors: [ClintDovholuk]
image: /blogs/openziti/v1678971944159/0a3cfe23-5f9a-4576-a89d-e272b3b360d4.png
tags: 
  - dns
  - security
  - windows
  - openziti
  - nrpt

---

OpenZiti's tunnelers have a killer feature, [a superpower](https://www.youtube.com/playlist?list=PLMUj_5fklasKF1oisSSuLwSzLVxuL9JbC), if you will: "Private" DNS. "Private DNS," I hear you ask with a subtle tone of disbelief, "what does *that* mean?" When you have an OpenZiti tunneler running on your system with one or more enrolled [identities](https://netfoundry.io/docs/openziti/learn/core-concepts/identities/overview/), it's likely those [services](https://netfoundry.io/docs/openziti/learn/core-concepts/services/overview/) have "intercepts" configured. Those intercepts are often in the form of some DNS entry and those DNS entries are only available to your system when OpenZiti is running. **That**, is what it means to have "Private DNS". These private DNS entries are valuable because they are only available to people who are authenticated and authorized to have them. If you're not authorized, you won't see the entry at all. That's very cool!

<!-- truncate -->

## How Private DNS works on Windows

Capturing DNS requests is somewhat tricky, as you might expect. Compounding the problem, each operating system works differently. To make matters worse, DNS is such a fundamental part of your (or your users') operating system, when you get it wrong, it's very disruptive! When DNS isn't working, it seems like your whole network doesn't work! (Depicted is Ziggy wondering why his network doesn't work because DNS is broken)

![](https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/png/Ziggy-has-a-Question-Closeup.png align="left")

So how does OpenZiti accomplish intercepting any DNS entry at all, including overriding existing DNS entries? We first tried to use the API provided by Microsoft for creating a VPN. That API was poorly documented, difficult to implement and didn't do exactly what we wanted. We had to find a better way, and we did! On the Windows operating system, we were able to successfully use a feature called the [Name Resolution Policy Table, or NRPT for short](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn593632(v=ws.11)).

## What is the NRPT

The NRPT is really neat. Through the NRPT, we can provide instructions to the operating system to send DNS requests matching a particular pattern to a particular nameserver. That is exactly what we need! If that's not clear enough, let's look at an example.

### An Example - RDP'ing to Mom's Computer

Last year I needed to do some remote work on my mother's computer. Instead of using one of the existing remote desktop solutions out there, I used OpenZiti. I didn't feel like trying to get my mother to download and install the **correct** app, the correct version, etc. I was able to send her an email with the exact link to install and a one-use token to use. Here's what I wanted to do:

![](/blogs/openziti/v1678898953353/2f0dff3a-bf7c-463e-9bc4-bcbeb4bac89c.png)

Once enrolled, her RDP service (and only her RDP service) was available to me via my OpenZiti overlay network. I defined a single service so I could use RDP to remote into her machine. To make it easy for me to remember, I defined a private DNS entry called "mom.rdp", I authorized my identity to dial and hers to host and then I was able to RDP to mom.rdp!

![](/blogs/openziti/v1678898585739/e840fe62-290a-482d-a7e5-2597e1d47c94.png)

In this example, I need my operating system to be able to resolve "mom.rdp" to an IP address so that my computer knows how to send data across the OpenZiti overlay.

## Using the NRPT

For Windows to be able to resolve "mom.rdp", a few things need to happen. As mentioned, we need an identity that has been enrolled with the [Ziti Desktop Edge for Windows (ZDEW)](https://github.com/openziti/desktop-edge-win/releases/latest). The identity also needs to have access (been authorized) to a service with an intercept configured for "mom.rdp". Once authorized, when the ZDEW notices it has a new service, it will run a [powershell command](https://github.com/openziti/ziti-tunnel-sdk-c/blob/ecc12ff3feaf2c0547928bcbe1880192bd0b4da3/programs/ziti-edge-tunnel/windows-scripts.c#L152) to add the entry to the NRPT using the commandlet named [Add-DnsClientNrptRule](https://learn.microsoft.com/en-us/powershell/module/dnsclient/add-dnsclientnrptrule?view=windowsserver2022-ps). Why a powershell command and not an API call? **GREAT QUESTION!** It's because Microsoft (at this time) does not provide one! Perhaps you can encourage Microsoft to provide an actual API people and projects like OpenZiti can invoke instead!

The NRPT rule does one specific thing. It instructs Windows that when you see a DNS request to a matching name, send it to this specific server. If you have a ZDEW running, you can see all your configured rules from the ZDEW by running [Get-DnsClientNrptPolicy](https://learn.microsoft.com/en-us/powershell/module/dnsclient/get-dnsclientnrptpolicy?view=windowsserver2022-ps)

Here's an edited snippet from my NRPT of the rule allowing me to RDP to my mother's computer:

```plaintext
Namespace                        : mom.rdp
...SNIP...
NameServers                      : 100.64.0.2
```

You can see that one of my identities is providing a private DNS entry of mom.rdp, and it instructs Windows to send any requests matching the namespace to the [nameserver](https://en.wikipedia.org/wiki/Name_server) located at 100.64.0.2.

### Local Nameserver

The NRPT has told Windows to send any DNS request to 100.64.0.2 if it matches mom.rdp exactly, but something needs to answer the DNS query. OpenZiti tunnelers all run a built-in nameserver to satisfy these requests. You'll find the nameserver at whatever the start of private IP space is configured to be, "plus 1". By default, the ZDEW will create and configure a local network interface at 100.64.0.1, so by adding one to that IP, you'll have a nameserver on 100.64.0.2.

We can test this too. We can use the built-in `nslookup` to make a query to the specific nameserver **or** we can use the PowerShell commandlet `DnsClient-ResolveName`. It's important to note that DNS tooling sometimes specifically avoids things like the NRPT! For example, if you use `nslookup`, **make sure** you provide the server to send the DNS request to. If you don't you might be surprised that it doesn't work!

Example of using `nslookup mom.rdp 100.64.0.2`:

```plaintext
nslookup mom.rdp 100.64.0.2
Server:  UnKnown
Address:  100.64.0.2

Non-authoritative answer:
Name:    mom.rdp
Address:  100.64.0.6
```

and Powershell's `Resolve-DnsName mom.rdpa`:

```plaintext
Resolve-DnsName mom.rdp

Name                                           Type   TTL   Section    IPAddress
----                                           ----   ---   -------    ---------
mom.rdp                                        A      60    Answer     100.64.0.6
```

# Conclusion

That's basically it. The Ziti Desktop Edge for Windows is responsible for managing the NRPT. It manages it using Powershell commands because there are no APIs available yet for an application to manipulate the NRPT at this time. When new services show up, we map all the private DNS entries to NRPT rules and run a small nameserver from the ZDEW to properly answer the DNS requests.

This technique is fairly well-known now, but when the ZDEW was first created back in late 2019, it wasn't quite as easy to discover. Maybe you've never heard or seen the NRPT and maybe you'll go check it out.
