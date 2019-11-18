# Edge Router

The Edge Router is the entry point for Ziti-based clients. It is responsible for authenticating incoming connections by
verifying the connecting client has a valid network session.  It also routes traffic to whatever the
destination is for the given service. In simple deployments - a single edge router might be deployed. This is the case
with the [Ziti Edge - Developer Edition](~/ziti/quickstarts/networks-overview.md). In the coming months it will be
possible to produce complicated deployments having multiple Edge Routers deployed in a myriad of locations.

## Sizing Guidelines

The Ziti network controller and routers are still in the process of being stress tested. We recommend starting with a small
scale deployment until key performance indicators start to hint that the server requires more resources. A Ziti network
will have two important metrics: CPU and network capacity.  Modest sized networks require minimal investments in
infrastructure. Start with small machines and increase as needed.

## Configuration

The Ziti Edge Router is configured using a [yaml](https://yaml.org/) file. An example configuration file can be found
[here](~/ziti/manage/sample-edge-router-config.yaml). Each section is annotated and should provide enough
information to modify a given setting. Most of the fields are straight-forward.

### Edge Router Identity

The pki-related fields in the `identity` section are important to understand and pay particular attention to. The
files specified here are generated durring the process of [enrolling](#enrollment) the edge router. As is also stated in the
configuration file these files do not need to exist before enrollment. These files will be written to during the
enrollment process. This means the process running the enrollment will need the correct privledges grated to it in order
to write - or overwrite those files.  If the key specified in the identity section already exists - it will not be
overwritten. Instead it will be used during the enrollment process.

[!include[](./logging-snippet.md)]

## Enrollment

Enrollment is the process of securely generating information used to identify a given client. All endpoints need to be
enrolled in one way or another. The Edge Router is a client of a Ziti Network and thus it too must be enrolled before it
will be able to participate in a Ziti network.  An Edge Router is enrolled using the `ziti-router enroll` command and
sub-command.

### Running ziti-router enroll

In order to enroll the Edge Router a valid [configuration](#configuration) file is needed. After creating a valid
configuration the jwt for the Edge Router also needs to be obtained from the controller. The jwt can be
retrieved from the controller via the controller's ReST API at
https://${controller-name}:${controller-port}/edge-routers.

With a valid configuration file and jwt the router can now be enrolled using:
 `ziti-router enroller [path to configuration file] --jwt [path to jwt]`.
