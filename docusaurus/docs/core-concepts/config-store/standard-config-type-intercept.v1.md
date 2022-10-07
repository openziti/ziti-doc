
# Standard Config Type intercept.v1

A Config of Config Type `intercept.v1` is used by a Ziti tunneler application to configure itself as a proxy for a particular Ziti service.

## Examples

This Config instructs the tunneler to capture any outgoing traffic with destination `tcp:acme.example.ziti:5000`. A tunneler that is running in proxy mode provides a Ziti nameserver that resolves domain names to intercept IP addresses.

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

This Config has not only a Ziti domain name destination `acme.ziti` for which traffic is captured, but also a wildcard domain and an IP subnet. Additionally, there is a range of destination ports for which all packets will be captured if their destination address also matches.

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

The JSON schema for this standard Config Type is maintained [in GitHub](https://github.com/openziti/edge/blob/main/tunnel/entities/intercept.v1.json).
