---
sidebar_label: intercept.v1
sidebar_position: 10
---

# The `intercept.v1` config type

The `intercept.v1` configuration type defines what traffic an intercepting Ziti tunneler should capture and turn into
a connection to a Ziti service: which protocols, destination addresses, and ports to intercept, plus optional
controls for source address filtering, dial behavior, and source IP handling.

`intercept.v1` is the successor to the deprecated `ziti-tunneler-client.v1` config type and configures the client
side of a service. The corresponding hosting-side config types are [`host.v1`](./host_v1.md) and
[`host.v2`](./host_v2.md).

## Intercept configuration

An `intercept.v1` config requires the following three properties.

* `protocols`: the transport protocols to intercept.
  * Valid values include `tcp` and `udp`.
  * This field is required. At least one protocol must be specified.
* `addresses`: the destination addresses to intercept.
  * Valid values include IPs, DNS/Ziti hostnames, wildcard domains (e.g. `*.acme.ziti`), and CIDR
    (Classless Inter-Domain Routing) subnets.
  * This field is required. At least one address must be specified.
* `portRanges`: the destination port ranges to intercept, inclusive of both the `low` and `high` bounds.
  * This field is required. At least one range must be specified.
  * Example: `portRanges: [ {"low" : 80, "high" : 80}, {"low" : 8080, "high" : 8090} ]`

**Example**

This config intercepts TCP traffic to `acme.example.ziti` on port 5000:

```json
{
  "protocols": ["tcp"],
  "addresses": ["acme.example.ziti"],
  "portRanges": [
    { "low": 5000, "high": 5000 }
  ]
}
```

## Source address filtering

* `allowedSourceAddresses`: a list of source addresses allowed to use this intercept.
  * Valid values include IPs, hostnames, and CIDR subnets.
  * This field is optional. If not specified, connections from any source address can be intercepted.

**Example**

This config only intercepts connections originating from the `192.168.1.0/24` subnet or from `10.0.0.5`:

```json
{
  "allowedSourceAddresses": [
    "192.168.1.0/24",
    "10.0.0.5"
  ]
}
```

## Source IP

* `sourceIp`: the source IP (and optional `:port`) to spoof when the connection egresses from the hosting tunneler.
  * This field is optional.
  * `$tunneler_id.name` resolves to the name of the client tunneler's identity.
  * `$tunneler_id.tag[tagName]` resolves to the value of the `tagName` tag on the client tunneler's identity.
  * `$src_ip` and `$src_port` resolve to the source IP and port of the originating client connection.
  * `$dst_port` resolves to the port the client is trying to connect to.

## Dial options

* `dialOptions`: customizes how the intercepting tunneler dials the service.
  * This field is optional.
  * `connectTimeoutSeconds`: how long to wait for the dial to succeed.
    * This field is optional.
  * `identity`: dial a terminator with the specified identity.
    * This field is optional.
    * `$dst_protocol`, `$dst_ip`, and `$dst_port` resolve to the corresponding value of the destination address the
      client is dialing.

:::note

If `dialOptions` isn't specified at all, `connectTimeoutSeconds` defaults to 5. If `dialOptions` is specified but
`connectTimeoutSeconds` isn't, it defaults to 15.

:::

:::info

`dialOptions.identity` is the mechanism behind *addressable terminators*: it lets a service dial one specific bound
endpoint instead of an arbitrary one, by matching the `identity` configured on the corresponding
[`host.v1`](./host_v1.md) or [`host.v2`](./host_v2.md) terminator.

:::

**Example**

This config only intercepts connections from `192.168.1.0/24`, dials a terminator whose identity matches the
destination IP the client is trying to reach, and spoofs the egress source IP using the client tunneler's identity
name:

```json
{
  "protocols": ["tcp"],
  "addresses": ["10.0.0.0/8"],
  "portRanges": [
    { "low": 443, "high": 443 }
  ],
  "allowedSourceAddresses": [
    "192.168.1.0/24"
  ],
  "sourceIp": "$tunneler_id.name",
  "dialOptions": {
    "identity": "$dst_ip",
    "connectTimeoutSeconds": 10
  }
}
```

## Schema reference

The JSON schema for this tunneler config type is maintained
[in GitHub](https://github.com/openziti/ziti/blob/main/tunnel/entities/intercept.v1.json).
