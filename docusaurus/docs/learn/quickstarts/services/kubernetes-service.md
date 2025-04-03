---
title: Kubernetes Service
---

This is a tutorial for tunneling a Kubernetes workload with OpenZiti.

## Steps

1. Deploy the Hello Toy chart. This provides a simple web server target that's only reachable inside cluster. We'll use OpenZiti to tunnel it to your client outside the cluster.

    ```text
    helm install "hello-toy" openziti/hello-toy \
        --namespace hello-toy --create-namespace \
        --set serviceDomainName=hello
    ```

1. Ensure you have a OpenZiti router in the cluster with a tunnel binding. You can use this command to find eligible routers.

    ```text
    ziti edge list edge-routers 'isTunnelerEnabled=true'
    ```

    If none of the routers shown are in your cluster, then refer to [the router deployment guide](/guides/deployments/40-router/60-kubernetes.mdx) for more information on how to deploy a router.

1. Add a role to the tunneler identity of the router you selected from the list above, e.g. "router1." This step adds a role to the router's identity that we'll use later to grant it permission to bind the service.

    ```text
    ziti edge update identity "router1" \
        --role-attributes hello-hosts
    ```

1. Enroll an identity for your client device. Add the identity to any tunneler so you can access `http://hello.ziti.internal` when you finish the steps.

    ```text
    ziti edge create identity "hello-client" \
        --role-attributes hello-clients \
        --jwt-output-file hello-client.jwt
    ```

1. Create the service.

    ```text
    ziti edge create config "hello-intercept-config" intercept.v1 \
        '{"protocols":["tcp"],"addresses":["hello.ziti.internal"], "portRanges":[{"low":80, "high":80}]}'

    ziti edge create config "hello-host-config" host.v1 \
        '{"protocol":"tcp", "address":"hello.hello-toy.svc","port":80}'

    ziti edge create service "hello-service" \
        --configs hello-intercept-config,hello-host-config

1. Ensure you have router policies for your identities and services.

    Create a router policy for each if needed.

    ```text
    ziti edge create edge-router-policy "default" \
        --edge-router-roles '#all' --identity-roles '#all'

    ziti edge create service-edge-router-policy "default" \
        --edge-router-roles '#all' --service-roles '#all'
    ```

1. Create the service policies for the client and host identities.

    ```text
    ziti edge create service-policy "hello-dial-policy" Dial \
        --service-roles '@hello-service' --identity-roles '#hello-clients'

    ziti edge create service-policy "hello-bind-policy" Bind \
        --service-roles '@hello-service' --identity-roles '#hello-hosts'
    ```

1. Ensure your client identity has dial permission, and the router's identity has bind permission.

    ```text
    ziti edge policy-advisor services hello-service -q       
    ```

    ```buttonless title=Output
    OKAY : router1 (1) -> hello-service (1) Common Routers: (1/1) Dial: N Bind: Y 
    OKAY : hello-client (1) -> hello-service (1) Common Routers: (1/1) Dial: Y Bind: N 
    ```

1. Visit the Hello Demo page in your browser: [http://hello.ziti.internal/](http://hello.ziti.internal/)
