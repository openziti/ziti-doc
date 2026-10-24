# Step 4: Grant access with policies

A service does nothing until policies say who may use it. There are two kinds:

- **Bind**: who may *host* the service (the Pi-hole's tunneler).
- **Dial**: who may *use* it (the clients).

Both match on attributes, so neither policy names an identity directly.

## Create the policies

```
ziti edge create service-policy dnslab-dns-bind Bind --service-roles '#dnslab-dns' --identity-roles '#dnslab-hosts'
ziti edge create service-policy dnslab-dns-dial Dial --service-roles '#dnslab-dns' --identity-roles '#dnslab-clients'
```

No identity has `dnslab-clients` yet. Step 5 tags the client with it.

In ZAC: Service Policies -> add. Pick the type, then type `#dnslab-dns` in services and `#dnslab-hosts` (or
`#dnslab-clients`) in identities.

Don't give the Pi-hole identity Dial on this service. If it could dial, its own tunneler would intercept traffic to
`192.168.1.53:53` on the Pi-hole itself and loop it through the overlay.

## The other two policies

Two more policy types decide which edge routers identities and services may use. The quickstart's defaults
(`#public` routers for `#all` identities, `#all` services on `#all` routers) already cover the lab, so there's
nothing to add here. If you removed those defaults, add an edge router policy and a service edge router policy for
`#dnslab-*` now.

## Check it works

The policy advisor checks every link in the chain for one identity and one service:

```
ziti edge policy-advisor services -q dnslab-dns dnslab-pihole
```

You want `OKAY` with Bind permission. On the Pi-hole, the tunneler picks up the new service within a few seconds:

```
sudo journalctl -u ziti-edge-tunnel --since "2 min ago" | grep dnslab-dns
```

Look for `hosting server_address[tcp:127.0.0.1:53] service[dnslab-dns]` and `bound successfully`.

On the controller, the service now has a terminator. That's the record of "someone is hosting this":

```
ziti edge list terminators 'service.name="dnslab-dns"'
```

## Done when

- [x] Bind and Dial policies exist
- [x] policy-advisor says `OKAY` for `dnslab-pihole` on `dnslab-dns`
- [x] A terminator exists for `dnslab-dns`
