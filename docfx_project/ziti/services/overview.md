# Ziti Services

A Ziti network is primarily concerned with providing access to "services". A service encapsulates the definition of any
resource that could be accessed by a client on a traditional network. Services by themselves do not provide a complete
mechanism for authorization. That is what an [AppWAN](../appwans/overview.md) is for.

A service is defined by the following components:

* Name - the name of the service
* Ziti Router - the last Ziti Router traffic will be sent to
* Intercepting Host and Port - what DNS name or IP should be used when intecepting traffic
* Endpoint Service - (if not hosted - see below) the protocol, host, and port traffic sent to
* Hosting Identity - (is hosted - see below) the identity that will host the service

### Dark Services

One of the benefits of using a Ziti service is that the actual service can be 'dark'. In fact this is the default for
any service based entirely in Ziti. Place the service in a secure network with only Ziti in place and nobody in the
world can access the service without a valid certificate/identity!

Existing services can also be converted to dark via Ziti. Once Ziti is incorporated into an existing network and
Ziti endpoints deployed the only access to these services can be through Ziti!

### Service Name

Services defined on a Ziti Network have an almost limitless "namespace" available for identifying services. A Ziti
service is be defined by a name and this name is registered with the Ziti Controller. Once declared, services can then be
addressed directly by name from Ziti-aware clients. This means there are effecitvely a **limitless** number names
available with no need for global DNS registration. The names assigned are unique to a Ziti Network and the application
developer has total control over service names.

### Types of Services

There are two basic types of serivces in a Ziti Network: hosted and non-hosted.

#### Hosted

Hosted services are the new edge. Ziti allows the developer to declare a service is "hosted". This means when a Ziti
Client attempts to address the specified serivce the Ziti Network will route traffic to this endpoint automatically.
Once the traffic is at the endpoint the traffic can be terminated inside the process space of a Ziti-powered
application. When the traffic terminates inside a Ziti-powered application the application it never needs to leave the
secure environment of the Ziti Network leading to turly zero-trust solutions!

#### Non-Hosted

Non-hosted services are services which are not terminated inside a Ziti-capable client. These services are somewhat
similar conceptually to services behind a reverse proxy. In these services traffic is onboarded to the Ziti Network at
an Ziti Edge Router and then exits the Ziti Network at the specified Ziti Edge Router.

## Ziti Router

The Ziti Router portion of a service represents the final Ziti Router that traffic will be sent to. From this router the
traffic will either be sent to a Ziti Endpoint or to a point outside the Ziti network over the underlay network.

If the traffic is destined for a location that is not on the Ziti network overlay this is the router the Ziti network
will end up sending the traffic from.

If the router is sending traffic to another Ziti Endpoint then the service is said to be "hosted".  Hosted services
cannot specify a router - the Ziti network figures out the best path to the endpoint.

## Intercepting Host and Port

Specified on the service when the traffic destination is outside of the Ziti network onto the underlay. If the [Ziti
client](../clients/overview.md) in use is capable of operating in a seamless/transparent mode then these values will
specify the IPv4 address or DNS name to intercept.  Any traffic sent to the specified address will be captured and if
the destination port is the same as the specified intercepting port the traffic will be routed into the Ziti network.

## Endpoint Service

Specified on the service when the traffic destination is outside of the Ziti network onto the underlay. These fields
allow you to choose the protocol, host and port that the actual traffic will be sent to. Note that the host and port do
not need to match those specified in the intercept host and port (for seamless/transparent ziti clients).

## Hosting Identity

Specified on the service when the serivce is terminated at another Ziti Endpoint. This field is only valid when the
router specified is set to "hosted".

[!include[](./creating.md)]