**Using Docker Locally**

A quick note. If you are not well-versed with Docker you might forget that exposing ports in Docker is one thing, but you'll also need to have a hosts entry for the containers you want to access from outside of of the Docker network. This quickstart will expect that you understand this and for every router you add you will want to make sure you add a host entry. In the examples above we are adding three entities: ziti-edge-controller, ziti-edge-router-1 and ziti-edge-router-2.

**Testing**

With the controller and router running, you can now attach to the Docker host running the Ziti controller and test that the router did indeed come online and is running as you expect. To do this, we'll use another feature of the docker command and exec into the machine. First, you'll need to know your Docker container name which you can figure out by running docker ps.

```
$ docker ps

CONTAINER ID   IMAGE                 COMMAND                      CREATED          STATUS          PORTS NAMES
1b86c4b461e7   openziti/quickstart   "/var/openziti/scripts/r…"   10 minutes ago   Up 10 minutes   0.0.0.0:3022->3022/tcp, :::3022->3022/tcp   musing_engelbart
a33d58248d6e   openziti/quickstart   "/var/openziti/scripts/r…"   46 minutes ago   Up 46 minutes   0.0.0.0:1280->1280/tcp, :::1280->1280/tcp   xenodochial_cori
```

Above, you'll see my controller is running in a container named "xenodochial_cori". I can tell because it's using the default port of 1280, the default port for the controller. Now I can exec into this container: docker exec -it xenodochial_cori /bin/bash

With the controller and router running, you can now attach to the Docker host running the Ziti controller and test that the router did indeed come online and is running as you expect. To do this, we'll use another feature of the docker command and exec into the machine. First, you'll need to know your Docker container name which you can figure out by running docker ps.

```
zitiLogin
Token: b16f182f-88b3-4fcc-9bfc-1e32319ca486
Saving identity 'default' to /persistent/ziti-cli.json
```
                            
And finally, once authenticated I can test to see if the edge router is online in the controller and as you'll see, the isOnline property is true!

```
ziti@a33d58248d6e:/persistent$ ziti edge list edge-routers
id: qNZyqZEix3    name: ziti-edge-router-1    isOnline: true    role attributes: {}
results: 1-1 of 1
```