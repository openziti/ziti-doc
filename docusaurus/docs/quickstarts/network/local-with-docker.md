---
sidebar_position: 40
---
# Local - With Docker

[Docker](https://www.docker.com) is a popular container engine, and many developers enjoy using solutions delivered via
Docker. Ziti provides a single Docker container which contains the entire stack of Ziti components. This is not the most
common mechanism for deploying containers, we recognize that. However, we think that this makes it a bit easier for
people to get started with deploying Ziti components using Docker. We will certainly look to create individual
containers for each component in the future but for now it's a single container. You can get this container by issuing
`docker pull openziti/quickstart:latest`.

## Starting the Controller

All [Ziti Networks](../../introduction/index.mdx) require
a [Ziti Controller](/operations/controller). Without a controller, edge routers won't be able to authorize new
connections rendering a new network useless. You must have a controller running.

### Required - Volume Mount

Running Ziti locally via Docker will require you to mount a common folder which will be used to store the PKI of your
network. Without a volume mount, you'll be forced to figure out how to get the PKI in place correctly. While this is a
straightforward process once you know how to do it, when you're getting started this is undoubtedly complicated. We
recommend that if you're starting out (or if you just don't want to be bothered with these details) you should just
create a folder and volume mount that folder. It's expected that this volume is mounted on `/persistent/pki` inside the
container.

### Required - Known Name

Other containers on the Docker network will **need** to address the controller. To do this, we will give this container
a network alias. At this time it would appear that this also forces you to add the container to a network which is not
the default network. This is a very useful feature which allows your containers to be isolated from one another and also
will allow you to have multiple networks running locally if you desire. To create a Docker network issue:

```bash
docker network create myFirstZitiNetwork
```

Next - we need to make a folder to share our PKI as well as our environment file the controller emits. We'll just 
put it into your home directory. Move it wherever you like. 

```bash
mkdir -p ~/docker-volume/myFirstZitiNetwork
```

Finally, we need to make an empty file where we expect the controller to put the env file. Let's do that now too.

```bash
echo "#ziti.env file" > ~/docker-volume/myFirstZitiNetwork/ziti.env
```

Later, when starting the controller, we'll supply this network as a parameter to the `docker` command as well as name the
network. That's done with these two options: `--network myFirstZitiNetwork --network-alias ziti-controller` and 
we'll also supply the env file as the location for the controller to use to write into.

### Optional - Expose Controller Port

Docker containers by default won't expose any ports that you could use from your local machine. If you want to be able
to use this controller from outside of Docker, you'll need to export the controller's API port. That's easy to do, 
simply pass one more parameter to the `docker` command: `-p ${externalPort}:${internalPort}`

### Running the Controller

Here's an example of how to launch a controller using the folder created in the steps above. Also, notice this command
passes a couple extra flags you'll see used on this page. Notably
the `--rm` flag and the `-it` flag. The `--rm` flag instructs Docker to delete the container when the container exits.
The `-it` flag will run the container interactively. Running interactively like this makes it easier to see the logs
produced, but you will need a terminal for each process you want to run. The choice is yours, but in these examples 
we'll use `-it` to make seeing the output from the logs easier.

Here's an example which will use the Docker network named "myFirstZitiNetwork" and expose the controller to your local
computer on port 1280 (the default port).

```bash
docker run \
  --network myFirstZitiNetwork \
  --network-alias ziti-controller \
  --network-alias ziti-edge-controller \
  -p 1280:1280 \
  -it \
  --rm \
  -v ~/docker-volume/myFirstZitiNetwork:/persistent/pki \
  -v ~/docker-volume/myFirstZitiNetwork/ziti.env:/persistent/ziti.env \
  openziti/quickstart \
  /var/openziti/scripts/run-controller.sh
```

## Edge Router

At this point you should have a [Ziti Controller](/operations/controller) running. You should have created your
Docker network as well as creating the volume mount. Now it's time to connect your first edge router. The same Docker
image that runs the controller can run an edge router. To start an edge router, you will run a very similar command as
the one to start the controller with a couple of key differences.

