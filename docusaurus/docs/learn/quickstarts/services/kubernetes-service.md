---
title: Kubernetes Service
---

This is a tutorial for tunneling a Kubernetes workload with OpenZiti that creates:

* a demo service `hello-toy`
* an OpenZiti reverse proxy pod `ziti-host`

## Steps

1. You must have a OpenZiti router in the cluster with a tunnel binding. You can use this command to find eligible routers.

    ```text
    ziti edge list edge-routers 'isTunnelerEnabled=true'
    ```

    If none of the routers shown are in your cluster, then refer to [the router deployment guide](/guides/deployments/30-kubernetes/kubernetes-router.mdx) for more information on how to deploy a router.

1. Add a role to the router's tunneler identity. This labels the identity so we can give it permission to host the service as a reverse-proxy. Substitute the router name for `router1`.

    ```text
    ziti edge update identity "router1" \
        --role-attributes hello-hosts
    ```

1. Enroll an identity for yourself. Add the identity to any tunneler so you can access `http://hello.ziti.internal` when you finish the steps.

    ```text
    ziti edge create identity "hello-client" \
        --role-attributes hello-clients \
        --jwt-output-file hello-client.jwt
    ```

1. Ensure you have router policies for your identities and services.

    ```text
    ziti edge list edge-router-policies
    ziti edge list service-edge-router-policies
    ```

    You can create a default router policy for both if needed.

    ```text
    ziti edge create edge-router-policy "default" \
    --edge-router-roles '#all' --identity-roles '#all'

    ziti edge create service-edge-router-policy "default" \
    --edge-router-roles '#all' --service-roles '#all'
    ```

1. Create the service.

    ```text
    ziti edge create config "hello-intercept-config" intercept.v1 \
        '{"protocols":["tcp"],"addresses":["hello.ziti.internal"], "portRanges":[{"low":80, "high":80}]}'

    ziti edge create config "hello-host-config" host.v1 \
        '{"protocol":"tcp", "address":"hello.hello-toy.svc","port":80}'

    ziti edge create service "hello-service" \
        --configs hello-intercept-config,hello-host-config

1. Create the service policies for the client and host identities.

    ```text
    ziti edge create service-policy "hello-dial-policy" Dial \
        --service-roles '@hello-service' --identity-roles '#hello-clients'

    ziti edge create service-policy "hello-bind-policy" Bind \
        --service-roles '@hello-service' --identity-roles '#hello-hosts'
    ```

1. Deploy the Hello Toy chart.

    ```text
    helm install "hello-toy" openziti/hello-toy \
        --namespace hello-toy --create-namespace \
        --set serviceDomainName=hello
    ```

1. Visit the Hello Demo page in your browser: [http://hello.ziti.internal/](http://hello.ziti.internal/)
