---
title: Kubernetes Service
---

This is a quick example for tunneling to a Kubernetes workload with OpenZiti that builds on [the local Kubernetes quickstart](../network/local-kubernetes.md). There are two deployments for you to deploy in the same namespace:

* a demo workload service `hello-toy`
* an OpenZiti reverse proxy pod `ziti-host`

1. Create OpenZiti configs, service, and policies for the Hello demo deployment.

    ```bash
    ziti edge create identity device "hello-host" \
        --jwt-output-file /tmp/hello-host.jwt --role-attributes hello-hosts

    ziti edge enroll /tmp/hello-host.jwt

    ziti edge create config "hello-intercept-config" intercept.v1 \
        '{"protocols":["tcp"],"addresses":["minihello.ziti"], "portRanges":[{"low":80, "high":80}]}'

    ziti edge create config "hello-host-config" host.v1 \
        '{"protocol":"tcp", "address":"minihello.hello-toy.svc","port":80}'

    ziti edge create service "hello-service" \
        --configs hello-intercept-config,hello-host-config

    ziti edge create service-policy "hello-bind-policy" Bind \
        --service-roles '@hello-service' --identity-roles '#hello-hosts'

    ziti edge create service-policy "hello-dial-policy" Dial \
        --service-roles '@hello-service' --identity-roles '#hello-clients'

    # adds a role to "edge-client1" from the local Kubernetes quickstart        
    ziti edge update identity "edge-client1" \
        --role-attributes testapi-clients,hello-clients
    ```

1. Deploy Hello Toy.

   This chart is a regular, non-OpenZiti demo server deployment. Next we'll connect it to our OpenZiti Network with an OpenZiti Tunneler deployment.

    ```bash
    helm install --create-namespace --namespace "hello-toy" \
        "hello-ziti1" openziti/hello-toy \
            --set serviceDomainName="minihello"
    ```

1. Deploy an OpenZiti Tunneler Pod.

    ```bash
    helm install --namespace hello-toy \
        "ziti-host-1" openziti/ziti-host \
            --set-file zitiIdentity=/tmp/hello-host.json
    ```

1. Visit the Hello Demo page in your browser: [http://minihello.ziti/](http://minihello.ziti/)

   Now you have two OpenZiti Services available to your OpenZiti Tunneler:
   * hello-service
   * testapi-service