The first noticeable difference is that we need to pass in the name of the edge router we want it to be. To use this
network, the name supplied needs tobe addressable by clients.  Also notice the port exported is port 3022. This is the
default port used by edge routers. 

```bash
docker run \
  -e ZITI_EDGE_ROUTER_RAWNAME=ziti-edge-router-1 \
  --network myFirstZitiNetwork \
  --network-alias ziti-edge-router-1 \
  -p 3022:3022 \
  -it \
  --rm \
  -v ~/docker-volume/myFirstZitiNetwork:/persistent/pki \
  -v ~/docker-volume/myFirstZitiNetwork/ziti.env:/persistent/ziti.env \
  openziti/quickstart \
  /var/openziti/scripts/run-router.sh edge
```

If you want to create a second edge router, you'll need to override the router port, don't forget to export that port too

```bash
docker run \
  -e ZITI_EDGE_ROUTER_RAWNAME=ziti-edge-router-2 \
  -e ZITI_EDGE_ROUTER_PORT=4022 \
  --network myFirstZitiNetwork \
  --network-alias ziti-edge-router-2 \
  -p 4022:4022 \
  -it \
  --rm \
  -v ~/docker-volume/myFirstZitiNetwork:/persistent/pki \
  -v ~/docker-volume/myFirstZitiNetwork/ziti.env:/persistent/ziti.env \
  openziti/quickstart \
  /var/openziti/scripts/run-router.sh edge
```

## Testing the Network

### Using Docker Locally

A quick note. If you are not well-versed with Docker you might forget that exposing ports in Docker is one thing, 
but you'll also need to have a hosts entry for the containers you want to access from outside of of the Docker 
network. This quickstart will expect that you understand this and for every router you add you will want to make 
sure you add a host entry. In the examples above we are adding three entities: `ziti-edge-controller`, 
`ziti-edge-router-1` and `ziti-edge-router-2`.

### Testing

With the controller and router running, you can now attach to the Docker host running the Ziti controller and test that
the router did indeed come online and is running as you expect. To do this, we'll use another feature of the `docker`
command and `exec` into the machine. First, you'll need to know your Docker container name which you can figure out by
running `docker ps`.

```bash
$ docker ps

CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS          PORTS
                   NAMES
1b86c4b461e7   openziti/quickstart   "/var/openziti/scripts/r…"   10 minutes ago   Up 10 minutes   0.0.0.0:3022->3022/tcp, :::3022->3022/tcp   musing_engelbart
a33d58248d6e   openziti/quickstart   "/var/openziti/scripts/r…"   46 minutes ago   Up 46 minutes   0.0.0.0:1280->1280/tcp, :::1280->1280/tcp   xenodochial_cori
```

Above, you'll see my controller is running in a container named "xenodochial_cori". I can tell because it's using the
default port of 1280, the default port for the controller. Now I can `exec` into this
container: `docker exec -it xenodochial_cori /bin/bash`

Once in the container, I can now issue `zitiLogin` to authenticate the `ziti` CLI.

```bash
zitiLogin
Token: b16f182f-88b3-4fcc-9bfc-1e32319ca486
Saving identity 'default' to /persistent/ziti-cli.json
```

And finally, once authenticated I can test to see if the edge router is online in the controller and as you'll see, the
`isOnline` property is true!

```bash
ziti@a33d58248d6e:/persistent$ ziti edge list edge-routers
id: qNZyqZEix3    name: ziti-edge-router    isOnline: true    role attributes: {}
results: 1-1 of 1
```

## Next Steps

- Now that you have your network in place, you probably want to try it out. Head to
[the services quickstart](../services/index.md) and start learning how to use OpenZiti.
- [Install the Ziti Console](../zac/index.md#docker) (web UI)
- Add a Second Public Router: In order for multiple routers to form transit links, they need a firewall exception to expose the "link listener" port. The default port is `10080/tcp`.
- Help
  - [Change Admin Password](./help/change-admin-password.md)
  - [Reset the Quickstart](./help/reset-quickstart.md)
