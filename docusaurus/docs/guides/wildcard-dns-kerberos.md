---
title: Wildcard DNS and Kerberos
sidebar_label: Wildcard DNS
---

### How to Tunnel Kerberos/Active Directory DNS Queries

Kerberos/AD domain members can communicate with their domain controller (DC) using a Ziti network. This involves forwarding DNS queries to the DC's nameservers with a Ziti service.

The Ziti tunneler's built-in nameserver behaves differently when it is listening for DNS queries that match a wildcard pattern. When it's listening for an exact match, only queries for record type A are considered. When it's listening for a wildcard pattern, e.g., `*.my.kerberos.domain.example.com`, queries of type A, MX, TXT, and SRV are considered. Only the least significant label of the query name may be a wildcard.

Any match for an A record is answered with an intercept IPv4 address that routes to the Ziti tunneler's network interface. Matching queries for record types MX, TXT, and SRV are proxied to the hosting tunneler. The hosting tunneler will then resolve the query according to its host's default resolver configuration. The response is then proxied back to the intercepting tunneler which will then respond to the original query.

The hosting tunneler's identity must have role attributes that match the Bind Service Policy that grants hosting permission for the Ziti service with a wildcard address. The hosting tunneler software can be `ziti-edge-tunnel` or `ziti router`. 

:::note
If you're hosting the wildcard service with the router software then it's also necessary for the router to be created with tunnel mode enabled and to declare a tunnel binding in the router's YAML config file.
:::
