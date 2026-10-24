---
title: Tunneled DNS
sidebar_label: Tunneled DNS
---

# Tunneled DNS: use your home DNS server from anywhere

This lab puts a DNS server on your home LAN (a Pi-hole here) onto an OpenZiti overlay. Your laptop or phone then uses
it as its DNS server wherever it is: at home, on a hotspot, or on hotel Wi-Fi. You get the same ad blocking and the same
local names everywhere, and you never open port 53 to the internet.

## Why

A home DNS server only helps while you're on the home network. The usual ways to reach it from outside both have a
cost:

- **Port-forward 53 to it.** That makes it an open resolver on the internet, which attracts abuse and gives anyone a
  look at your local names.
- **A full VPN back home.** It works, but every packet goes home, and you have a VPN to run and secure.

With OpenZiti, only the DNS traffic goes over the overlay. Only enrolled identities with a Dial policy can reach it,
and the home network makes outbound connections only. Nothing listens on your public IP.

## How it works

1. The client keeps using the Pi-hole's LAN address (`192.168.1.53` in this lab) as its DNS server, at home or not.
2. The tunneler on the client intercepts traffic to that address on port 53 and sends it over the overlay.
3. A tunneler on the Pi-hole box hosts the service. It hands each query to the Pi-hole on `127.0.0.1:53`.
4. The answer comes back the same way.

Once that works, step 9 uses the same tunneler to reach your LAN web apps by name through one wildcard service.

## What you need

- An OpenZiti network with a controller and a public edge router. Step 1 checks it.
- A DNS server on your LAN. Its Linux host also runs `ziti-edge-tunnel`.
- At least one client: Windows, Linux, or Android.
- A network that can't reach your LAN, for the off-LAN tests. A phone hotspot works.

Everything the lab creates is named `dnslab-*`, so it's easy to find and delete later.

## Steps

1. [Set up your overlay network](./01-overlay.md)
2. [Put the DNS server on the overlay](./02-dns-server-identity.md)
3. [Create the DNS service](./03-dns-service.md)
4. [Grant access with policies](./04-policies.md)
5. [Enroll a client](./05-client.md)
6. [Point the client's DNS at the Pi-hole](./06-client-dns.md)
7. [Test from off your LAN](./07-off-lan-test.md)
8. [Cold start without a fallback resolver](./08-cold-start.md)
9. [Reach your LAN web apps through one wildcard service](./09-wildcard-web.md)

Then see [Going further](./10-going-further.md) for related setups from the Learn OpenZiti series.
