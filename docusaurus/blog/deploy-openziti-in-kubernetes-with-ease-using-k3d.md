---
title: "Deploy OpenZiti in Kubernetes with Ease Using k3d"
date: 2024-05-17T19:13:03Z
cuid: clwb24maj00010amp786bh8gw
slug: deploy-openziti-in-kubernetes-with-ease-using-k3d
authors: [KennethBingham]
image: /docs/blogs/openzitiv1715957663205/30f837ad-feba-47f8-9678-09a0b08ae781.png
tags: 
  - docker
  - kubernetes
  - self-hosted
  - k3d
  - zerotrust
  - overlaynetworking

---

k3d is a Kubernetes distribution for Docker that makes it easy to replicate a production-like environment in a local container environment. It's great for local development and familiarizing yourself with [OpenZiti's deployment options](https://openziti.io/docs/category/deployments).

## The Plan

1. Create a k3d cluster.
    
2. Install the OpenZiti controller.
    
3. Install the OpenZiti router.
    

## Create a Cluster

Prerequisite: [`k3d`](https://k3d.io/#install-script) CLI

We need a cluster with forwarded ports for the controller and a router. Run `k3d` to create a cluster.

```bash
k3d cluster create ziti-local \
--port 1280:1280@loadbalancer \
--port 6262:6262@loadbalancer \
--port 3022:3022@loadbalancer \
--port 10080:10080@loadbalancer
```

### Ports Breakdown

* controller
    
    * `1280` - client API web listener
        
    * `6262` - control plane for routers
        
* router
    
    * `3022` - edge listener for identities
        
    * `10080` - link listener for other routers
        

*A note about why everything's port-separated in this tutorial: It's simpler. OpenZiti uses mTLS extensively, so the cluster must pass through TLS to the controller and router pods. This tutorial uses LoadBalancer services because they provide a raw TCP proxy and are convenient with Traefik in k3d. OpenZiti can also separate services sharing a port by ALPN identifier, and Ingress/Gateway controllers can separate them by SNI.*

## Find the Node Address

Prerequisite: [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl) CLI

Run `kubectl` to set a shell environment variable `NODE_IP` to the LoadBalancer address. This gives us an IP address that's routable inside and outside our k3d cluster. We'll use it to invent a DNS name in a magic wildcard zone (e.g., `sslip.io`, `nip.io`).

### Windows

For Docker Desktop on Windows, use the WSL2 VM interface address and run the rest of the commands with BASH in WSL2.

```bash
NODE_IP=$(getent hosts host.docker.internal | awk '{ print $1 }')
```

### macOS

For Docker Desktop on macOS, use the default host interface address.

```bash
NODE_IP=$(ipconfig getifaddr $(route get default | awk '/interface: / { print $2 }'))
```

### Linux

For Docker daemon on Linux, use the IP of the load balancer container.

```bash
NODE_IP=$(docker inspect k3d-ziti-local-serverlb|jq -r '.[].NetworkSettings.Networks[].IPAddress')
```

## Install the Controller Chart

Prerequisite: [`helm`](https://helm.sh/docs/intro/install/) CLI

Run `helm` to add the OpenZiti charts repo.

```bash
helm repo add "openziti" https://openziti.io/helm-charts
helm repo update "openziti"
```

Install the [Cert Manager](https://cert-manager.io/docs/) and [Trust Manager](https://cert-manager.io/docs/trust/trust-manager/) Custom Resource Definitions so we can install them as subcharts.

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.crds.yaml
kubectl apply -f https://raw.githubusercontent.com/cert-manager/trust-manager/v0.7.0/deploy/crds/trust.cert-manager.io_bundles.yaml
```

Install and configure the controller to advertise the node address (i.e., the LoadBalancer address).

```bash
helm upgrade --install "ziti-controller" openziti/ziti-controller \
--namespace "ziti" --create-namespace \
--set clientApi.advertisedHost="client.ziti.${NODE_IP}.sslip.io" \
--set clientApi.advertisedPort=1280 \
--set clientApi.service.type=LoadBalancer \
--set ctrlPlane.advertisedHost="ctrl.ziti.${NODE_IP}.sslip.io" \
--set ctrlPlane.advertisedPort=6262 \
--set ctrlPlane.service.type=LoadBalancer \
--set trust-manager.app.trust.namespace=ziti \
--set trust-manager.enabled=true \
--set cert-manager.enabled=true
```

### Input Values Breakdown

* `clientApi`
    
    * `advertisedHost`: FQDN that identities will connect to the control plane
        
    * `advertisedPort`: port on the FQDN identities will connect to
        
    * `service.type`: K8s Service type
        
* `ctrlPlane`
    
    * `advertisedHost`: FQDN that routers will connect to the control plane
        
    * `advertisedPort`: port on the FQDN routers will connect to
        
    * `service.type`: K8s service type
        
* [`trust-manager`](http://trust-manager.app.trust)
    
    * `app.trust.namespace`: K8s Namespace where Trust Manager is allowed to read K8s Secrets to serve bundles of trusted root CA certificates
        
    * `enabled`: install Trust Manager sub chart in the same namespace
        
* `cert-manager`
    
    * `enabled`: install Cert Manager sub chart in the same namespace
        

## Log in to the OpenZiti Controller

Wait for the controller deployment to become ready.

```bash
kubectl wait deployments "ziti-controller" \
    --namespace ziti \
    --for condition=Available=True \
    --timeout 240s
```

Prerequisite: [`ziti`](https://openziti.io/docs/downloads?os=Linux) CLI

Get the admin's password and log in

```bash
kubectl get secrets "ziti-controller-admin-secret" \
--namespace "ziti" \
--output go-template='{{index .data "admin-password" | base64decode }}' \
| xargs -rl ziti edge login client.ziti.${NODE_IP}.sslip.io:1280 \
--yes --username "admin" \
--password
```

What does this gnarly one-liner do? It's three commands. The first, `kubectl`, gets the admin password from K8s. The second command, `xargs` , tacks the password onto the end of the third, `ziti edge login`.

## Create an OpenZiti Router

You must administratively create a Ziti router. The `-t` option is short for `--tunneler-enabled` and enables the built-in tunneler to be used as a reverse proxy for cluster-internal services. This will be convenient when you create your first OpenZiti service.

```bash
ziti edge create edge-router "router1" -t -o ./router1.jwt
```

Expected Output

```bash
New edge router router1 created with id: OdiqYOi9RW
Enrollment expires at 2024-05-17T20:50:59.142Z
```

## Install the Router Chart

The token allows the router to bootstrap itself with a renewable identity from the controller.

```bash
helm upgrade --install "ziti-router" openziti/ziti-router \
--namespace "ziti" \
--set-file enrollmentJwt=./router1.jwt \
--set edge.advertisedHost="router1.edge.ziti.${NODE_IP}.sslip.io" \
--set edge.advertisedPort=3022 \
--set edge.service.type=LoadBalancer \
--set linkListeners.transport.advertisedHost="router1.link.ziti.${NODE_IP}.sslip.io" \
--set linkListeners.transport.advertisedPort=10080 \
--set linkListeners.transport.service.type=LoadBalancer \
--set tunnel.mode=host \
--set ctrl.endpoint="ctrl.ziti.${NODE_IP}.sslip.io:6262"
```

### Input Values Breakdown

* `enrollmentJwt`: This is the path to the token file you got from administratively creating the router.
    
* `edge`
    
    * `advertisedHost`: FQDN identities will connect to the data plane
        
    * `advertisedPort`: Port on the FQDN identities will connect to
        
    * `service.type`: K8s service type
        
* `linkListeners`
    
    * `transport`
        
        * `advertisedHost`: FQDN routers will connect to the data plane
            
        * `advertisedPort`: port on the FQDN where routers will connect
            
        * `service.type`: K8s service type
            
* `ctrl`
    
    * `endpoint`: control plane address for this router to connect to
        

### Ensure router1 is Online.

```bash
ziti edge list edge-routers
```

Expected Output

```bash
╭────────────┬─────────┬────────┬───────────────┬──────┬────────────╮
│ ID         │ NAME    │ ONLINE │ ALLOW TRANSIT │ COST │ ATTRIBUTES │
├────────────┼─────────┼────────┼───────────────┼──────┼────────────┤
│ OdiqYOi9RW │ router1 │ true   │ true          │    0 │            │
╰────────────┴─────────┴────────┴───────────────┴──────┴────────────╯
results: 1-1 of 1
```

## That's It!

Now, you can add identities and connect them with services and policies.

Recommended: [Kubernetes service tutorial](https://openziti.io/docs/learn/quickstarts/services/kubernetes-service/).

Pop into the forum if you have any ideas or issues: [https://openziti.discourse.group/](https://openziti.discourse.group/).

## Related

* [This other Kubernetes Quickstart](https://openziti.io/docs/learn/quickstarts/network/local-kubernetes) uses Minikube instead of k3d
