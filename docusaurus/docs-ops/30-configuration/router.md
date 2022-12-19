---
sidebar_label: Router
---

# Router Configuration Reference

OpenZiti uses configuration files for controllers that are in the [YAML](https://yaml.org/) format. All configuration
files are also subject to a set of [conventions](conventions.md) such as environment variable substitution, identity
sections, and addressing formats.

## Sections

The router configuration file has several top level configuration sections that group together
related configuration settings.

- [`ctrl`](#ctrl) - configuration for controller addressing/connections
- [`csr`](#csr) - certificate fields used during enrollment (SANs, CommonName, etc.)
- [`dialers`](#dialers) - configures dialers used when router termination is used to contact target services for overlay
  egress
- [`edge`](#edge) - edge specific configuration, required to enable edge functionality (e.g. edge SDK connectivity)
- [`forwarder`](#forwarder) - configures various forwarder settings (e.g. link latency probing, idle sessions, dial
  queues, etc.)
- [`healthChecks`](#healthChecks) - enables router health checks for controller connectivity
- [`identity`](#identity) - configures the certificates used for outbound client connections, server listening, and CA
  bundles
- [`link`](#link) - the type of link listeners available for incoming router link and outgoing router link connections
- [`listeners`](#listeners) - the interfaces, ports, and addresses exposed for connection by outside clients (e.g. edge
  SDK clients, non-edge connections)
- [`metrics`](#metrics) - configures metrics reporting
- [`trace`](#trace) - adds a peek handler to all router messaging for debug purposes
- [`transport`](#transport) - enables transport level configuration that affects all instances of specific transports
- [`profile`](#profile) - enables profiling of router memory and CPU statistics
- [`web`](#web) - configures API presentation exposure
- [`v`](#v) - A special section to note the version of the configuration file, only `v: 3` is currently supported

The standard OpenZit experience minimally requires the following sections:

- `ctrl`
- `csr`
- `dialers`
- `edge`
- `identity`
- `link`
- `listeners`
- `v`

Of those values, to start the controller only the `ctrl`, `v` and `identity` sections are required. Not specifying the
`csr` section will not allow the router to enroll or renew existing enrollments. Not including the `dialer` section will
not allow the router to connect to terminate services. Not including the `edge` section will start the controller in
"fabric only" mode and will not support any edge functionality or concepts (edge SDK connectivity). Not including the
`link` section will not allow the router to connect/dial or accept/host other routers for mesh establishment. Not
including the `listeners` configuration will not allow external connections to on-ramp connections over the mesh.

Example Minimum Router Configuration:

```yaml
v: 3

identity:
  cert: router.cert.pem
  server_cert: router.server.cert.pem
  key: router.key.pem
  ca: ca-chain.cert.pem

ctrl:
  endpoint: tls:127.0.0.1:6262

csr:
  country: US
  province: NC
  locality: Charlotte
  organization: OpenZiti
  organizationalUnit: Ziti
  sans:
    dns:
      - "localhost"
    ip:
      - "127.0.0.1"

dialers:
  - binding: udp
  - binding: transport

edge: { }

link:
  listeners:
    - binding: transport
      bind: tls:127.0.0.1:6002
      advertise: tls:127.0.0.1:6002
  dialers:
    - binding: transport

listeners:
  - binding: edge
    address: tls:0.0.0.0:3022
  - binding: transport
    address: tls:0.0.0.0:7099
```

### `ctrl`

The `ctrl` section configures how the router will connect to the controller.

- `endpoint` - (required) the address of the controller
- `bind` - (optional) the address of a local interface used to dial the controller address specified in `endpoint`
- `defaultRequestTimeout` - (optional) the amount of time use for controller connection timeouts (
  see [time units](conventions.md#time-units))
- `options` - a set of option which includes the below options and those defined
  in [channel options](conventions.md#channel)

Example:

```yaml
ctrl:
  endpoint: tls:127.0.0.1:6262
```

### `csr`

The `csr` section is used during router enrollment and enrollment extension. It specifies values that will be used
in the certificates that are the result of enrollment. This section is also present as a subsection under the `edge`
section.

Many of the values in this section are optional, however to accept connections from SDKs or other routers at least
one valid SAN must be provided.

- `country` - (optional) the subject information country field
- `province` - (optional) the subject information province field
- `locality` - (optional)  the subject information locality field
- `organization` - (optional)  the subject information organization field
- `organizationalUnit` - (optional)  the subject information organization unit field
- `sans` - (optional) - a subsection used to define Subject Alternate Names
    - `dns` - (optional) - an array of DNS SAN entries
    - `ip` - (optional) - an array of IP SAN entries
    - `uri` - (optional) - an array of URI SAN entries
    - `email`  - (optional) - an array of email SAN entries

Example:

```yaml
csr:
  country: US
  province: NC
  locality: Charlotte
  organization: OpenZiti
  organizationalUnit: Ziti
  sans:
    dns:
      - "localhost"
      - "test-network"
      - "test-network.localhost"
      - "ziti-dev-ingress01"
    email:
      - "admin@example.com"
    ip:
      - "127.0.0.1"
    uri:
      - "ziti://ziti-dev-router01/made/up/example"
```

### `dialers`

The `dialers` sections defines the configuration for dialers that are used to dial (connect) to services from routers.
Various dialers are supported and referenced by `binding` name. This section is an array of objects that configures
individual dialers specified by the property `binding`.

Example:

```yaml
dialers:
  - binding: binding1
    options:
      mtu: 1000
      #...options
  - binding: binding2
    options:
    #...options
  #...
```

The following dialer bindings that are supported in the `binding` field are:

- `proxy` - tbd
- `proxy_udp` - tbd
- `transport` - tbd
- `transport_udp` - tbd

Each dialer currently supports a number of [shared options](conventions.md#xgress-options)

### `edge`

The `edge` section contains configuration that pertain to edge functionality. At present, the only value in this section
is a `csr` section (that is duplicated by the root [`csr` section](#csr)). This section must be preset and empty to
enable edge functionality (e.g. SDK connectivity).

Example:

```yaml
edge: { }
```

### `forwarder`

The `forwarder` section controls options that affect how a router forwards payloads across links to other
routers within the mesh or egresses data to targeted services if the service is terminated by a router.

- `latencyProbeInterval` - (optional, 10,000) an integer representing the milliseconds to probe links for latency
- `latencyProbeTimeout` - (optional, 10,000) an integer representing the milliseconds to wait before giving up on a link
  latency probe
- `xgressCloseCheckInterval` - (optional, 5,000) an integer representing the milliseconds to wait before un-routing a
  circuit for due to idleness
- `xgressDialDwellTime` - (optional, 0) an integer representing the milliseconds to wait before dialing a service for
  egress
- `faultTxInterval` - (optional, 15,000) an integer representing the milliseconds to wait between checking for circuits
  that have faulted, 0=disabled
- `idleTxInterval` -  (optional, 60,000) an integer representing the milliseconds to wait between checks for confirming
  idle circuits are in use, 0=disabled
- `idleCircuitTimeout` - (optional, 60,000) an integer representing the milliseconds to wait before marking a circuit as
  idle and requesting a circuit confirmation
- `xgressDialQueueLength` - (optional, 1000) an integer between 1 and 10,000 that represents the maximum number of
  queued outgoing service dials
- `xgressDialWorkerCount` - (optional, 128) an integer between 1 and 10,000 that represents the maximum number of
  workers emptying the xgress dial queue
- `linkDialQueueLength` -  (optional, 1000) an integer between 1 and 10,000 that represents the maximum number of queued
  outgoing router link dials
- `linkDialWorkerCount` - (optional, 32) an integer between 1 and 10,000 that represents the maximum number of workers
  emptying the link dial queue

Example:

```yaml
forwarder:
  latencyProbeInterval: 1000
```

### `healthChecks`

The `healthChecks` sections allows configuration of router health checks performed. Health check status is available by
exposing the `health-checks` API in the `web` section.

- `ctrlPingCheck` - (optional) - configures controller health check pings
    - `interval` - (optional, 30s) - the frequency to ping the controller with connection checks
    - `timeout` - (optional, 15s) - the length of time to wait before giving up on a controller health ping
    - `initialDelay` - (optional, 15s) - the length of time to wait before starting controller health check pings

Example:

```yaml
healthChecks:
  ctrlPingCheck:
    interval: 30s
    timeout: 15s
    initialDelay: 15s
```

### `identity`

The identity section includes the default server certificate and private key used for services hosted by the router,
alternate server certificates and keys to support SNI on hosted services, client certificate and private key when making
connections, and the `ca` bundle that the controller will use when making connections to controllers and routers. See
the conventions that apply to all [identity](conventions.md#identity) sections for field level detail.

### `link`

The `link` section configures which protocols and ports are used to listen for incoming router mesh links via the
`listenes` subsection and which protocols are used to dial other routers via the `dialers` subsection. Dialers and
listeners use `binding` names which can be further configured in the [`transport` section](#transport). For both
"link listeners" and "link dialers", the `transport` `binding` is recommended.

The `listeners` subsection supports the same settings and option as in the [`listeners` section](#listeners).

The `dialers` subsection supports the same settings and option as in the [`dialers` section](#dialers).

Example:

```yaml
link:
  dialers:
    - binding: transport
  listeners:
    - binding: transport
      bind: tls:127.0.0.1:6004
      advertise: tls:127.0.0.1:6004
```

### `listeners`

Listeners configure different types of server logic and protocols to be "listened" for on the router. This includes
opening ports on one or more interfaces by specified in the `address` option. The `address` field is formatted according
to the [address conventions](conventions.md#addressing). If necessary to refer to the listener externally in
documents or payloads maintained outside the process, the `advertise` option will be used to format URLs or any
other address. The `advertise` value should be externally routable.

- `binding` - (required) the name of a [xgress component](conventions.md#xgress-components) that will provide the server
  side logic for the listener
- `bind` - (required) the [address](conventions.md#addressing) that the listener should listen on
- `advertise` (required) the `<host>:<port>` combination that external resources should use to reach this listener
- `costTags` - (optional) an array of tags used during link cost calculations
- `options` - (optional) options specified by the component specifically in addition to
  the [shared options](conventions.md#xgress-options)


```yaml
listeners:
  - binding: edge
    address: tls:0.0.0.0:3022
    options:
      advertise: 127.0.0.1:3022
```

### `metrics`

The `metrics` section controls how metrics are communicated to the connection controller.

- `reportInterval` - (optional, 1m) the interval of time to wait between crafting a new metrics message to be sent to the controller
- `messageQueueSize` - (optional, 10) the maximum number of buffered metrics messages allowed to be queued to send to the controller

```yaml
metrics:
  reportInterval: 1m
  messageQueueSize: 10
```

### `trace`

The `trace` section instructs the router to output incoming and outgoing messaging it receives. This setting is
useful for debugging purposes only and should not be enabled in production environments without careful consideration.

- `path` - (required) the file to output decoded messages to

```yaml
trace:
  path: /var/opt/open.ziti.router.trace
```

### `transport`

The `transport` section is for advanced configuration of underlay protocols. It currently only applies to an internally
tuned TCP protocol named Transwarp and is tuned using `westworld3` configuration options. This section should largely
be unnecessary outside of development.

```yaml
transport:
  westworld3:
    profile_version: 1
    tx_portal_min_sz: 16384
    tx_portal_max_sz: 1073741824
    instrument:
      name: metrics
      path: /tmp/westworld3
      snapshot_ms: 250
      enabled: true
```

### `profile`

The profile section allows for [CPU (pprof) and memory (memprof)](https://go.dev/blog/pprof) dumps to be created. CPU
profiling is buffered by the application's runtime and output to the designated file. Memory profiling allows the
interval memory profiling occurs at and is output. These settings are useful for debugging purposes only and should not
be enabled in production environments without careful consideration.

- `cpu` - (optional)
    - `path` - (required) the path to output the pprof data
- `memory` - (optional)
    - `path` - (required) the path to output the memprof data
    - `intervalMs` (optional) the frequency to output memprof data (default 15s)

```yaml
profile:
  cpu:
    path: /home/user1/tmp/ctrl.cpu.pprof
  memory:
    path: ctrl.memprof
    intervalMs: 150000
```

### `web`

The `web` section follows the [conventions of XWeb](conventions.md#xweb). The controller has the following APIs defined:

- `health-checks` - provides a health check API that allows remote parties to verify the health of the controller

Each API may have their own options, but currently do not.

### `v`

The `v` section is used to detect if the version file is supported by the OpenZiti binary read it. The current and only
supported value is "3".

```yaml
v: 3
```