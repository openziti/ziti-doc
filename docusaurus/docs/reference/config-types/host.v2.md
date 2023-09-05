---
sidebar_label: host.v2
sidebar_position: 20
---

# The `Host.v2` Config Type

The `host.v2` configuration type defines how edge routers or tunnelers should create terminators and
health checks for the application endpoints that provide a service.

## Terminators

Each config can define one or more terminators. If a service is hosted by multiple servers, the
configuration can have a terminator defined for each hosting server.

For services with defined endpoints, the following three attributes are required:

* `address` - an IP or DNS address to connect to
* `port` - the network port to connect to
* `protocol` - tcp or udp

**Examples**

This service is hosted by one application server.

```json
{
  "terminators": [
    {
      "address": "192.168.100.1",
      "port": 80,
      "protocol": "tcp"
    }
  ]
}
```

This service is hosted by two application servers.

```json
{
  "terminators": [
    {
      "address": "192.168.100.1",
      "port": 80,
      "protocol": "tcp"
    },
    {
      "address": "192.168.100.2",
      "port": 80,
      "protocol": "tcp"
    }
  ]
}
```

Services that are forwarding traffic from an OpenZiti tunneling proxy may use the following
properties to indicate what should be forwarded:

* `forwardProtocol` - flag indicating that the protocol of the forwarded connection is to be used.
  Can only be set to true.
* `allowedProtocols` - the list of allowed protocols. Valid values include `tcp` and `udp`
* `forwardAddress` - flag indicating that the target address of the forwarded connection is to be
  used. Can only be set to true.
* `allowedAddresses` - the list of allowed addresses. Valid values include IPs, hostnames and CIDRs
* `forwardPort` - flag indicating that the target port of the forwarded connection is to be used.
  Can only be set to true.
* `allowedPortRanges` - the list of allowed port ranges.
    * Example: `allowedPortRanges: [ {"low" : 80, "high" : 80}, {"low" : 8080, "high" : 8090} ]`
* `allowedSourceAddresses` - list of addresses in IP, hostname or CIDR
    * hosting tunnelers establish local routes for the specified source addresses so binding will
      succeed

**Examples**

```json
{
  "terminators": [
    {
      "forwardAddress": true,
      "allowedAddresses": [
        "192.168.1.0/24",
        "10.0.0.1/16"
      ],
      "forwardPort": true,
      "allowedPorts": [
        {
          "low": "1024",
          "high": 2048
        }
      ],
      "forwardProtocol": true,
      "allowedProtocols": [
        "tcp",
        "udp"
      ]
    }
  ]
}
```

Note that not everything must be forwarded. For example the address is not forwarded in the example
below. The port and protocol are forwarded and the corresponding 'allow' is set, but the address is
statically set to '192.168.100.1

```json
{
  "terminators": [
    {
      "address": "192.168.100.1",
      "forwardPort": true,
      "allowedPorts": [
        {
          "low": "1024",
          "high": 2048
        }
      ],
      "forwardProtocol": true,
      "allowedProtocols": [
        "tcp",
        "udp"
      ]
    }
  ]
}
```

Health checks and listen options also can be specified for each terminator.

