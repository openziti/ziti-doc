OpenZiti requires explicit authorization of identities using (edge router policies), as well as authorization of services and routers using (service edge router policies). The docker-based quickstart doesn't perform these steps automatically. Run the initialization container one time, after starting the controller as shown

```
docker run \
    --network myFirstZitiNetwork \
    --network-alias ziti-controller-init-container \
    -it \
    --rm \
    -v ~/docker-volume/myFirstZitiNetwork:/persistent/pki \
    -v ~/docker-volume/myFirstZitiNetwork/ziti.env:/persistent/ziti.env \
    openziti/quickstart \
    /var/openziti/scripts/run-with-ziti-cli.sh  /var/openziti/scripts/access-control.sh
```