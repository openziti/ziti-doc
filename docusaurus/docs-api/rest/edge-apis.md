# Edge APIs

The Edge in Ziti currently has two APIs that it provides for configuration:

- Edge Management API
- Edge Client API

## Specifications & Documentation

Both the Edge Management and Client APIs have Open API 2.0 specifications. The most up-to-date versions of them are
available within the [Ziti Edge GitHub repository](https://github.com/openziti/edge/tree/main/specs). They are also
available from a running controller directly at:

- https://\<host\>:\<port\>/edge/client/v1/docs
- https://\<host\>:\<port\>/edge/management/v1/docs

Where `<host>:<port>` should be replaced with the values configured for the APIs in the [`web` section](/#web-configuration-section)

## Edge Management API

The Edge Management API is used by clients that wish to configure a Ziti network and does not facilitate to interacting
with service for dialing (connecting) nor binding (hosting). The Edge Management API provides the ability to create
new identities, identities, policies, and other entities used to manage a Ziti network.

## Edge Client API

The Edge Client API is used by clients that wish to dial (connect) or bind (host) services. The services that the
clients are allowed to interact with is defined by [policies](/docs/core-concepts/security/authorization/policies/overview). In order
for clients to use the client API they must first [authenticate](/docs/core-concepts/security/authentication/auth) and
obtain either a [partial or fully authenticated](/docs/core-concepts/security/authentication/auth#full-vs-partial-authentication)
[API Sessioon](/docs/core-concepts/security/sessions#).

## Edge Client & Management Shared Capabilities

The Client and Management APIs both follow the [shared API capabilities](./shared-api-capabilities) common on
all Ziti APIs. Additionally, between the two the following endpoint paths are exposed on both.

- `current-identity` - facilitates the 
  - /edge/management/v1/current-identity/*
  - /edge/client/v1/current-api-session/*
- `current-api-session`
  - /edge/client/v1/current-api-session/*
  - /edge/management/v1/current-api-session/*

## Configuring

In order for the Edge Client and Management API to be available a controller must be configured to enable them. This 
requires two configuration sections `edge` and `web`. The `edge` section configures values that will affect  both the
Edge Client API and the Edge Management API. The `web` section is used to configure and compose any of Ziti's
APIs, Edge Client and Management included, to listen on any combination of network interface and ports.

### Edge Configuration Section
The main [Ziti GitHub repository](https://github.com/openziti/ziti) has[example configuration](https://github.com/openziti/ziti/blob/release-next/etc/) 
files. The `ctrl.with.edge.yml` file has all of the `edge` values documented.

#### Example Edge Configuration Section

```yaml
edge:
  api:
    #(optional, default 90s) Alters how frequently heartbeat and last activity values are persisted
    # activityUpdateInterval: 90s
    #(optional, default 250) The number of API Sessions updated for last activity per transaction
    # activityUpdateBatchSize: 250
    # sessionTimeout - optional, default 10m
    # The number of minutes before an Edge API session will timeout. Timeouts are reset by
    # API requests and connections that are maintained to Edge Routers
    sessionTimeout: 30m
    # address - required
    # The default address (host:port) to use for enrollment for the Client API. This value must match one of the addresses
    # defined in a bind point's address field for the `edge-client` API in the web section.
    address: 127.0.0.1:1280
  # enrollment - required
  # A section containing settings pertaining to enrollment.
  enrollment:
    # signingCert - required
    # A Ziti Identity configuration section that specifically makes use of the cert and key fields to define
    # a signing certificate from the PKI that the Ziti environment is using to sign certificates. The signingCert.cert
    # will be added to the /.well-known CA store that is used to bootstrap trust with the Ziti Controller.
    signingCert:
      cert: ./ziti/etc/ca/intermediate/certs/intermediate.cert.pem
      key: ./ziti/etc/ca/intermediate/private/intermediate.key.pem
    # edgeIdentity - optional
    # A section for identity enrollment specific settings
    edgeIdentity:
      # duration - optional, default 5m
      # The length of time that a Ziti Edge Identity enrollment should remain valid. After
      # this duration, the enrollment will expire and not longer be usable.
      duration: 5m
    # edgeRouter - Optional
    # A section for edge router enrollment specific settings.
    edgeRouter:
      # duration - optional, default 5m
      # The length of time that a Ziti Edge Router enrollment should remain valid. After
      # this duration, the enrollment will expire and not longer be usable.
      duration: 5m
```

### Web Configuration Section

The `web` section of the controller is based off of the [xweb](https://github.com/openziti/xweb) library. xweb allows
a single configuration section to be used to compose multiple APIs across any number of network interfaces. Understanding
the xweb configuration format is essential for success with configuring the `web` section in the controller.

Ziti Edge exposes the following two xweb API bindings:

- `edge-client` - the Edge Client API
- `edge-management` - the Edge Management API

Neither have any associated options in the `web` section.

#### Example Web Configuration Section

The main [Ziti GitHub repository](https://github.com/openziti/ziti) has[example configuration](https://github.com/openziti/ziti/blob/release-next/etc/)
files. The `ctrl.with.edge.yml` file has all of the `web` values documented.

```yaml
# web - optional
# Defines webListeners that will be hosted by the controller. Each webListener can host many APIs and be bound to many
# bind points.
web:
# name - required
# Provides a name for this listener, used for logging output. Not required to be unique, but is highly suggested.
- name: all-apis-localhost
  # bindPoints - required
  # One or more bind points are required. A bind point specifies an interface (interface:port string) that defines
  # where on the host machine the webListener will listen and the address (host:port) that should be used to
  # publicly address the webListener(i.e. mydomain.com, localhost, 127.0.0.1). This public address may be used for
  # incoming address resolution as well as used in responses in the API.
  bindPoints:
  #interface - required
  # A host:port string on which network interface to listen on. 0.0.0.0 will listen on all interfaces
    - interface: 127.0.0.1:1280

      # address - required
      # The public address that external incoming requests will be able to resolve. Used in request processing and
      # response content that requires full host:port/path addresses.
      address: 127.0.0.1:1280

      # newAddress - optional
      # A host:port string which will be sent out as an HTTP header "ziti-new-address" if specified. If the header
      # is present, clients should update location configuration to immediately use the new address for future
      # connections. The value of newAddress must be resolvable both via DNS and validate via certificates
      newAddress: localhost:1280
  # identity - optional
  # Allows the webListener to have a specific identity instead of defaulting to the root `identity` section.
  #    identity:
  #      cert:                 ${ZITI_SOURCE}/ziti/etc/ca/intermediate/certs/ctrl-client.cert.pem
  #      server_cert:          ${ZITI_SOURCE}/ziti/etc/ca/intermediate/certs/ctrl-server.cert.pem
  #      key:                  ${ZITI_SOURCE}/ziti/etc/ca/intermediate/private/ctrl.key.pem
  #      ca:                   ${ZITI_SOURCE}/ziti/etc/ca/intermediate/certs/ca-chain.cert.pem
  # options - optional
  # Allows the specification of webListener level options - mainly dealing with HTTP/TLS settings. These options are
  # used for all http servers started by the current webListener.
  options:
  # idleTimeout - optional, default 5000ms
  # The maximum amount of idle time in milliseconds allowed for pipelined HTTP requests. Setting this too high
  # can cause resources on the host to be consumed as clients remain connected and idle. Lowering this value
  # will cause clients to reconnect on subsequent HTTPs requests.
  idleTimeout: 5000ms  #http timeouts, new

  # readTimeout - optional, default 5000ms
  # The maximum amount of time in milliseconds http servers will wait to read the first incoming requests. A higher
  # value risks consuming resources on the host with clients that are acting bad faith or suffering from high latency
  # or packet loss. A lower value can risk losing connections to high latency/packet loss clients.

  readTimeout: 5000ms
  # writeTimeout - optional, default 10000ms
  # The total maximum time in milliseconds that the http server will wait for a single requests to be received and
  # responded too. A higher value can allow long running requests to consume resources on the host. A lower value
  # can risk ending requests before the server has a chance to respond.

  writeTimeout: 100000ms
  # minTLSVersion - optional, default TSL1.2
  # The minimum version of TSL to support

  minTLSVersion: TLS1.2
  # maxTLSVersion - optional, default TSL1.3
  # The maximum version of TSL to support

  maxTLSVersion: TLS1.3
  # apis - required
  # Allows one or more APIs to be bound to this webListener
  apis:
  # binding - required
  # Specifies an API to bind to this webListener. Built-in APIs are
  #   - health-checks
  #   - edge-management
  #   - edge-client
  #   - fabric-management
    - binding: health-checks
      options: { }
    - binding: fabric
    - binding: edge-management
      # options - variable optional/required
      # This section is used to define values that are specified by the API they are associated with.
      # These settings are per API. The example below is for the `edge-api` and contains both optional values and
      # required values.
      options: { }
    - binding: edge-client
      options: { }
```