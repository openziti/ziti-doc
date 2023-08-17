The docker-compose file will create quite a few containers on your behalf. Here is a logical overview of the network that will get created:

![Diagram](./images/deploymentdiagram.svg)

As you can see there's a fair bit going on in there, let's break it down. The first thing to notice is that the entire image is within the scope of a Docker network. You'll see with this compose file there are three pieces of the overlay which span the Docker network: the controller, an edge router, and a websocket-based edge router.

**Deployment Simplifie**

The stock docker-compose.yml deploys many components and is somewhat complex. If you prefer a simplified deployment via Docker compose, one which only includes the basic controller and edge router combination you can instead download the [simplified-docker-compose.yml](https://github.com/openziti/ziti/blob/release-next/quickstart/docker/simplified-docker-compose.yml)

**Networks**

Inside the Docker network you'll see there are three networks:

* the blue docker network
* the red docker network
* the purple "logical" network

Docker will ensure only the pieces within a given network, can only communicate within that network. This network topology is designed to approximate, very loosely, what it would be like to have a publicly deployed network. The purple network would approximate the internet itself, the blue network would represent a cloud provider's private network (such as AWS) and the red network could represent another cloud provider network (like Azure). Those details are not important, the important part is that the networks are totally private to one another. See more on this topic below in the "Testing" section.

**Purple Network**

There is no Docker network named "purple" in the compose file, it's entirely a logical construct. It is shown only for clarity. All the assets in the purple network are in both the blue and red docker networks (which is why it's referred to as purple). The assets in the purple network need to be in both the red and blue networks because the assets located in the blue and red networks need to communicate to the public edge routers and also need to communicate to the controller. If that's confusing, see the "Testing" section below which will hopefully make this more clear.

**Red Network**

The red network exists for demonstration only at this time. As you can see there are no assets inside the red network other than the private, ziti-private-red router and the ziti-fabric-router-br. This means there's nothing in the red network for Ziti to access. It would serve as a great place for you to put your own assets and explore using Ziti!

**Blue Network**

The blue network contains two important assets, the ziti-private-blue router and the web-test-blue server. Along with those assets, the network also contains the ziti-fabric-router-br. Although the web-test-blue server does export a port by default (port 80 on your localhost, will translate to port 8000 on the web-test-blue server), you can use Ziti to access this server without the exported port.

**The "Fabric" Router**

The ziti-fabric-router-br exists to illustrate that you can create edge routers that are not necessarily fully public. This is the only router which can communicate to all the other routers. The Ziti mesh may choose to use this router if the algorithm indicates it's the fastest path. Perhaps we'll see more about this in future docs.