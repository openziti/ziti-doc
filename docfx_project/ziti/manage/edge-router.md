# Edge Router

The Edge Router is the entry point for Ziti-based clients. It is responsible for authenticating incoming connections by
verifying the connecting client has a valid network session.  It also routes traffic to whatever the
destination is for the given service. In simple deployments - a single edge router might be deployed. This is the case
with the [Ziti Edge - Developer Edition](~/ziti/quickstarts/networks-overview.md). In the coming months it will be
possible to produce complicated deployments having multiple Edge Routers deployed in a myriad of locations.

### Prerequisite - PKI

Public Key Infrastructure (PKI) is a complex topic. See the [pki](~/ziti/manage/pki.md) page for additional details about the sort
of needs and considerations relevant to the Ziti controller.

## Sizing Guidelines

The Ziti network controller and routers have not been stress tested at this time. We recommend starting with a small
scale deployment until key performance indicators start to hint that the server requires more resources. A Ziti network
will have two important metrics: CPU and network capacity.  Modest sized networks require minimal investments in
infrastructure. Start with small machines and increase as needed.

## Configuration

The Ziti Controller is configured using a [yaml](https://yaml.org/) file. The configuration file can be found
[here](~/ziti/manage/sample-controller-config.yaml). Each section is annotated and should provide you enough
information to modify a given setting. Most of the fields are straight-forward. The pki-related fields are the ones you
will need to pay particular attention to. See the [pki](~/ziti/manage/pki.md) page for relevant information on pki
settings.

[!include[](./logging-snippet.md)]