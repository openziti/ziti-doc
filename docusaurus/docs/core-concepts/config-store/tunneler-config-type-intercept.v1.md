
# Tunneler Config Type intercept.v1

A Config of Config Type `intercept.v1` configures an intercepting Ziti tunneler as a proxy for a particular Ziti service.

## Examples

This Config instructs the tunneler to intercept any outgoing traffic with destination `tcp:acme.example.ziti:5000`. An intercepting tunneler provides a DNS nameserver that resolves authorized Ziti services' domain names.

```json
{
    "protocols": [
        "tcp"
    ],
    "addresses": [
        "acme.example.ziti"
    ],
    "portRanges": [
        {
            "low": 5000,
            "high": 5000
        }
    ]
}
```

This Config has not only a Ziti domain name destination `acme.ziti` for which traffic is intercepted, but also a wildcard domain and an IP subnet. Additionally, there is a range of destination ports for which all packets will be intercepted if their destination address also matches.

```json
{
    "addresses": [
        "acme.ziti",
        "*.dazzle.acme.ziti",
        "10.0.0.0/8"
    ],
    "portRanges": [
        {
            "low": 1025,
            "high": 1999
        }
    ],
    "protocols": [
        "tcp"
    ]
}
```

## Schema Reference

The JSON schema for this tunneler Config Type is maintained [in GitHub](https://github.com/openziti/edge/blob/main/tunnel/entities/intercept.v1.json).
