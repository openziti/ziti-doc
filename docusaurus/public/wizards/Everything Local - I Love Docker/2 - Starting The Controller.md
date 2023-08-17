All Ziti Networks require a Ziti Controller. Without a controller, edge routers won't be able to authorize new connections rendering a new network useless. You must have a controller running.

**Required - Volume Mount**

Running Ziti locally via Docker will require you to mount a common folder which will be used to store the PKI of your network. Without a volume mount, you'll be forced to figure out how to get the PKI in place correctly. While this is a straightforward process once you know how to do it, when you're getting started this is undoubtedly complicated. We recommend that if you're starting out (or if you just don't want to be bothered with these details) you should just create a folder and volume mount that folder. It's expected that this volume is mounted on /persistent/pki inside the container.

**Required - Known Name**

Other containers on the Docker network will need to address the controller. To do this, we will give this container a network alias. At this time it would appear that this also forces you to add the container to a network which is not the default network. This is a very useful feature which allows your containers to be isolated from one another and also will allow you to have multiple networks running locally if you desire. To create a Docker network issue:

```
docker network create myFirstZitiNetwork
```

Next - we need to make a folder to share our PKI as well as our environment file the controller emits. We'll just put it into your home directory. Move it wherever you like.

```
mkdir -p ~/docker-volume/myFirstZitiNetwork
```

Finally, we need to make an empty file where we expect the controller to put the env file. Let's do that now too.

```
echo "#ziti.env file" > ~/docker-volume/myFirstZitiNetwork/ziti.env
```

Later, when starting the controller, we'll supply this network as a parameter to the docker command as well as name the network. That's done with these two options: --network myFirstZitiNetwork --network-alias ziti-controller and we'll also supply the env file as the location for the controller to use to write into.