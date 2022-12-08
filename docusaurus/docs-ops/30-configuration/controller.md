---
sidebar_label: Controller
---

# Controller Configuration Reference

OpenZiti uses configuration files for controllers that are in the [YAML](https://yaml.org/) format.

## Conventions

The following conventions apply to multiple areas of the configuration file.

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
- `upd`
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
- `key` - (required) A string in the format of `<engine>:<value>` that defines a private key used for `cert` and `server_cert`
  if `server_key` is not defined
- `server_cert` -(optional) A string in the format of `<engine>:<value>` that defines a x509 certificate, if not defined `cert` is used
- `server_key` - (optional) A string in the format of `<engine>:<value>` that defines a private key for `server_cert`, if not
  defined `key` is used if `server_cert` is defined
- `ca` - (required) A string in the format of `<engine>:<value>` that defines x509 certificate chain used to define trusted CAs
- `alt_server_certs` - (optional) An array of objects with `server_cert` and `server_key` values use to add additional server
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

## Sections

The controller configuration file has several top level configuration sections that group together
related configuration settings.

- [`ctrl`](#ctrl) - define control channel listener
- [`db`](#db) - specifies database file location
- [`edge`](#edge) - configures edge specific functionality
- [`events`](#events) - allows configuration of event output
- [`healthChecks`](#healthchecks) - enables controller database health checks for transactions
- [`identity`](#identity) - configures the certificates used for outbound client connections, server listening, and CA
  bundles
- [`network`](#network) - set network level cost values
- [`profile`](#profile) - enables profiling of controller memory and CPU statistics
- [`trace`](#trace) - adds a peek handler to all controller messaging for debug purposes
- [`web`](#web) - configures API presentation exposure
- [`v` (version)](#version) - A special section to note the version of the configuration file, only `v: 3` is currently supported

The standard OpenZit experience minimally requires the following sections:

- `ctrl`
- `db`
- `identity`
- `edge`
- `web`

Of those values, to start the controller only the `ctrl`, `db`, and `identity` sections are required. However, not
including the `edge` section will start the controller in "fabric only" mode and will not support any edge functionality
or concepts (identities, JWT enrollment, 3rd Party CAs, policies, etc.). Not including the `web` section will result in
none of the REST APIs (Fabric Management API, Edge Client API, Edge Management API, Health Check API) being started.
Without the Edge and Fabric Management APIs running administration of the network will be impossible. Without the Edge
Client API running it will be impossible for Edge clients to connect to services.

Example Minimum Controller Configuration:

```yaml
v: 3

db: ctrl.db

identity:
  cert: ctrl-client.cert.pem
  server_cert: ctrl-server.cert.pem
  key: ctrl.key.pem
  ca: ca-chain.cert.pem

ctrl:
  listener: tls:127.0.0.1:6262

edge:
  enrollment:
    signingCert:
      cert: intermediate.cert.pem
      key: intermediate.key.pem


web:
  - name: all-apis-localhost
    bindPoints:
      - interface: 127.0.0.1:1280
        address: 127.0.0.1:1280
    apis:
      - binding: fabric
      - binding: edge-management
      - binding: edge-client
```

### `ctrl`

The `ctrl` section configures how the controller will listen for incoming connections from routers. This includes the
protocol(s) used for router connections and how those connections are managed.

- `listener` - (required) is in the format of `<protocol>:<interface>:<port>` format. The value set here must be
  resolvable by routers and correspond the routers `ctrl.endpoint` configuration value.
  See [addressing](#addressing).
- `options` - a set of optional connections options
    - `maxQueuedConnects` - (optional) the maximum number of connections to be accepted but awaiting initial messaging
    - `maxOutstandingConnects` - (optional) the maximum number of connection accepted and waiting for hello messaging to
      complete
    - `connectTimeoutMs` - (optional) the maximum number of milliseconds to wait for hello messaging to complete
        - `writeTimeout` - (optional)  the maximum amount of time to wait when writing data to a connection
    - `newListener` - (optional) an `<protocol>:<interface>:<port>` address that is sent to routers to indicate a
      controller address migration. Should only be specified when the new listener address is reachable as clients will
      begin to use the new value on restart

Example w/o Options:

```yaml
ctrl:
  listener: tls:127.0.0.1:6262
```

Example w/ Options:

```yaml
ctrl:
  listener: tls:127.0.0.1:6262
  options:
    maxQueuedConnects: 1000
    maxOutstandingConnects: 16
    connectTimeoutMs:       1000
   	writeTimeout: 15s
```

### `db`

The `db` section is a single scalar value that defines the path to the database file that the controller should use.
OpenZiti uses a file backed in memory database. This path may be on the same or different drive. This section is
required.

Example:

```yaml
db: /mnt/fast-drive/db/ctrl.db
```

### `edge`

The `edge` section instructs the controller to start the edge components. If the section is not defined, all edge
functionality will be disabled. This includes all features associated with identities (e.g. identity enrollment), 3rd
Party CAs, policies, edge router connections, posture checks, and more. It is highly unlikely that this section should
be omitted.

The `edge` section also has the following subsections:

- `api` - (required) defines API specific configuration
- `enrollment` - (required) defines enrollment specific configuration

Example Minimum Edge:

```yaml
edge:
  enrollment:
    signingCert:
      cert: intermediate.cert.pem
      key: intermediate.key.pem
```

Example Fully Defined:

```yaml
edge:
  api:
    activityUpdateInterval: 90s
    activityUpdateBatchSize: 250
    sessionTimeout - optional, default 10m
    sessionTimeout: 30m
    address: 127.0.0.1:1280
  enrollment:
    signingCert:
      cert: intermediate.cert.pem
      key: intermediate.key.pem
    edgeIdentity:
      duration: 5m
    edgeRouter:
      duration: 5m
```

#### `api`

The `api` section within the `edge` section defines API specific functionality.

- `activityUpdateInterval` - (optional) the interval used to buffer API Session usage notices
- `sessionTimeout` - (optional) The amount of time an Edge API Session remains alive after the last REST API Request was
  processed
  or the last Edge Router connection for an API Session was closed
- `address` - (required) the `<host>:<port>` combination that should be used to externally resolve to the Edge Client
  API

For `activityUpdateInterval`, Edge Routers report connected API Sessions periodically and the controller tracks REST API
requests. `activityUpdateInterval` defines the interval those updates are collated and buffered over. This is done to
reduce the number of database writes required to persist API Session activity data. During the interval period the
controller will buffer updates and flush at the end. Increasing this interval may increase the chance of unsaved updates
on controller crash or kill. Decreasing it will increase the frequency of database writes. The default should be
sufficient.

The `address` setting is unique as it must match the `address` in a `bindPoint` for the `edge-client` API. This is to
ensure that responses and data persisted outside the system can reach the controller. An example of this is
enrollment JWTs that contain the URL that is used to complete enrollment via the Edge Client API.

#### `enrollment`

The `enrollment` section under `edge` defines values that pertain specifically to identity and router enrollment. This
includes the certificate and private key used to sign certificates as well as enrolment JWT lifetimes.

The enrolment section has these subsection:

- `signingCert` - (required)  defines the certificate and key used to sign identity and router certificates
- `edgeIdentity` - (optional) controls identity enrollment options
- `edgeRouter` - (optional) controls router enrollment options

#### `signingCert`

An object defining the `cert` and `key` used to issue certificates to identities and routers.

- `cert` - (required) the x509 PEM formatted certificate used to sign certificate, must be a root or intermediate CA
- `key` - (required) the x509 PEM formatted private key used to sign certificates, must be the key for the certificate
  defined
  in `cert`

As this signing certificate will be the signer for all issued edge router certificates, it is important that all
enrolling identities and routers trust the PKI that issued the signing certificate. To have that happen the trust anchor
of the PKI the `signingCert` is a member of should be in the `ca` bundle defined in the controller's `identity` section.
The `ca` value is used as part of the trust bundle delivered to identities and routers during enrollment.

#### `edgeIdentity`

The `edgeIdentity` section controls the lifetime of identity enrollment JWTs. It has only one value:

- `duration` - (optional) the lifetime of identity enrollment JWTs

#### `edgeRouter`

The `edgeRouter` section controls the lifetime of router enrollment JWTs. It has only one value:

- `duration` - (optional) the lifetime of router enrollment JWTs

### `events`

The `events` section allows for the definition of multiple event loggers with their own handler and event subscriptions.
Handlers define the type, format, and destination for events. Subscriptions handle which events are routed to the
handler. This allows different events to be output in different manners or to different locations.

The `events` section is an array of named objects. The name (`jsonLogger` in the example below) is used for
configuration error output only. Each logger has a `subscriptions` and `handler` section. The `subscriptions` section is
an array of objects with fields associated with the event type. The list of valid event types and their options is as
follows:

- `edge.apiSessions`
    - `include` - a string or array of strings that specify which API session events to include ("created" and/or "
      deleted")
- `edge.entityCounts`
    - `interval` - the time interval to generate entity count events on (e.g. "5s", "5000ms", "1h")
- `edge.sessions`
    - `include` - a string or array of strings that specify which session events to include ("created" and/or "deleted")
- `fabric.circuits`
    - `include` - a string or array of strings that specify which circuit events to include ("created", "pathUpdated", "
      deleted", "failed")
- `fabric.links`
- `fabric.routers`
- `fabric.usage`
    - `version` - a string representing the value of the usage event to use ("2' or "3")
- `metrics`
    - `sourceFilter` - a regular expression to match the source name value on
    - `metricFilter` - a regular expression to match the metric name value on
- `services`

The `handler` section contains two or three properties depending on `type`:

- `type` - (required) the type of handler ("file" or "stdout")
- `format` - (required) the format of events for the `type` ("json" or "plain")
- `path` - (conditional) used the "file" `type`, the path of the output file

Example JSON File Logger:

```yaml
events:
  jsonLogger:
    subscriptions:
      - type: fabric.circuits
      - type: fabric.links
      - type: fabric.routers
      - type: fabric.terminators
      - type: metrics
        sourceFilter: .*
        metricFilter: .*
      - type: edge.sessions
      - type: edge.apiSessions
      - type: fabric.usage
      - type: services
      - type: edge.entityCounts
        interval: 5s
    handler:
      type: file
      format: json
      path: /tmp/ziti-events.log
```

### `healthChecks`

The `healthChecks` section configures how often health checking is performed. As of now, health checks are limited
to ensuring the internal database has not deadlocked by attempting to aquire a locking transaction on some interval.

- `boltCheck` - (optional) bbolt specific configuration
    - `interval` - (optional) how often to try entering a bolt read transaction, defaults to 30 seconds
    - `timeout` - (optional) how long to wait for a transaction before timing out, defaults to 15 seconds
    - `initialDelay` - (optional) how long to wait on startup before performing the first check, defaults to 15 secconds

```yaml
healthChecks:
  boltCheck:
    # How often to try entering a bolt read tx. Defaults to 30 seconds
    interval: 30s
    # When to timeout the check. Defaults to 15 seconds
    timeout: 15s
    # How long to wait before starting the check. Defaults to 15 seconds
    initialDelay: 15s
```

### `identity`

The identity section includes the default server certificate and private key used for services hosted by the controller,
alternate server certificates and keys to support SNI on hosted services, client certificate and private key when making
connections, and the `ca` bundle that the controller will use when making connections and when bootstrapping identities
and routers. See the general [identity](#identity-sections) over above.

### `network`

The `network` section sets network wide options.

- `minRouterCost` - (optional) the minimum router cost (default 10)
- `routerConnectionChurnLimit` -  (optional) how often a new connection from a router can take over for an existing
  connection (
  default 1m)

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
       path: /home/plorenz/tmp/ctrl.cpu.pprof
  memory:
    path: ctrl.memprof
    intervalMs: 150000
```

### `trace`

The `trace` section instructs the controller to output incoming and outgoing messaging it receives. This setting is
useful for debugging purposes only and should not be enabled in production environments without careful consideration.

- `path` - (required) the file to output decoded messages to

```yaml
trace:
  path: /var/opt/open.ziti.ctrl.trace
```

### `web`

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
  interfaces)
- `address` - (required) the host:port combination that external devices can use to reach the exposed interface (ip or
  host name)
- `newAddress` - (optional) when specified, `newAddress` will be sent to clients in the HTTP header `ziti-ctrl-address`

`newAddress` should only be specified when clients can use the new host:port combination to reach the specified APIs.
This setting is used to migrate APIs between ip/hostnames.

#### `apis`

The `apis` section defines which APIs will be hosted on this exposure. The controller has the following APIs defined:

- `health-checks` - provides a health check API that allows remote parties to verify the health of the controller
- `fabric` - the Fabric Management API which allows remote administration of a network
- `edge-management` - the Edge Management API which allows remote administration of a network's edge components (
  identities, policies, authentication, etc.)
- `edge-clietn` - the Edge Client API which allows clients to authenticate and request connections to services

Each API may have their own options, but currently do not.

#### `options`

- `idleTimeout` - (optional) the maximum amount of time to wait for the next request when keep-alives are enabled, if
  IdleTimeout is zero, the value of ReadTimeout is used
- `readTimeout` - (optional) the maximum duration for reading the entire request, including the body
- `writeTimeout`  - (optional) the maximum duration before timing out writes of the response, it is reset whenever a new
  request’s
  header is read
- `minTLSVersion` - (optional) the minimum TLS version to support (TLS1.1, TLS1.2, TLS1.3)
- `maxTLSVersion` - (optional) the maximum TLS version to support (TLS1.1, TLS1.2, TLS1.3)

### `v` (version) {#version}

The `v` section is used to detect if the version file is supported by the OpenZiti binary read it. The current and only
supported value is "3".
