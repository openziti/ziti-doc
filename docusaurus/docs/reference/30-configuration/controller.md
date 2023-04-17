---
sidebar_label: Controller
sidebar_position: 20
---

# Controller Configuration Reference

OpenZiti uses configuration files for controllers that are in the [YAML](https://yaml.org/) format. All configuration
files are also subject to a set of [conventions](conventions.md) such as environment variable substitution, identity
sections, and addressing formats.

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
- [`v`](#v) - A special section to note the version of the configuration file, only `v: 3` is currently supported

The standard OpenZiti experience minimally requires the following sections:

- `ctrl`
- `db`
- `identity`
- `edge`
- `web`
- `v`

Of those values, to start the controller only the `ctrl`, `db`, `v`, and `identity` sections are required. However, not
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
  See [addressing](./conventions.md#addressing).
- `options` - a set of option which includes the below options and those defined
  in [channel options](./conventions.md#channel)
    - `newListener` - (optional) an `<protocol>:<interface>:<port>` address that is sent to routers to indicate a
      controller address migration. Should only be specified when the new listener address is reachable as clients will
      begin to use the new value on restart

Example w/o options:

```yaml
ctrl:
  listener: tls:127.0.0.1:6262
```

Example w/ options:

```yaml
ctrl:
  listener: tls:127.0.0.1:6262
  options:
    maxQueuedConnects: 1000
    maxOutstandingConnects: 16
    connectTimeoutMs: 1000
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

- `cert` - (required) the x509 PEM formatted certificate of the CA that the controller will use to issue edge identity certificates 
- `key` - (required) the x509 PEM formatted private key for the certificate defined in `cert`

OpenZiti clients rely on the controller to provide a bundle of trusted certificates during enrollment. The bundle is specified by the `identity.ca` field and points to a file on the server containing the bundle of trusted certificates. The signing certificate must be included in this file.

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
an array of objects with fields associated with the event type. Specifying an event type will cause it to be output via
the defined handler. If an event type is omitted, it will not be output. The list of valid event types and their options
is as follows:

- `edge.apiSessions` - (optional) Edge API Session events
    - `include` - (optional) a string or array of strings that specify which API session events to include ("created"
      and/or "
      deleted")
- `edge.entityCounts` - (optional) Edge entity counts (API Sessions, sessions, routers, etc.)
    - `interval` - (optional) the time interval to generate entity count events on (e.g. "5s", "5000ms", "1h")
- `edge.sessions`  - (optional) Edge Session events
    - `include` - (optional) a string or array of strings that specify which session events to include ("created"
      and/or "deleted")
- `fabric.circuits`  - (optional) Fabric circuit events
    - `include` - (optional) a string or array of strings that specify which circuit events to include ("created", "
      pathUpdated", "
      deleted", "failed")
- `fabric.links` - - (optional) Fabric link events
- `fabric.routers` - (optional) Fabric router events
- `fabric.usage` - (optional) Fabric usage events
    - `version` - (optional) a string representing the value of the usage event to use ("2' or "3")
- `metrics` - (optional) - System-wide metrics
    - `sourceFilter` - (optional) a regular expression to match the source name value on
    - `metricFilter` - (optional) a regular expression to match the metric name value on
- `services` - (optional) Service events

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
to ensuring the internal database has not deadlocked by attempting to acquire a locking transaction on some interval.
Health check status is reported externally on the [`health-checks` API](#web).

- `boltCheck` - (optional) bbolt specific configuration
    - `interval` - (optional, 30s) how often to try entering a bolt read transaction
    - `timeout` - (optional, 15s) how long to wait for a transaction before timing out
    - `initialDelay` - (optional, 15s) how long to wait on startup before performing the first check

```yaml
healthChecks:
  boltCheck:
    interval: 30s
    timeout: 15s
    initialDelay: 15s
```

### `identity`

The identity section includes the default server certificate and private key used for services hosted by the controller,
alternate server certificates and keys to support SNI on hosted services, client certificate and private key when making
connections, and the `ca` bundle that the controller will use when making connections and when bootstrapping identities
and routers. See the conventions that apply to all [identity](conventions.md#identity) sections for field level detail.

### `network`

The `network` section sets network wide options.

- `minRouterCost` - (optional, 10) the minimum router cost
- `routerConnectionChurnLimit` -  (optional, 1m) how often a new connection from a router can take over for an existing connection
- `intervalAgeThreshold` - (optional, 80s) the interval at which metrics are batched for reporting
- `metricsReportInterval` - (optional, 1m) the frequency at which metrics are reported

### `profile`

The profile section allows for [CPU (pprof) and memory (memprof)](https://go.dev/blog/pprof) dumps to be created. CPU
profiling is buffered by the application's runtime and output to the designated file. Memory profiling allows the
interval memory profiling occurs at and is output. These settings are useful for debugging purposes only and should not
be enabled in production environments without careful consideration.

- `cpu` - (optional)
  - `path` - (required) the path to output the pprof data
- `memory` - (optional)
  - `path` - (required) the path to output the memprof data
  - `intervalMs` (optional, 15s) the frequency to output memprof data

```yaml
profile:
  cpu:
    path: /home/user1/tmp/ctrl.cpu.pprof
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

The `web` section follows the [conventions of XWeb](conventions.md#xweb). The controller has the following APIs
defined:

- `health-checks` - provides a health check API that allows remote parties to verify the health of the controller
- `fabric` - the Fabric Management API which allows remote administration of a network
- `edge-management` - the Edge Management API which allows remote administration of a network's edge components (
  identities, policies, authentication, etc.)
- `edge-client` - the Edge Client API which allows clients to authenticate and request connections to services

Each API may have their own options, but currently do not.

### `v`

The `v` section is used to detect if the version file is supported by the OpenZiti binary read it. The current and only
supported value is "3".

```yaml
v: 3
```
