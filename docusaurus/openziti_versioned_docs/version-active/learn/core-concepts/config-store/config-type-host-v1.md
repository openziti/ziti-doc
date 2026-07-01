# Tunneler Config Type `host.v1`

A Config of Config Type `host.v1` configures a hosting Ziti tunneler to forward connections to the destination server for a particular Ziti service.

## Examples

This Config forwards Ziti service traffic to a server known as `tcp:localhost:54321`. The server must be reachable at that destination from the network perspective of the device where the Ziti tunneler is running.

```text
{
    "address": "localhost",
    "port": 54321,
    "protocol": "tcp"
}
```

Rather than a static destination port, this Config forwards the Ziti service traffic to the same TCP port that the initiating client was connecting to as long as it falls within the range of allowed ports.

```text
{
    "address": "localhost",
    "forwardPort": true,
    "allowedPortRanges": [ { "low": 8000, "high": 8888 } ],
    "protocol": "tcp"
}
```

Rather than a static destination address, this Config forwards the Ziti service traffic to the same address that the initiating client was connecting to as long as it is in the list of allowed addresses.

```text
{
    "forwardAddress": true,
    "allowedAddresses": [
        "acme.ziti",
        "*.dazzle.acme.ziti",
        "10.0.0.0/8"
    ],
    "port": 8080,
    "protocol": "tcp"
}
```

## Schema Reference

The JSON schema for this tunneler Config Type is maintained [in GitHub](https://github.com/openziti/ziti/blob/main/tunnel/entities/host.v1.json).
