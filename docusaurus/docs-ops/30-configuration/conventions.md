---
sidebar_label: Conventions
sidebar_position: 10
---

# Conventions

The following conventions apply to multiple areas of the configuration files for routers and controllers.

### Addressing

Listening and dialing addresses in OpenZiti are in the format of `<protocol>:<ip-or-host>:<port>` format.

For servers that are listening `<ip-or-host>` should be the address of an interface to listen on or "0.0.0.0" for all
IPv4 interfaces or "::" for all IPv6 interfaces. `<port>` should be a valid port number that the server should listen
on.

For clients dialing a server the `<ip-or-host>` should be an IP address or hostname that resolves to the target
server. `<port>` should be the port the server is listening on.

For clients and server, the `<protocol>` section is the protocol used to host or initiate the connection. It may be one
of the following values, however `tls` is suggested for most scenarios.

- `tls`
- `tcp`
- `udp`
- `dtls`
- `ws`
- `wss`
- `transwarp`
- `transwarptls`

### Environment Variables

All values in the configuration file support environment variable replacement. The environment variables are sourced
from the scope of the executing process (i.e. controller, router). The syntax `${VARIABLE}` is used.

Example:

```yaml
db: ${ZITI_DATA}/db/ctrl.db
```

### Identity

OpenZiti uses a common framework for loading, storing, and processing certificate and private key configuration.
Identity sections all have a similar format. The use of the defined certificates is up to the implementing application.
So see their configuration sections for details on which values are utilized for what. This documentation provides an
overview useful to understand the "default" assumptions. These sections can be formatted as YAML (as is the case for the
router and controller configurations) or as JSON.

- `cert` - (required) A string in the format of `<engine>:<value>` that defines a x509 client certificate
- `key` - (required) A string in the format of `<engine>:<value>` that defines a private key used for `cert`
  and `server_cert`
  if `server_key` is not defined
- `server_cert` -(optional) A string in the format of `<engine>:<value>` that defines a x509 certificate, if not
  defined `cert` is used
- `server_key` - (optional) A string in the format of `<engine>:<value>` that defines a private key for `server_cert`,
  if not
  defined `key` is used if `server_cert` is defined
- `ca` - (optional) A string in the format of `<engine>:<value>` that defines x509 certificate chain used to define
  trusted CAs