* `listenOptions` - Provides ways to customize the terminator
    * See the [full definition below](#listen-options)
* `portChecks` - TCP port health check definitions
    * See the [full definition below](#port-checks)
* `httpChecks` - HTTP health check definitions
    * See the [full definition below](#http-checks)

## Listen Options

* `bindUsingEdgeIdentity` - Associate the hosting terminator with the name of the hosting tunneler's
  identity. Setting this to 'true' is equivalent to setting 'identity=$tunneler_id.name'",
    * Boolean value, defaults to `false`
* `connectTimeout` - Timeout when making connections to the external server. Specified as a
  duration. Examples: `500ms`, `5s`, `1m`
* `cost` - Static cost of the terminator. Must be a value between 0 and 65535. Default to 0.
* `identity` - Associate the hosting terminator with the specified identity.
    * '$tunneler_id.name' resolves to the name of the hosting tunneler's identity.
    * '$tunneler_id.tag[tagName]' resolves to the value of the 'tagName' tag on the hosting
      tunneler's identity.
* `maxConnections` - Number of routers to create terminators on. Does not apply to hosting edge
  routers, only to SDK hosted tunnelers.
* `precedence` - Initial terminator precedence. Must be one of `default`, `required` or `failed`.
  Defaults to `default`.

**Example**

```json
{
  "terminators": [
    {
      "address": "192.168.100.1",
      "port": 80,
      "protocol": "tcp",
      "listenOptions": {
        "connectTimeout": "1s",
        "cost": 200,
        "precedence": "required"
      }
    }
  ]
}
```

## Health Checks

There are two kinds of health checks supported, port check and http checks.

### Port Checks

Port checks verify if a given port is accepting TCP connections. The check does not attempt to send
or receive any data. Port check definitions support the following properties:

* `address` - an IP or DNS address with port.
    * This field is required.
    * Example: `192.168.1.100:8080`
    * Example: `myserver.com:8080`
* `interval` - how often to run the health check.
    * This field is required.
    * Example: `5s` (5 seconds)
    * Example: `1m` (1 minute)
    * Example: `250ms` (250 milliseconds)
* `timeout` - the connection timeout. Uses same format as interval.
    * This field is required.
    * Example: `10s` (10 seconds)
* `actions` - how to react to health check result. Covered in more detail below.

### HTTP Checks

HTTP checks make a call to an HTTP endpoint, which may include submitting a static body and checking
the check results. HTTP check definitions support the following properties:

* `url` - the URL to connect to.
    * This field is required.
* `method` - the method to use. Valid values include `GET`, `PUT`, `POST`, `PATCH`.
    * This field is optional and defaults to `GET`.
* `body` - the data to submit in the body of the HTTP request.
    * This field is optional and defaults to an empty string.
* `expectStatus` - the response status code to expect. The check will fail if a different status
  code is encountered.
    * This field is optional and defaults to `200`.
* `expectInBody` - a string to expect in the status code response. The check will fail if the string
  is not found.
    * This field is optional. If not specified, the response body will not be checked.
* `interval` - how often to run the health check.
    * This field is required.
    * Example: `5s` (5 seconds)
    * Example: `1m` (1 minute)
    * Example: `250ms` (250 milliseconds)
* `timeout` - the connection timeout. Uses same format as interval.
    * This field is required.
    * Example: `10s` (10 seconds)
* `actions` - how to react to health check result. Covered in more detail below.

### Actions

Actions define how health checks results should be reacted to. Each check may have multiple actions.
Actions support the following properties:

* `trigger` - which kind of health check result to react to. Valid values include `pass`, `fail`
  and `change`.
    * This field is required
    * `change` is when the status changes from `pass` to `fail` or from `fail` to `pass`.
* `duration` - only trigger the action if the trigger state has existed for the given duration.
    * This field is optional. If not specified, the duration is not checked.
    * Example: `30s` (30 seconds)
    * Use with `change` trigger events is not recommended.
* `consecutiveEvents` - the number of consecutive results of the given trigger type before executing
  the action.
    * This field is optional and defaults to 1
    * Use with `change` trigger events is not recommended.
* `action` - the action to take when the conditions defined by `trigger`, `duration`
  and `consecutiveEvents` are met.
    * This field is required
    * Valid actions include:
        * `mark unhealthy` - sets the associated terminator's precedence to `failed`.
        * `mark healthy` - sets the associated terminator's precedence back from `failed` to its
          original value.
        * `increase cost N` - increases the cost of the associated terminator by `N`.
        * `decrease cost N` - decreases the cost of the associated terminator by `N`.
        * `send event` - causes a terminator event to be emitted from the controller. Useful for
          alerting or external integrations.

:::note

Although multiple health checks can be configured, it's best if the actions don't overlap. If
multiple health checks change the health status, the behavior when one check is passing and another
is failing is undefined. It should generally be safe to have multiple checks adjusting cost or
generating events.

:::

**Port Check Example**

This config will cause a port check to run against the service every five seconds. After the check
has failed twice in a row, the terminator will be marked failed. After the check has been passing
for a minute, the terminator will be restored to its original precedence.

```json
{
  "terminators": [
    {
      "address": "192.168.100.1",
      "port": 80,
      "protocol": "tcp",
      "portChecks": {
        "address": "192.168.100.1:80",
        "interval": "5s",
        "timeout": "1s",
        "actions": [
          {
            "trigger": "fail",
            "action": "mark unhealthy",
            "consecutiveEvents": 2
          },
          {
            "trigger": "pass",
            "duration": "1m",
            "action": "mark healthy"
          }
        ]
      }
    }
  ]
}
```