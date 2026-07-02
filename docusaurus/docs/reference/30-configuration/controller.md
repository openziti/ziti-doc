---
sidebar_label: Controller
sidebar_position: 20
toc_max_heading_level: 4
---

# Controller configuration reference

OpenZiti uses configuration files for controllers that are in the [YAML](https://yaml.org/) format.
All configuration files are also subject to a set of [conventions](conventions.md) such as
environment variable substitution, identity sections, and addressing formats.

## Sections

The controller configuration file has several top level configuration sections that group together
related configuration settings.

- [`ctrl`](#ctrl) - define control channel listener
- [`cluster`](#cluster) - allows configuring the controller in an controller cluster
- [`db`](#db) - specifies database file location
- [`edge`](#edge) - configures edge specific functionality
- [`events`](#events) - allows configuration of event output
- [`healthChecks`](#healthchecks) - enables controller database health checks for transactions
- [`identity`](#identity) - configures the certificates used for outbound client connections, server
  listening, and CA bundles
- [`network`](#network) - set network level cost values
- [`profile`](#profile) - enables profiling of controller memory and CPU statistics
- [`trace`](#trace) - adds a peek handler to all controller messaging for debug purposes
- [`web`](#web) - configures API presentation exposure
- [`v`](#v) - A special section to note the version of the configuration file, only `v: 3` is
  currently supported

The standard OpenZiti experience minimally requires the following sections:

- `ctrl`
- `db` or `cluster`
- `identity`
- `edge`
- `web`
- `v`

Of those values, to start the controller only the `ctrl`, `db` or `cluster`, `v`, and `identity`
sections are required. However, not including the `edge` section will start the controller in "
fabric only" mode and will not support any edge functionality or concepts (identities, JWT
enrollment, 3rd-party CAs, policies, etc.). Not including the `web` section will result in none of
the REST APIs (fabric management API, edge client API, edge management API, health check API) being
started. Without the edge and fabric management APIs running administration of the network will be
impossible. Without the edge client API running it will be impossible for Edge clients to connect to
services.

Example Minimum Controller Configuration:

```text
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

The `ctrl` section configures how the controller will listen for incoming connections from routers.
This includes the protocol(s) used for router connections and how those connections are managed.

- `listener` - (required) is in the format of `<protocol>:<interface>:<port>` format. The value set
  here must be resolvable by routers and correspond the routers `ctrl.endpoint` configuration value.
  See [addressing](./conventions.md#addressing).
- `options` - a set of option which includes the below options and those defined
  in [channel options](./conventions.md#channel)
  - `advertiseAddress` - (required when controller clustering is enabled) - configures the address at which this
    controller should be reachable by other controllers in the cluster
  - `newListener` - (optional) an `<protocol>:<interface>:<port>` address that is sent to routers
        to indicate a controller address migration. Should only be specified when the new listener
        address is reachable as clients will begin to use the new value on restart
  - `peerHeartbeats` - (optional) set of options for configuring heartbeats to other controllers in
    the cluster. See [heartbeats](./conventions.md#heartbeats).
  - `routerHeartbeats` - (optional) set of options for configuring heartbeats to routers.
    See [heartbeats](./conventions.md#heartbeats).

Example w/o options:

```text
ctrl:
  listener: tls:127.0.0.1:6262
```

Example w/ options:

```text
ctrl:
  listener: tls:127.0.0.1:6262
  options:
    maxQueuedConnects: 1000
    maxOutstandingConnects: 16
    connectTimeoutMs: 1000
    writeTimeout: 15s
```

### `db`

The `db` section is a single scalar value that defines the path to the database file that the
controller should use. OpenZiti uses a file backed in memory database. This path may be on the same
or different drive. This section is required.

Example:

```text
db: /mnt/fast-drive/db/ctrl.db
```

### `edge`

The `edge` section instructs the controller to start the edge components. If the section is not
defined, all edge functionality will be disabled. This includes all features associated with
identities (e.g. identity enrollment), 3rd-party CAs, policies, edge router connections, posture
checks, and more. It is highly unlikely that this section should be omitted.

The `edge` section also has the following subsections:

- `api` - (required) defines API specific configuration
- `enrollment` - (required) defines enrollment specific configuration

Example Minimum Edge:

```text
edge:
  enrollment:
    signingCert:
      cert: intermediate.cert.pem
      key: intermediate.key.pem
```

Example Fully Defined:

```text
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
- `sessionTimeout` - (optional) The amount of time an edge API Session remains alive after the last
  REST API Request was processed or the last edge router connection for an API Session was closed
- `address` - (required) the `<host>:<port>` combination that should be used to externally resolve
  to the edge client API

For `activityUpdateInterval`, Edge Routers report connected API Sessions periodically and the
controller tracks REST API requests. `activityUpdateInterval` defines the interval those updates are
collated and buffered over. This is done to reduce the number of database writes required to persist
API Session activity data. During the interval period the controller will buffer updates and flush
at the end. Increasing this interval may increase the chance of unsaved updates on controller crash
or kill. Decreasing it will increase the frequency of database writes. The default should be
sufficient.

The `address` setting is unique as it must match the `address` in a `bindPoint` for
the `edge-client` API. This is to ensure that responses and data persisted outside the system can
reach the controller. An example of this is enrollment JWTs that contain the URL that is used to
complete enrollment via the edge client API.

#### `enrollment`

The `enrollment` section under `edge` defines values that pertain specifically to identity and
router enrollment. This includes the certificate and private key used to sign certificates as well
as enrolment JWT lifetimes.

The enrolment section has these subsection:

- `signingCert` - (required)  defines the certificate and key used to sign identity and router
  certificates
- `edgeIdentity` - (optional) controls identity enrollment options
- `edgeRouter` - (optional) controls router enrollment options

#### `signingCert`

An object defining the `cert` and `key` used to issue certificates to identities and routers.

- `cert` - (required) the x509 PEM formatted certificate of the CA that the controller will use to
  issue edge identity certificates
- `key` - (required) the x509 PEM formatted private key for the certificate defined in `cert`

OpenZiti clients rely on the controller to provide a bundle of trusted certificates during
enrollment. The bundle is specified by the `identity.ca` field and points to a file on the server
containing the bundle of trusted certificates. The signing certificate must be included in this
file.

#### `edgeIdentity`

The `edgeIdentity` section controls the lifetime of identity enrollment JWTs. It has only one value:

- `duration` - (optional) the lifetime of identity enrollment JWTs

#### `edgeRouter`

The `edgeRouter` section controls the lifetime of router enrollment JWTs. It has only one value:

- `duration` - (optional) the lifetime of router enrollment JWTs

### `events`

See [the events reference](../50-events.mdx) for a full description of each event type.

**Note:** Many of the event type names changed in OpenZiti v1.4.0. See the events reference
for old namespaces.

The `events` section allows for the definition of multiple event loggers with their own handler and
event subscriptions. Handlers define the type, format, and destination for events. Subscriptions
handle which events are routed to the handler. This allows different events to be output in
different manners or to different locations.

The `events` section is an array of named objects. The name (`jsonLogger` in the example below) is
used for configuration error output only. Each logger has a `subscriptions` and `handler` section.
The `subscriptions` section is an array of objects with fields associated with the event type.
Specifying an event type will cause it to be output via the defined handler. If an event type is
omitted, it will not be output. The list of valid event types and their options is as follows:

- `apiSession` - (optional) edge API Session events
    - `include` - (optional) a string or array of strings that specify which API session events to
      include ("created"
      and/or "
      deleted")
- `circuit`  - (optional) Fabric circuit events
    - `include` - (optional) a string or array of strings that specify which circuit events to
      include ("created", "
      pathUpdated", "
      deleted", "failed")
- `cluster` - (optional) cluster events, emitted when there are changes to state of an HA controller cluster
- `connect` - (optional) connect events, emitted when connetions are made to controllers and routers
- `entityChange` - (optional) entity change events, emitted when there are changes to the data model
- `entityCount` - (optional) edge entity counts (API Sessions, session entities, routers, etc.)
    - `interval` - (optional) the time interval to generate entity count events on (e.g. "5s", "
      5000ms", "1h")
- `link` - - (optional) Fabric link events
- `metrics` - (optional) - System-wide metrics
    - `sourceFilter` - (optional) a regular expression to match the source name value on
    - `metricFilter` - (optional) a regular expression to match the metric name value on
- `router` - (optional) Fabric router events
- `sdk` - (optional) emitted when an sdk's connectivity to routers changes.
- `session`  - (optional) Session events
    - `include` - (optional) a string or array of strings that specify which Session events to
      include ("created"
      and/or "deleted")
- `service` - (optional) Service events
- `terminator` - (optional) emitted at various points in the terminator lifecycle
- `usage` - (optional) Fabric usage events
    - `version` - (optional) a string representing the value of the usage event to use ("2' or "3")

The properties in the `handler` section depend on handler `type` (one of `file`, `stdout`,
or `amqp`):

- common properties for all handler types
    - `format` - (required) the format of events for the `type` (`json` or `plain`)
- type `file`
    - `path` - (conditional) used the "file" `type`, the path of the output file
- type `amqp`: note that queue and consumer options must match
    - `url` (required) the URL of the AMQP broker to connect to
    - `queue` (required) the name of the queue to publish events to
    - `durable` (optional) whether the queue should be durable between broker runs (default: true)
    - `autoDelete` (optional) whether the queue should be deleted when there are no consumers (
      default: false)
    - `exclusive` (optional) whether the queue should be exclusive to a single consumer (default:
      false)
    - `noWait` (optional) whether the controller should wait for the queue to confirm receipt of
      messages (default: false)

Example JSON File Logger:

```text
events:
  jsonLogger:
    subscriptions:
      - type: circuit
      - type: link
      - type: router
      - type: terminator
      - type: metric
        sourceFilter: .*
        metricFilter: .*
      - type: session
      - type: apiSession
      - type: usage
      - type: service
      - type: entityCount
        interval: 5s
    handler:
      type: file
      format: json
      path: /tmp/ziti-events.log
```

Example amqp Logger:

```text
events:
  amqpLogger:
    subscriptions:
      - type: usage
        interval: 5s
    handler:
      type: amqp
      format: json
      url: amqp://guest:guest@localhost:5672
      queue: ziti-events
      durable: true
      autoDelete: false
      exclusive: false
      noWait: false
```

Example standard output logger for change events on all entity types.

```text
events:
  stdoutLogger:
    subscriptions:
      - type: entityChange
        include:
          - apiSessionCertificates
          - apiSessions
          - authenticators
          - authPolicies
          - cas
          - configs
          - configTypes
          - controllers
          - edgeRouterPolicies
          - enrollments
          - eventualEvents
          - externalJwtSigners
          - identities
          - identityTypes
          - mfas
          - postureChecks
          - postureCheckTypes
          - revocations
          - routers
          - serviceEdgeRouterPolicies
          - servicePolicies
          - services
          - sessions
          - terminators
    handler:
      type: stdout
      format: json
```

### `healthChecks`

The `healthChecks` section configures how often health checking is performed. As of now, health
checks are limited to ensuring the internal database has not deadlocked by attempting to acquire a
locking transaction on some interval. Health check status is reported externally on
the [`health-checks` API](#web).

- `boltCheck` - (optional) bbolt specific configuration
    - `interval` - (optional, 30s) how often to try entering a bolt read transaction
    - `timeout` - (optional, 15s) how long to wait for a transaction before timing out
    - `initialDelay` - (optional, 15s) how long to wait on startup before performing the first check

```text
healthChecks:
  boltCheck:
    interval: 30s
    timeout: 15s
    initialDelay: 15s
```

### `identity`

The identity section includes the default server certificate and private key used for services
hosted by the controller, alternate server certificates and keys to support SNI on hosted services,
client certificate and private key when making connections, and the `ca` bundle that the controller
will use when making connections and when bootstrapping identities and routers. See the conventions
that apply to all [identity](conventions.md#identity) sections for field level detail.

### `network`

The `network` section sets network wide options.

- `createCircuitRetries` - (optional, 2) How many times the controller will attempt to create a
  given circuit before giving up. Since subsequent tries will generally try a different path if one
  exists, retries can succeed where previous attempts failed
- `cycleSeconds` - (optional, 60) How often to run smart routing calculations, clean up failed links
  and (if legacy link management is enabled) to look for new links to establish. Note that the
  controller will also look for new links whenever routers connect or disconnect
- `enableLegacyLinkMgmt` - (optional, true) Determines whether the controller will attempt to manage
  links for older routers which don't manage their own links
- `initialLinkLatency` - (optional, 65s) The latency to use for new links, before the initial link
  latency is reported. It's recommended to use a higher value so that new traffic doesn't
  immediately use the new link, before the quality is know. If the link is the only option, a high
  latency won't prevent its use
- `intervalAgeThreshold` - (optional, 80s) how old a batch of metrics must be before it's eligible
  to be emitted
- `metricsReportInterval` - (optional, 1m) the frequency at which controller metrics events are
  emitted
- `minRouterCost` - (optional, 10) the minimum router cost
- `routerConnectionChurnLimit` -  (optional, 1m) how often a new connection from a router can take
  over for an existing connection
- `routerMessaging` - (optional)
    - `maxWorkers`- (optional, 100) Max workers sending router state messages from the controller to
      routers. If the queue is full, the message will be retried later
    - `queueSize` - (optional, 100) Max queue size for router state messages being sent from the
      controller to the router. If the queue is full, the message will be retried later
- `routeTimeoutSeconds` - (optional, 10s) - how to long to wait before considering a circuit
  creation as timed out
- `smart` - (optional)
    - `minCostDelta` - (optional, 15) minimum change in cost between old circuit path and new
      circuit path before allowing the circuit to be rerouted. Helpful to prevent circuit flapping
      when there are paths with negligable differences in cost
    - `rerouteCap` - (optional, 4) maximum number of circuits to reroute during any given cycle
      (see `cycleSeconds` above)
    - `rerouteFraction` - (optional, 0.02) Maximum fraction of circuits to reroute during any given
      cycle (see `cycleSeconds` above)

### `profile`

The profile section allows for [CPU (pprof) and memory (memprof)](https://go.dev/blog/pprof) dumps
to be created. CPU profiling is buffered by the application's runtime and output to the designated
file. Memory profiling allows the interval memory profiling occurs at and is output. These settings
are useful for debugging purposes only and should not be enabled in production environments without
careful consideration.

- `cpu` - (optional)
    - `path` - (required) the path to output the pprof data
- `memory` - (optional)
    - `path` - (required) the path to output the memprof data
    - `intervalMs` (optional, 15s) the frequency to output memprof data

```text
profile:
  cpu:
    path: /home/user1/tmp/ctrl.cpu.pprof
  memory:
    path: ctrl.memprof
    intervalMs: 150000
```

### `cluster`

The cluster section enables running multiple controllers in a cluster.

- `commandHandler` - (optional)
    - `maxQueueSize` - (optional, 250) how many pending raft journal entries the controller will
      buffer for processing before the adaptive rate limiter starts rejecting incoming commands.
      The right value balances burst tolerance against responsiveness under load: a larger queue
      absorbs more bursts without rejecting, but commands can sit in the queue long enough to go
      stale (an update applied minutes after it was submitted may no longer reflect the operator's
      intent), and the cluster takes longer to surface "I'm overloaded" back to the caller. A
      smaller queue fails fast under sustained load. Watch `raft.rate_limiter.queue_size`: a queue
      that's consistently full means either you need more buffer or your load is genuinely beyond
      what the cluster can apply.
- `commitTimeout` - (optional, 50ms) how long the leader should wait without receiving an Apply
  before sending an AppendEntry message to followers to ensure that log entries are committed in a
  reasonable time frame. This is the timer that bumps along pending writes on a low-activity
  cluster: under normal write load, AppendEntries are sent continually as Apply calls happen, and
  this timer never fires. Due to random staggering, the actual interval can extend to as much as
  2x this value. The default keeps writes responsive without flooding followers with empty
  heartbeats; raise it slightly to reduce per-write network chatter on a quiet cluster, or lower
  it if you want the leader to be more aggressive about pushing out pending writes during write
  lulls.
- `dataDir` - (required) directory in which to store the bolt DB, the raft journal and snapshots
- `electionTimeout` - (optional, 5s) how long a candidate will spend trying to win an election
  before giving up and starting a fresh attempt. After `heartbeatTimeout` trips and a follower
  becomes a candidate, the candidate sends RequestVote RPCs, waits for responses, and if it hasn't
  either won the election or seen a new leader within this window, it abandons the current attempt
  and starts over. The default is comfortable for typical intra-region and same-continent voter
  placements. Raise it if you see repeated election attempts failing to complete in the cluster
  events (a sign that elections are timing out before they can finish on a high-latency or lossy
  network); changes here are independent of changing how quickly the cluster *notices* a leader
  is gone -- that's governed by `heartbeatTimeout`.
- `heartbeatTimeout` - (optional, 3s) how long followers will wait without communications from
  the leader before starting a leader election. This is the primary leaderless-detection timer:
  a healthy cluster never trips it except briefly during a real leader transition. Tuning it
  tunes how quickly the cluster reacts to a leader becoming unreachable. The default is
  comfortable for typical intra-region and same-continent voter placements. Raise it if your
  network has occasional latency spikes longer than 3s that trigger spurious elections; lower it
  if you can guarantee tight voter-to-voter latency and want faster recovery from a real leader
  loss. Setting it close to the actual network round-trip will cause elections to fire on normal
  jitter.
- `leaderLeaseTimeout` - (optional, 3s) how long a leader will keep leadership before stepping
  down, when it's unable to reach a quorum of nodes in the cluster. This is the safety valve that
  prevents a leader from continuing to serve writes when it's been isolated from the majority of
  the cluster: if the leader hasn't heard back from a quorum within this window, it voluntarily
  steps down so the majority side can elect a new leader. Tune it together with `heartbeatTimeout`
  and `electionTimeout`; setting it longer than `electionTimeout` defeats the purpose, and setting
  it very short makes leadership flap on transient network blips. Default works for typical
  placements.
- `logLevel` - (optional) The minimum level of raft log messages to emit. If unset, raft uses its
  library default.
- `logFile` - (optional) If not specified, raft log messages will be emitted along with all other
  ziti log messages. If specified, raft log messages will be emitted to the given log file.
- `maxAppendEntries` - (optional, 64) maximum number of log entries the leader will pack into a
  single AppendEntries RPC to a follower. Trades RPC efficiency against wasted work on rejection:
  a larger batch reduces the number of RPCs needed to bring a lagging follower current, but if
  the follower's log is divergent and rejects the batch (the leader then needs to find the
  divergence point and resend), more data is wasted per failed attempt. The default is
  well-balanced for typical workloads. Consider raising it if you frequently see followers
  catching up after long disconnects on a clean network and want fewer round-trips; consider
  lowering it if you have very tight latency targets or have observed frequent log divergence
  during recovery.
- `preferredLeader` - (optional, false) - If true, this node is marked as a preferred leader. A
  non-preferred leader will automatically transfer leadership to a preferred peer when one is
  available. Useful for steering leadership toward a specific voter, such as one co-located with
  ops or in a chosen region.
- `restartSelfOnSnapshot` - (optional, false) - Controls behavior after applying a raft snapshot
  received from the leader. Applying a snapshot replaces the underlying bolt DB and requires a
  controller restart. If true, the controller restarts itself in-process. If false, the controller
  exits; a process manager is expected to restart it.
- `snapshotInterval` - (optional, 2m) how often to check whether a new snapshot needs to be made.
  Actual checks happen at a random point between `snapshotInterval` and 2 x `snapshotInterval`
  (the jitter prevents every controller from snapshotting at the same wall-clock moment). A
  snapshot is only created if at least `snapshotThreshold` new log entries have accumulated since
  the last one, so `snapshotInterval` bounds how stale a snapshot can be on a busy cluster, not
  how often snapshots actually get taken. This is a cluster-wide value and should be consistent
  across nodes in the cluster. Otherwise the value from the most recently started controller will
  win.
- `snapshotThreshold` - (optional, 500) minimum number of new log entries before a new snapshot
  will be created. Trades snapshot frequency against journal size: a lower threshold means more
  frequent snapshots and a smaller journal on disk, but more I/O spent on snapshot creation; a
  higher threshold means a larger journal but less snapshot churn. The default is conservative
  and works for most clusters. Consider raising it if you have plenty of disk and want to
  minimize snapshot I/O on a high-write cluster, or lowering it if disk is tight and you want to
  keep the journal compact. This is a cluster-wide value and should be consistent across nodes in
  the cluster. Otherwise the value from the most recently started controller will win.
- `trailingLogs` - (optional, 500) how many log entries to keep in the journal after a snapshot.
  These trailing entries let a follower that's only slightly behind catch up by replaying journal
  entries instead of receiving a full snapshot, which is much cheaper. The right value depends on
  how far behind your followers can fall during normal operation: too small, and any follower
  that disconnects briefly forces a full snapshot transfer when it returns; too large, and you're
  storing entries that will never be needed. The default works for typical disconnect patterns;
  raise it if you have followers that occasionally disconnect for longer periods and want to
  avoid the snapshot-transfer-and-restart dance described in [HA -> Failure Scenarios](../ha/failure-scenarios.md#lagging-or-disconnected-controllers).
  This is a cluster-wide value and should be consistent across nodes in the cluster. Otherwise
  the value from the most recently started controller will win.
- `warnWhenLeaderlessFor` - (optional, 1m) emits a warning log message (`cluster running without
  leader for longer than configured threshold`) if the controller has been part of a cluster with
  no leader for this duration. Minimum 10s. This is the primary log-based hook for alerting on
  leaderless clusters; lower it if you want faster alerting (down to the 10s floor), raise it if
  your cluster regularly has short leaderless windows during normal operation and you only want
  to be alerted on extended outages. See [HA -> Monitoring and Troubleshooting](../ha/monitoring-and-troubleshooting.md#what-to-alert-on)
  for how to wire this into alerting.

```text
cluster:
  commandHandler:
    maxQueueSize: 250
  commitTimeout: 50ms
  dataDir: ./data
  electionTimeout: 5s
  heartbeatTimeout: 3s
  leaderLeaseTimeout: 3s
  logLevel: INFO
  logFile: ./raft.log
  maxAppendEntries: 64
  preferredLeader: false
  restartSelfOnSnapshot: false
  snapshotInterval: 2m
  snapshotThreshold: 500
  trailingLogs: 500
  warnWhenLeaderlessFor: 1m
```

### `trace`

The `trace` section instructs the controller to output incoming and outgoing messaging it receives.
This setting is useful for debugging purposes only and should not be enabled in production
environments without careful consideration.

- `path` - (required) the file to output decoded messages to

```text
trace:
  path: /var/opt/open.ziti.ctrl.trace
```

### `web`

The `web` section follows the [conventions of XWeb](conventions.md#xweb). The controller has the
following APIs defined:

- `health-checks` - provides a health check API that allows remote parties to verify the health of
  the controller
- `fabric` - the fabric management API which allows remote administration of a network
- `edge-management` - the edge management API which allows remote administration of a network's edge
  components (
  identities, policies, authentication, etc.)
- `edge-client` - the edge client API which allows clients to authenticate and request connections
  to services

Each API may have their own options, but currently do not.

### `v`

The `v` section is used to detect if the version file is supported by the OpenZiti binary read it.
The current and only supported value is "3".

```text
v: 3
```
