---
title: "Configuring OpenZiti to Enable Prometheus"
date: 2022-04-23T04:00:00Z
cuid: cluvhwqbp001108kyehhib9hb
slug: configuring-openziti-to-enable-prometheus
authors: [ClintDovholuk]
tags: 
  - kubernetes
  - prometheus
  - zerotrust

---

*This is part two of a three-part article. This article provides the technical deep dive into the steps necessary to implement the vision outlined in* [*part one.*](https://blog.openziti.io/prometheus-scrape-anything-from-anywhere) *This article will be heavy on OpenZiti CLI commands, explaining what we are doing to configure the overlay network, and why. In* [*the final article*](https://blog.openziti.io/scraping-anything-anywhere-in-action)*, we will explore what we have just created and understand what was just created*

---

## Goals

* Incredibly easy to deploy Prometheus servers
    
* No ports exposed to the internet
    
* Prometheus servers can be deployed listening on the overlay, not on the underlay
    
* Private Kubernetes API
    

## Zitified Prometheus

As described in [the previous article](https://blog.openziti.io/prometheus-scrape-anything-from-anywhere), Prometheus really prefers to be able to gather metrics from the targets it is monitoring. When the target is behind a firewall, you will be left with two choices.

![](/blogs/openziti/v1712853892186/74523233-0c1a-4a09-bb26-9eb1d5cd92c4.png)

You can choose to open a hole in the firewall granting access (a generally bad idea), or you can use a PushGateway. Even if you choose to use the PushGateway, Prometheus will still need to be able to access and pull from the PushGateway so you'll still need some port open and listening for Prometheus to collect data.

What we really want is to enable Prometheus to scrape data from targets without needing to expose any ports to the internet. It would be \*\* even better\*\* if we didn't have to expose any ports at all, even to the local "trusted" network. This capability is something that is unique to an OpenZiti-enabled application. You can take an OpenZiti SDK and embed it into your application, and give your app zero trust superpowers! If we take an OpenZiti SDK and embed it into Prometheus, we can give Prometheus the superpower of invisibility and addressability. Embedding an OpenZiti SDK produces a zitified version of Prometheus. With an OpenZiti-powered Prometheus, no ports need to be open.

The OpenZiti project has done the work to produce an OpenZiti-enabled version of Prometheus. It's also entirely open source. Check it out from the OpenZiti Test Kitchen hosted on GitHub https://github.com/openziti-test-kitchen/prometheus.

## Solution Overview

As you'll recall from [part1](https://blog.openziti.io/prometheus-scrape-anything-from-anywhere), we are trying to use Prometheus to monitor workloads in two different Kubernetes clusters. We are going to deploy one cluster which will represent a first step of an OpenZiti solution. It will use a Prometheus server that is OpenZiti-enabled, but it will still listen on the underlay network and be available to local devices on an ip:port. This Prometheus server will use OpenZiti to scrape targets which are available anywhere on the OpenZiti overlay network and we'll refer to this as "ClusterA".

We'll also deploy a second OpenZiti-enabled Prometheus server, in a totally separate Kubernetes cluster. This Prometheus server will **not** listen on an ip:port. Instead, it will listen exclusively on the OpenZiti overlay. This Prometheus server will have no ports available to attack and will only be accessible via a properly authorized and authenticated OpenZiti client. This will be our "ClusterB"

Finally, we'll stand up a third Prometheus server and use it to federate metrics back to a "central" Prometheus server. This emulates what one might do to provide a central location for humans to go to in order to visualize data or use the Prometheus server. We won't care where this is deployed, we'll actually deploy it in locally and then move it to a private server in AWS just to show how easy it that is.

This is what the solution we'll build looks like:

![after](https://github.com/dovholuknf/ziti-doc/raw/main/docusaurus/blog/zitification/prometheus/kubernetes-prometheus-after.svg align="left")

## Digging In

Let's get to work and build this solution. We'll need some legwork done first.

> It's going to get deep in this article with CLI commands. You'll see what the OpenZiti objects are that get created and learn why. You might not want to replicate the solution on your own and instead are looking for "the big reveal". If that describes you, just skim this article lightly and get on to [part3](https://blog.openziti.io/scraping-anything-anywhere-in-action). In part 3 we'll explore the deployed solution and see what makes it so interesting and cool.

### Prerequisites

* ![](/blogs/openziti/v1712854086884/8b08379c-00c2-4e12-a2fb-cb9f0a3bc975.png)
    
    You have an OpenZiti overlay network available. If not, for this scenario you will want to use ["host your own"](/docs/learn/quickstarts/network/hosted). You'll also want to have the ziti cli tool on your path
    
* Two Kubernetes clusters provisioned
    
* Necessary tooling installed and available on the path
    
    * kubectl
        
    * helm
        
* bash/zsh shell - tested in bash and some commands will use variables. If you use another shell, change accordingly
    
* a machine with [docker installed](https://docs.docker.com/get-docker/) to run the final Prometheus sever on (your local machine is fine)
    
* Ziti Desktop Edge installed on the development machine. I use [Ziti Desktop Edge for Windows](https://openziti.io/docs/reference/tunnelers/windows).
    
* A temporary folder exists to house files as we need them: /tmp/prometheus
    

---

## ClusterA - Using `ziti-host`

![clusterA](https://github.com/dovholuknf/ziti-doc/raw/main/docusaurus/blog/zitification/prometheus/clusterA.svg align="left")

We start with an empty OpenZiti network, and two empty Kubernetes clusters. Let's start by populating ClusterA. We will deploy three pods into this Kubernetes cluster. When done, the Kubernetes cluster will look similar to the image to the right.

* Pod 1. **ziti-host**. This pod will provide what is effectively the equivalent of a Kubernetes ingress controller. We'll install this using helm from a NetFoundry provided chart
    
* Pod 2. **prometheuz**. This pod will be our Prometheus server with OpenZiti embedded in it. We won't use OpenZiti to listen on the overlay network. Instead, we will follow a more traditional model of listening on the underlay at a known ip:port combination. We'll install this pod using a chart from the OpenZiti charts repository.
    
* Pod 3. **reflectz**. This pod represents the workload which we want to monitor. This is another chart provided by the OpenZiti chart repository and will also be installed with helm. If you are interested in viewing the source code for this project you can find it on [GitHub here](https://github.com/nf-npieros/sdk-golang/tree/feature/reflect-prometheus)
    

> Running the ziti cli commands shown below as shown will expect you to have the ziti binary on your path. Also it is expected that all the commands run will run from the same "development" machine with the expected tools available. Reach out on discourse if you get stuck.

### Pod 1 - `ziti-host`

We will start off deploying Pod 1, ziti-host, to provide access to Kubernetes ClusterA. The ziti-host pod will require a single identity to be provisioned. We will use a shortened name for the cluster and we'll embed that name into the identity to make it easier for us to understand what identity we provisioned and why, should we ever need to reference these identities later. We'll refer to ClusterA as simply "kubeA". Let's make the identity now. Notice we are also passing the "-a" attribute during creation to add a role attribute to the identity of `kubeA.services`. This will be used later when setting up policies.

#### Create the Identity

```text
ziti edge create identity device kubeA.ziti.id -o /tmp/prometheus/kubeA.ziti.id.jwt -a "kubeA.services"
```

You should see confirmation output such as:

```text
New identity kubeA.ziti.id created with id: BeyyFUZFDR
Enrollment expires at 2022-04-22T01:18:53.402Z
```

#### Deploy `ziti-host` into ClusterA

Once created, we can use helm to install the `ziti-host` pod. The jwt is a one-use token and will be useless after being consumed by `ziti-host`. As this is probably your first time running this helm chart, you will need to install it. The command is idempotent to running it over and over is of no concern. Run the following:

```text
helm repo add netfoundry https://netfoundry.github.io/charts/
helm repo update
helm install ziti-host netfoundry/ziti-host --set-file enrollmentToken="/tmp/prometheus/kubeA.ziti.id.jwt"
```

You will see the confirmation output from helm. Now when you look at your Kubernetes cluster with `kubectl`, you will see a pod deployed:

```text
kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
ziti-host-db55b5c4b-rpc7f   1/1     Running   0          2m40s
```

Awesome, we have our first deployed pod. It's useless at the moment as we have defined no services, nor authorized any services. Right now there's nothing to connect to, so we can simply move on and install the next pod, `reflectz`.

### Pod 2 - `reflectz`

The first pod we want to have access to is the `reflectz` pod. It is a workload we will deploy that will do two things. First, it will listen on the OpenZiti overlay network for connections. When a connection is made, and when bytes are sent, the workload sill simply return back to the caller whatever was sent to it adding "you sent me: " to the payload. It's not much, but it's a demo after all. The second service provided is a scrape target for Prometheus. There is one metric exposed by `reflectz` we will care about, the total number of connections established to this workload. This pod also needs an identity provisioned, and this time around we will also provision some services. We will also use the `ziti` cli to enroll this identity. This helm chart wants you to provide an enrolled identity as part of the helm command. Let's do all this now.

#### Create and Enroll the Identity

```text
ziti edge create identity user kubeA.reflect.id -o /tmp/prometheus/kubeA.reflect.id.jwt
ziti edge enroll /tmp/prometheus/kubeA.reflect.id.jwt -o /tmp/prometheus/kubeA.reflect.id.json
```

#### Create Configs and Services (including Tunneling-based Access)

The `reflectz` chart also needs two services to be declared and specified at the time of the helm chart installation. We will want to be able to test the service to ensure they work. To enable testing the services, we will create two configs of type `intercept.v1`. This will allow identities using tunneling apps to be able to access the services, this is how we'll verify the services work. Make the configs and services now.

```text
# create intercept configs for the two services
ziti edge create config kubeA.reflect.svc-intercept.v1 intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeA.reflect.svc.ziti"],"portRanges":[{"low":80, "high":80}]}'
ziti edge create config "kubeA.reflect.svc-intercept.v1.scrape" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeA.reflect.scrape.svc.ziti"], "portRanges":[{"low":80, "high":80}], "dialOptions":{"identity":"kubeA.reflect.id"}}'

# create the two services
ziti edge create service "kubeA.reflect.svc" --configs "kubeA.reflect.svc-intercept.v1" -a "kubeA.reflect.svc.services"
ziti edge create service "kubeA.reflect.scrape.svc" --configs "kubeA.reflect.svc-intercept.v1.scrape"
```

#### Authorize the Workload and Clients

Services are not valuable if there are no identities which can use the services. The identity used in the helm installation will also need to be authorized to bind these services. Tunneling apps will need to be authorized to dial these services but also remember Prometheus servers will need to be able to dial these services too. We will now create `service-policies` to authorize the tunneling clients, Prometheus scrapes, and the `reflectz` server to bind the service.

```text
# create the bind service policies and authorize the reflect id to bind these services
ziti edge create service-policy "kubeA.reflect.svc.bind" Bind \
  --service-roles "@kubeA.reflect.svc" --identity-roles "@kubeA.reflect.id"
ziti edge create service-policy "kubeA.reflect.scrape.svc.bind" Bind \
  --service-roles "@kubeA.reflect.scrape.svc" --identity-roles "@kubeA.reflect.id"

# create the dial service policies and authorize the reflect id to bind these services
ziti edge create service-policy "kubeA.reflect.svc.dial" Dial \
  --service-roles "@kubeA.reflect.svc" --identity-roles "#reflectz-clients"
ziti edge create service-policy "kubeA.reflect.svc.dial.scrape" Dial \
  --service-roles "@kubeA.reflect.scrape.svc" --identity-roles "#reflectz-clients"
```

#### Deploy `reflectz`

With the identity enrolled, we can now install the helm chart from openziti, and install our demonstration workload: `reflectz`. Notice that to deploy `reflectz` we need to supply an identity to the workload using `--set-file reflectIdentity`. This identity will be used to 'Bind' the services the workload exposes. We also need to define what the service names are we want to allow that identity to bind. We do this using the `--set serviceName` and `--set prometheusServiceName` flags.

```text
helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install reflectz openziti-test-kitchen/reflect \
  --set-file reflectIdentity="/tmp/prometheus/kubeA.reflect.id.json" \
  --set serviceName="kubeA.reflect.svc" \
  --set prometheusServiceName="kubeA.reflect.scrape.svc"
```

After running helm, pod 2 should be up and running. Let's take a look using `kubectl`

```text
kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
reflectz-775bd45d86-4sjwh   1/1     Running   0          7s
ziti-host-db55b5c4b-rpc7f   1/1     Running   0          4m
```

### Pod 3 - `Prometheuz`

#### Overlay Work - Setting Up OpenZiti

Now we have access to the cluster and a workload to monitor. Now we want to deploy Prometheus and monitor this workload. Remember that the workload only exposes a scrape target over the OpenZiti overlay. For Prometheus to be able to scrape the workload, even when resident inside the Kubernetes cluster (!), Prometheus will need to be OpenZiti-enabled. That will require a few things. We'll need a new identity for Prometheus, we'll need to authorize Prometheus to access the workload's target, and we'll need to configure Prometheus to scrape that workload. When we create this identity we'll assign two attributes. The `reflectz-clients` attribute gives this identity the ability to dial the two services defined above. The `prometheus-clients` attribute is currently unused. We'll put that to use later, but we can define it now.

#### Create and Enroll the Identity

```text
# create and enroll the identity.
ziti edge create identity user kubeA.prometheus.id -o /tmp/prometheus/kubeA.prometheus.id.jwt -a "reflectz-clients","prometheus-clients"
ziti edge enroll /tmp/prometheus/kubeA.prometheus.id.jwt -o /tmp/prometheus/kubeA.prometheus.id.json
```

#### Create Configs and Services (including Tunneling-based Access)

```text
# create the config and service for the kubeA prometheus server
ziti edge create config "kubeA.prometheus.svc-intercept.v1" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeA.prometheus.svc"],"portRanges":[{"low":80, "high":80}]}'
ziti edge create config "kubeA.prometheus.svc-host.v1" host.v1 \
  '{"protocol":"tcp", "address":"prometheuz-prometheus-server","port":80}'
ziti edge create service "kubeA.prometheus.svc" \
  --configs "kubeA.prometheus.svc-intercept.v1","kubeA.prometheus.svc-host.v1"
```

#### Authorize the Workload and Clients

```text
# grant the prometheus clients the ability to dial the service and the kubeA.prometheus.id the ability to bind
ziti edge create service-policy "kubeA.prometheus.svc.dial" Dial \
  --service-roles "@kubeA.prometheus.svc" \
  --identity-roles "#prometheus-clients"
ziti edge create service-policy "kubeA.prometheus.svc.bind" Bind \
  --service-roles "@kubeA.prometheus.svc" \
  --identity-roles "@kubeA.ziti.id"
```

#### Deploying `Prometheuz` {#deploying-prometheuz-1}

With our services, configs and service-policies in place we are now ready to start our Prometheus server. Remember this server will not listen on a the OpenZiti overlay. It's going to listen exclusively on the underlay. We are still exploring OpenZiti, and we are not yet comfortable deploying our Prometheus server dark. We'll change this soon, don't worry. For now, we'll imagine that we're still evaluating the tech and chose to deploy it on the underlay, not on the overlay.

Although Prometheus is listening on the underlay, we **have** deployed our workload listening on the overlay network. It won't be available on the underlay at all. The workload has **no listening ports**. This means that we'll still need an OpenZiti-enabled Prometheus to access and scrape that workload. To do this we'll use helm, and use a chart provided by the OpenZiti charts repo.

Some interesting things to notice below in the `helm install` command. Notice that we are passing helm two `--set` parameters. These parameters are informing the helm chart that the Prometheus server is not "zitified", meaning it will be accessible via the underlay network. We're also passing one `--set-file` parameter to tell Prometheus what identity we want to be stored in the pod (as a secret). This secret will be used when we configure Prometheus to scrape the workload. Go ahead and run this command now and run `kubectl get pods` until all the containers are running.

```text
helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install prometheuz openziti-test-kitchen/prometheus \
  --set server.ziti.enabled="false" \
  --set-file server.scrape.id.contents="/tmp/prometheus/kubeA.prometheus.id.json"
```

---

## ClusterB - Fully Dark

![clusterB](https://github.com/dovholuknf/ziti-doc/raw/main/docusaurus/blog/zitification/prometheus/clusterB.svg align="left")

Now that we have deployed our first Kubernetes cluster, it's now time to deploy the second Kubernetes cluster. This time, we are going to keep our entire deployment **fully dark**! There will be no listening ports, not even local to the Kubernetes cluster itself. To get any traffic to this Prometheus server, you will need a strong identity and need to be authorized on the OpenZiti overlay. When complete, ClusterB will look like the image to the right.

This time, "Pod1" will be the `reflectz` workload. Since this is a **fully dark** deployment, listening entirely on the OpenZiti overlay, we won't need a `ziti-host` pod. Remember, in ClusterA `ziti-host` is used to provide internal access to the Kubernetes cluster via the OpenZiti overlay. It's similar in role to an ingress controller, but doesn't require you to expose your workloads to the internet. While that's pretty good we want to go fully dark this time. We'll have no `ziti-host`. We'll only need to deploy two pods: `reflectz` and `prometheuz`.

The good news is that the same commands you've run for ClusterA, will mostly be used for ClusterB. You will want to beware that where you used "kubeA" before, make sure you change those to "kubeB". There will be small other changes we'll make along the way too, we'll see those changes and explain them below.

### Pod1 - `reflectz`

The `relectz` workload we'll deploy for ClusterB will be nearly identical to the ClusterA workload. We will create a service for the actual 'reflect' service. We will make a service for Prometheus to scrape the workload. We'll also need another identity, so we'll create that identity, authorize it to bind the services, and authorize clients to access the workload. Since this process is very similar to what we did for ClusterA, there's not much to explain. Setup ClusterB's `reflectz` now.

#### Create the Identity

```text
ziti edge create identity user kubeB.reflect.id -o /tmp/prometheus/kubeB.reflect.id.jwt
ziti edge enroll /tmp/prometheus/kubeB.reflect.id.jwt -o /tmp/prometheus/kubeB.reflect.id.json
```

#### Create Configs and Services (including Tunneling-based Access)

```text
# create intercept configs for the two services
ziti edge create config kubeB.reflect.svc-intercept.v1 intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeB.reflect.svc.ziti"],"portRanges":[{"low":80, "high":80}]}'
ziti edge create config "kubeB.reflect.svc-intercept.v1.scrape" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeB.reflect.scrape.svc.ziti"], "portRanges":[{"low":80, "high":80}], "dialOptions":{"identity":"kubeB.reflect.id"}}'

# create the two services
ziti edge create service "kubeB.reflect.svc" --configs "kubeB.reflect.svc-intercept.v1" -a "kubeB.reflect.svc.services"
ziti edge create service "kubeB.reflect.scrape.svc" --configs "kubeB.reflect.svc-intercept.v1.scrape"
```

#### Authorize the Workload to Bind the Services

```text
# create the bind service policies and authorize the reflect id to bind these services
ziti edge create service-policy "kubeB.reflect.svc.bind" Bind \
  --service-roles "@kubeB.reflect.svc" --identity-roles "@kubeB.reflect.id"
ziti edge create service-policy "kubeB.reflect.scrape.svc.bind" Bind \
  --service-roles "@kubeB.reflect.scrape.svc" --identity-roles "@kubeB.reflect.id"
```

#### Authorize Clients to Access the Services

```text
# create the dial service policies and authorize the reflect id to bind these services
ziti edge create service-policy "kubeB.reflect.svc.dial" Dial \
  --service-roles "@kubeB.reflect.svc" --identity-roles "#reflectz-clients"
ziti edge create service-policy "kubeB.reflect.svc.dial.scrape" Dial \
  --service-roles "@kubeB.reflect.scrape.svc" --identity-roles "#reflectz-clients"
```

#### Deploy `reflectz` {#deploy-reflectz-1}

```text
helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install reflectz openziti-test-kitchen/reflect \
  --set-file reflectIdentity="/tmp/prometheus/kubeB.reflect.id.json" \
  --set serviceName="kubeB.reflect.svc" \
  --set prometheusServiceName="kubeB.reflect.scrape.svc"
```

### Pod 2 - `Prometheuz`

For ClusterB we want `Prometheuz` to be **totally dark**. It will exclusively listen on the OpenZiti overlay and there will be no listening ports on the underlay. We will need another identity, of course, and most of the configuration and commands appear the same on the surface with very subtle differences. We'll explore these differences as we go. In this section we'll be making an identity, **one config** (a difference from the ClusterA install), a service, and two service-policies. Let's get to it.

#### Create the Identity

```text
ziti edge create identity user kubeB.prometheus.id -o /tmp/prometheus/kubeB.prometheus.id.jwt -a "reflectz-clients","prometheus-clients"
ziti edge enroll /tmp/prometheus/kubeB.prometheus.id.jwt -o /tmp/prometheus/kubeB.prometheus.id.json
```

#### Create **One** Config and Service

Here's a difference from ClusterA. Since we are going to listen on the OpenZiti overlay, we are not installing `ziti-host`. That means we don't need to create a `host.v1` config. A `host.v1` config is necessary for services which have a 'Bind' configuration and are being bound by a tunneling application. We're not doing that, here Prometheus will 'Bind' this service, thus we don't need that `host.v1` config.

```text
# create the config and service for the kubeB prometheus server
ziti edge create config "kubeB.prometheus.svc-intercept.v1" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeB.prometheus.svc"],"portRanges":[{"low":80, "high":80}], "dialOptions": {"identity":"kubeB.prometheus.id"}}'
# no need for the host.v1 config
ziti edge create service "kubeB.prometheus.svc" \
  --configs "kubeB.prometheus.svc-intercept.v1"
```

#### Authorize Clients and Prometheus to Bind the Service

At first, these commands appear identical. You need to look very closely to notice the difference between these command and the ones we ran for ClusterA, other than the obvious changes from "kubeA" to "kubeB". Pay close attention to the supplied `--identity-roles` for the bind policy specified below. With ClusterA, we did not have Prometheus listen on the overlay and we allowed Prometheus to listen on the underlay. That meant we needed to deploy `ziti-host` into that cluster to provide access to the service, and that means the service had to be bound by the `ziti-host` identity.

Here we are flipping that script. We are allowing Prometheus to bind this service! That means we'll need to authorize the `kubeB.prometheus.id` to be able to bind the service.

```text
# grant the prometheus clients the ability to dial the service and the kubeB.prometheus.id the ability to bind
ziti edge create service-policy "kubeB.prometheus.svc.dial" Dial \
  --service-roles "@kubeB.prometheus.svc" \
  --identity-roles "#prometheus-clients"
ziti edge create service-policy "kubeB.prometheus.svc.bind" Bind \
  --service-roles "@kubeB.prometheus.svc" \
  --identity-roles "@kubeB.prometheus.id"
```

#### Deploying `Prometheuz`

At this point we have the OpenZiti overlay all configured. What's left, is to deploy Prometheus into ClusterB. This command is substantially different from what we ran while deploying Prometheus into ClusterA. You'll see that we need to supply two other identities for this installation. Remember, Prometheus will be entirely dark once deployed into ClusterB, listening only on the OpenZiti overlay. The container in the pod which monitors configmap changes won't be able to trigger a webhook using the underlay! This `configmap-reloadz` is a second "zitification" we didn't realize we were deploying in ClusterA, because we did not need it. We need it for ClusterB.

You'll see for configmapReload we need to supply the identity which the container will use to hit the Prometheus webhook. We do that by passing `--set-file configmapReload.ziti.id.contents="/tmp/prometheus/kubeB.prometheus.id.json"`. Then we'll supply the service which `configmap-reloadz` will dial, and we'll also specify what identity we expect to be hosting the service.

Next you'll see we need to supply the identity to the Prometheus server we want to allow to listen on the OpenZiti overlay ( `-set-file server.ziti.id.contents`). Similar to `configmap-reloadz` we will also specify the service and identity name to bind.

Finally, to allow the server to scrape targets we need to supply a final identity which will be used when scraping targets with `--set-file server.scrape.id.contents`.

You'll notice for simplicities sake, we are using the same identity for all three needs which is perfectly fine. If you wanted to use a different identity, you could. That choice is up to you. To keep it simple we just authorized this identity for all these purposes.

```text
# install prometheus
helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install prometheuz openziti-test-kitchen/prometheus \
  --set-file configmapReload.ziti.id.contents="/tmp/prometheus/kubeB.prometheus.id.json" \
       --set configmapReload.ziti.targetService="kubeB.prometheus.svc" \
       --set configmapReload.ziti.targetIdentity="kubeB.prometheus.id" \
  --set-file server.ziti.id.contents="/tmp/prometheus/kubeB.prometheus.id.json" \
       --set server.ziti.service="kubeB.prometheus.svc" \
       --set server.ziti.identity="kubeB.prometheus.id" \
  --set-file server.scrape.id.contents="/tmp/prometheus/kubeB.prometheus.id.json"
```

## What's Next

In this article we've done a lot of OpenZiti CLI work, run some `kubectl` and `helm` commands but we still haven't explored what it is we are building and why it's so cool. We'll do that in the [last, and final](https://blog.openziti.io/scraping-anything-anywhere-in-action) article. Hopefully, the payoff for you will be as rewarding as it was for me while building this article series.

---

#### Addendum - a Quicker Start

All the commands above are also available in github as `.sh` scripts. If you would prefer, you can clone the [ziti-doc repository](https://github.com/openziti/ziti-doc) and access the scripts from the path mentioned below. "Cleanup" scripts are provided if desired.

```text
${checkout_root}/docusaurus/blog/zitification/prometheus/scripts
```