- `alt_server_certs` - (optional) An array of objects with `server_cert` and `server_key` values use to add additional
  server
  certificates and keys not managed by OpenZiti (i.e. from public CAs like Let's Encrypt).

The `<engine>:<value>` format is used to define multiple different source types. If the `<engine>:` part is omitted, it
is assumed to be `file:`. The following engines are supported:

- `file` - indicates that `<value>` is the path to a file
- `pem` - indicates that `<value>` is an inline PEM string

Additional PKCS#11 engines such as `siometrics.so` and `authenta.so` may be used if the library are present on the host
machine. This allows for access to hardware backed private keys.

Example Identity Section (Client & Server use same key):

```yaml
identity:
  cert: "file:ctrl-client.cert.pem"
  server_cert: "pem:-----BEGIN CERTIFICATE-----\nMIIEtzCCAp+gAwIBAgICEA0wDQYJKoZIhvcNAQELBQAwgYsxCzAJBgNVBAYTAlVT..."
  key: ctrl.key.pem
  ca: ca-chain.cert.pem
  alt_server_certs:
    - server_cert: lets_encrypt.cert.pem
    - server_key: lets_encrypt.key.pem

```

### Channel

Channel sections control different ways in which connections behave. It is controlled by the
[channel](https://github.com/openziti/channel) library. Sections that invoke the channel library support the following
options section.

- `options` - a set of optional connections options
    - `maxQueuedConnects` - (optional) the maximum number of connections to be accepted but awaiting initial messaging
    - `maxOutstandingConnects` - (optional) the maximum number of connection accepted and waiting for hello messaging to
      complete
    - `connectTimeoutMs` - (optional) the maximum number of milliseconds to wait for hello messaging to complete
        - `writeTimeout` - (optional)  the maximum amount of time to wait when writing data to a connection

### Time Units

Configurations that do not specify a unit of time in their name, support a variety of human-readable time units. The
format supports single and combinations of values (e.g. `12s`, `5m20s`,  `2h30m22s`).

Supported units:

- `ns`
- `us` (or `µs`)
- `ms`
- `s`
- `m`
- `h`

### XWeb

The `web` section is powered by [XWeb](https://github.com/openziti/xweb). XWeb allows web APIs to be defined in code and
exposed on multiple interfaces/networks through configuration alone.

Example:

```yaml
web:
  - name: all-apis-localhost
    bindPoints:
      - interface: 127.0.0.1:1280
        address: 127.0.0.1:1280
        newAddress: localhost:1280
        identity:
          cert:                 ctrl-client.cert.pem
          server_cert:          ctrl-server.cert.pem
          key:                  ctrl.key.pem
          ca:                   ca-chain.cert.pem
    options:
      idleTimeout: 5000ms
      readTimeout: 5000ms
      writeTimeout: 100000ms
      minTLSVersion: TLS1.2
      maxTLSVersion: TLS1.3
    apis:
      - binding: health-checks
      - binding: fabric
      - binding: edge-management
      - binding: edge-client

```

The structure of the `web` section is an array of API exposure options:

```yaml
web:
  - name: API Exposure 1
    ...
  - name: API Exposure 2
    ...
```

Each exposure has the following configuration options:

- `name` - (required) a name used for logging and error messaging
- `bindPoints` - (required) the interfaces, external addresses, and migration address options for this exposure
- `apis` - (required) a list of APIs and their options from the list above
- `options` - (optional) a set of options used to tune HTTP/TLS

#### `bindPoints`

`bindPoints` are used to instruct XWeb on where to listen for new connections. Each exposure can have multiple bind
pints to have the same API listen on one or more interfaces/networks. Additionally, each interface listened on can have
its own external address and migration address.

- `interface` - (required) the interface and port to listen on ("0.0.0.0" for all IPv4 interfaces, "::" for all IPv6
  interfaces
- `identity` - (optional, root identity) the certificates and keys to use for TLS
- `address` - (required) the host:port combination that external devices can use to reach the exposed interface (ip or
  host name)
- `newAddress` - (optional) when specified, `newAddress` will be sent to clients in the HTTP header `ziti-ctrl-address`

`newAddress` should only be specified when clients can use the new host:port combination to reach the specified APIs.
This setting is used to migrate APIs between ip/hostnames.

#### `apis`

The `apis` section defines which APIs will be hosted on this exposure. Different OpenZiti components support different
APIs. See their documentation for a list of APIs supported.

#### `options`

- `idleTimeout` - (optional) the maximum amount of time to wait for the next request when keep-alives are enabled, if
  IdleTimeout is zero, the value of ReadTimeout is used
- `readTimeout` - (optional) the maximum duration for reading the entire request, including the body
- `writeTimeout`  - (optional) the maximum duration before timing out writes of the response, it is reset whenever a new
  request’s
  header is read
- `minTLSVersion` - (optional) the minimum TLS version to support (TLS1.1, TLS1.2, TLS1.3)
- `maxTLSVersion` - (optional) the maximum TLS version to support (TLS1.1, TLS1.2, TLS1.3)

### xgress Components

"xgress" is an internal OpenZiti set of components that facilitate ingress and egress traffic from the OpenZiti mesh
overlay network. Ingress traffic is handled by "listeners" and egress traffic is handled by "dialers". Internally,
xgress components may be developed that support listeners (ingress), dialers (egress), or both.

Each xgress components are referenced to by `binding` name. The following `binding` values are currently defined:

- `proxy` - listener only - allows ingress TCP connections to connect directly to a `service` defined in `options`
- `proxy_udp` - listener only - allows ingress UDP connections to connect directly to a `service` defined in `options`
- `transport` - listener, dialer - allows ingress TCP connections to request a circuit for a service and for traffic to
  dial to an underlay UDP service at a `<host>:<port>` address
- `transport_udp` - listener, dialer - allows ingress UDP connections to request a circuit for a service and for traffic
  to dial to an underlay UDP service at a `<host>:<port>` address
- `edge` - listener, dialer - allows multiplexed ingress connections from SDKs and connections to other SDKs hosting
  services, requires an `advertise` option in the `options` section to be defined for external linking

### xgress Options

Each xgress component can have its own options in addition to the following shared options:

- `mtu` - (optional, 640*1024) unused
- `randomDrops` - (optional, false) true/yes/on or false/no/off to randomly drop 1 in `drop1InN` payloads, used for testing only
- `drop1InN` - (optional, 100)  if `randomDrops` is enabled, will drop 1 in N payloads, used for testing only
- `txQueueSize` - (optional, 1) the number of transmit payload to queue
- `txPortalStartSize` - (optional, 16*1024) integer that sets the starting window sizes
- `txPortalMinSize` - (optional, 16*1024) integer that sets the minimum window size
- `txPortalMaxSize` - (optional, 4 * 1024 * 1024l) integer that sets the maximum window size
- `txPortalIncreaseThresh` - (optional, 224)  the number of successful transmits that triggers the window size to be
  scaled by `txPortalIncreaseScale`
- `txPortalIncreaseScale` - (optional, 1.0) the scale factor to increase the window size by
- `txPortalRetxThresh` - (optional, 64) the number of retransmissions that triggers the window size to be scaled
  by `txPortalRetxScale`
- `txPortalRetxScale` - (optional, 0.75) the factor used to scale the window size when `txPortalRetxThresh` is reached
- `txPortalDupAckThresh` - (optional, 64) the number of duplicate ACKs that triggers the window size to be scaled
  by `txPortalDupAckScale`
- `txPortalDupAckScale` - (optional, 0.9) the factor used to scale the window size when `txPortalDupAckScale` is reached
- `rxBufferSize` - (optional, 4*1024*1024) the size of the receive buffer
- `retxStartMs` - (optional, 200) the number of milliseconds to wait before attempting to retransmit
- `retxScale` - (optional, 1.5) the factor to scale `retxStartMs` based on RTT
- `retxAddMs` - (optional, 0) a number of milliseconds to add to `retxStartMs` when calculating new retransmission
  thresholds
- `maxCloseWaitMs` - (optional, 30s) the amount of time to wait for buffers to empty before closing a connection
- `getCircuitTimeout` - (optional, 30s)  the amount of time to wait for circuit creation
- `circuitStartTimeout` - (optional, 3m) the amount of time to wait for a circuit to start
- `connectTimeout` - (optional, 0s) the amount of time to wait for dialed connections to connect, 0/0s = OS default
