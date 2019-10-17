# Ziti Services

A Ziti network is primarily concerned with providing access to "services". A service encapsulates the definition of any
resource that could be accessed by a client on a traditional network. Services by themselves do not provide a complete
mechanism for authorization. That is what an [AppWAN](../appwans/overview.md) is for.

To define a service you need to know the following components:

* Name - what do you want to name your service
* Ziti Router - the last Ziti Router traffic will be sent to
* Intercepting Host and Port - what DNS name or IP you wish to intercept traffic on when intecepting traffic
* Endpoint Service - (if not hosted - see below) the protocol, host, and port traffic sent to
* Hosting Identity - (is hosted - see below) the identity that will host the service

### Dark Services

One of the benefits of using a Ziti service is that your actual service can be 'dark'. In fact this is the default for
any service based entirely in Ziti. Place your service in a secure network with only Ziti in place and nobody in the
world can access your service without a valid certificate/identity! 

Existing services can also be converted to dark via Ziti. Once Ziti is incorporated into your existing network and
Ziti endpoints deployed the only access to these services can be through Ziti!

### Service Name

Services defined on a Ziti Network have an almost limitless "namespace" available for identifying services. A Ziti
service is be defined by a name of your choosing and this name is registered with your Ziti controller. You have total
control over your service names rather than by a requiring the use of a DNS name or an IP address (underlay concepts).

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