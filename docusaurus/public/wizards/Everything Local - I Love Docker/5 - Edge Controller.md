At this point you should have a Ziti Controller running. You should have created your Docker network as well as creating the volume mount. Now it's time to connect your first edge router. The same Docker image that runs the controller can run an edge router. To start an edge router, you will run a very similar command as the one to start the controller with a couple of key differences.

The first noticeable difference is that we need to pass in the name of the edge router we want it to be. To use this network, the name supplied needs tobe addressable by clients. Also notice the port exported is port 3022. This is the default port used by edge routers.

```
docker run \
    -e ZITI_ROUTER_NAME=ziti-edge-router-1 \
    -e ZITI_ROUTER_ADVERTISED_HOST=ziti-edge-router-1 \
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

```
docker run \
    -e ZITI_ROUTER_NAME=ziti-edge-router-2 \
    -e ZITI_ROUTER_ROLES=public \
    -e ZITI_ROUTER_PORT=4022 \
    -e ZITI_ROUTER_ADVERTISED_HOST=ziti-edge-router-2 \
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