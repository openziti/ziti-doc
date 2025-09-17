---
title: "Prometheus - Scrape Anything from Anywhere"
date: 2022-04-23T04:00:00Z
cuid: cluvhg6tz000808l37bo69r4k
slug: prometheus-scrape-anything-from-anywhere
authors: [ClintDovholuk]
tags: 
  - kubernetes
  - prometheus
  - zerotrust

---

*This is part one of a three-part article. This article provides the necessary background and rationale for the series.* [*The next article*](https://blog.openziti.io/configuring-openziti-to-enable-prometheus) *will be a detailed explanation of the actual steps necessary to implement the solution. In* [*the final article*](https://blog.openziti.io/scraping-anything-anywhere-in-action)*, we will explore what we have just created and understand what was just created*

<!-- truncate -->

---

## The Problem With Pulling

Prometheus is a server which wants to reach out and pull data from "scrape targets". It will generally do this using http requests. One problem with this design is that these targets are often inaccessible, hidden from Prometheus behind a firewall.

If not hidden, it means some port was exposed on some network, thereby giving Prometheus the ability to pull the data it needs. Exposing that port on a "trusted" network is a possible attack vector for bad actors. Exposing that port on the open internet (as is often the case) is an open invitation for attack. It's much better to keep these servers totally dark to all networks.

OpenZiti solves this problem of reach elegantly and natively while also keeping your service dark to all networks. This gives an OpenZiti-enabled Prometheus the ability to literally scrape any target, anywhere. As long as the target is participates on an OpenZiti overlay network, and as long as the proper polices are in place allowing the traffic to flow, Prometheus will be able to reach out and pull the data it needs from anything, anywhere.

It doesn't matter if the target is in some private cloud data center, some private data center protected by a corporate firewall, or heck even running inside my local docker environment! As long as the target participates on that OpenZiti Prometheus can scrape it! That sort of reach is impossible with classic networks.

## Prometheus

[Prometheus](https://prometheus.io/) is an incredibly popular [CNCF](https://www.cncf.io/projects/prometheus/) project, which has graduated the gauntlet of progressions to emerge as a "graduated" CNCF project. If you're familiar with Prometheus, there are probably a couple of reasons people mainly choose to deploy it: metrics collection, visualization and alerting.

Prometheus is also tremendously flexible. It has numerous available plugins and supports integrating with a wide number of systems. According to [this CNCF survey](https://www.cncf.io/blog/2022/03/08/cloud-native-observability-microsurvey-prometheus-leads-the-way-but-hurdles-remain-to-understanding-the-health-of-systems/), Prometheus leads the pack when it comes to the project people go to for observability. Its popularity is probably because Prometheus is a CNCF project and is often considered the "default" solution to deploy on another wildly popular CNCF project called [Kubernetes](https://kubernetes.io). One interesting aspect of Prometheus is that it generally favors a poll-based approach to metrics collection instead of a push-based model.

### Poll-based?

I don't know about you, but historically, when I've thought about a metrics collection agent, I tend to think of an agent that reads a log file or some library that pushes rows into a giant data lake in the cloud. I don't generally think about a solution that implements poll-based metrics. This is often because the target of a poll-based collecting agent will probably be behind a firewall.

![FW](https://github.com/dovholuknf/ziti-doc/raw/main/docusaurus/blog/zitification/prometheus/fw.png align="left")

As you would expect, firewalls make it exceptionally difficult to implement a poll-based solution as firewalls have been known to make a habit of preventing external actors from accessing random http servers behind it! After all, that is their primary function!

The Prometheus project makes [strong arguments](https://prometheus.io/docs/practices/pushing/) explaining the benefits of a poll-based solution. They also realize that firewalls are important in creating a safe network and understand the challenges firewalls create for such a solution. To deal with these situations, the project also provides a [PushGateway](https://prometheus.io/docs/instrumenting/pushing/). This allows solutions to push their data to a location outbound of the firewall. Pushing data out of the firewall allows metrics and alerting to function without the worry (and maintenance heartache) of an open, inbound firewall hole.

### Acceptable Risk

Prometheus is often deployed into Kubernetes clusters, but it can be deployed anywhere. Taking the operational differences out of the equation, there is little difference between deploying Prometheus in a Kubernetes cluster and deploying it in one's data center. Once deployed, the needs will be the same. Prometheus will need to be authorized to reach out and scrape the targets it needs to scrape. All too often, this is done with relatively open network permissions. Even though we all know it's not the most secure way of authorizing Prometheus, this is often considered "safe enough" because we deployed Prometheus into a zone considered "safe". Managing firewall rules to all the computers Prometheus needs access to, feels like an impossible feat. There are just too many.

To add to our acceptable risk, we will need to be able to access the Prometheus server in some way. We'll want to get at the UI, see the charts and graphs and data it provides and use the server to its fullest. For that, we'll **of course** need a hole in our firewall, or in the case of Kubernetes we will probably deploy some form of [Kubernetes Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) to provide users access the service.

What we need are better and richer controls over our network. We need a better way of authorizing Prometheus without the hassle of maintaining firewall rules on individual machines. We also need a way to do this across multiple clouds, multiple Kubernetes clusters and multiple data centers. Let's see how OpenZiti can solve this problem while also enhancing our overall security.

---

## OpenZiti

The [OpenZiti](https://openziti.github.io) project allows us to solve all the problems outlined above. It is a fully-featured, zero trust overlay network and enables [zero trust networking principles](https://en.wikipedia.org/wiki/Zero_trust_security_model) to be applied anywhere. This includes bringing those zero trust principles directly into your application through one of the many SDKs provided by the project. Let's look at an example and see what a setup might look like before and after applying OpenZiti.

### Overview

Let's imagine that we have already deployed a solution using two Kubernetes clusters, ClusterA and ClusterB. It doesn't matter where the clusters are deployed. We are trying to illustrate a real-world situation where we have two separate Kubernetes clusters that we want to manage. The clusters could be deployed in the same cloud provider, in a private data center, in different cloud providers, it really does not matter. What is important, is that these clusters are available over the network. To enable access to the workloads inside the clusters, some form of Kubernetes ingress controller will be required on both clusters. In our example, we will have a workload deployed which exposes a prometheus scrape target we want Prometheus to monitor.

#### Figure 1 - Before OpenZiti

![Before OpenZiti](https://github.com/dovholuknf/ziti-doc/raw/main/docusaurus/blog/zitification/prometheus/kubernetes-prometheus-before.svg align="left")

### Taking a Closer Look

Looking at the diagram above with a discerning eye towards security, there are some immediate observations one can make.

#### Listening Ports

One observation we have already accepted from the overview, is that these clusters must be exposed via the internet. At first that doesn't seem like a big deal, we expose workloads like this to the internet all the time. This is a perfectly normal action, it's likely done every day somewhere in the world. It's so common, we almost don't even think about it until the time comes when we **need** to think about it. This ends up in an exposed port, listening somewhere in the world. There might be a firewall with complex rules to protect this port, but it's just as likely that this isn't the case. People might need to access the resources inside these clusters from anywhere.

#### Kubernetes API Exposed

Another observation is that the Kubernetes API is fully exposed to the internet. This API is a very high-value target and should be secured as strongly as possible. That probably means yet another complex firewall rule to maintain.

#### "Trusted" Intra-cluster Traffic

The final point to note is that the traffic within the cluster is considered safe. As mentioned above, the Prometheus server needs to be able to scrape the target workloads. That traffic is necessary to be considered safe. Also, notice that the pod for Prometheus contains a container named "configmap-reload" which is used to trigger a webhook on the Prometheus server when the [Kubernetes config map](https://kubernetes.io/docs/concepts/configuration/configmap/) changes. This is necessary when changing the Prometheus config, adding new scrape configs etc.

### Applying Zero Trust Networking Principles Using OpenZiti

Now that we understand the basic setup and understand some possible problems, let's see if OpenZiti can address one or more of these issues. When applying OpenZiti, the goal will be to strengthen our security posture for each of the above items.

#### Figure 2 - After OpenZiti

![after](https://github.com/dovholuknf/ziti-doc/raw/main/docusaurus/blog/zitification/prometheus/kubernetes-prometheus-after.svg align="left")

### Taking a Closer Look After OpenZiti

#### No External Listening Ports

With a classic deployment as shown in the initial design, we know there will be ports exposed to the open internet. In an ideal scenario, there would be absolutely no ports exposed on the open internet **nor** in the "trusted networking zone". It's immediately obvious after applying a solution using OpenZiti that those listening ports exposed by the Kubernetes ingress controller are no longer deployed and thus are no longer exposed to the internet. That's one attack vector eliminated. OpenZiti will initiate outbound mTLS connections among all the constituent pieces of the overlay network. This means connections will begin inside the trusted network zone and only create outbound links. Once established, those connections can be used to safely transfer data between any participating edge node.

This capability really can't be emphasized enough. With OpenZiti and with applications that use an OpenZiti SDK, such as the ones shown, there are no open ports to attack. This network is nearly impervious to the classical "land and expand" technique so many bad actors look to exploit.

#### Kubernetes API no Longer Exposed

Another significant benefit provided by OpenZiti is starting to come into focus. By having access to our clusters provided through OpenZiti, we can **stop exposing** the Kubernetes APIs for both clusters to the open internet. Prometheus will still be able to monitor each Kubernetes cluster through the private Kubernetes network. Accessing Prometheus will be provided via OpenZiti, instead of using a Kubernetes ingress controller. Later, we can ues the built-in capability Prometheus already provides to federate information from the clusters to a centralized, [zitified](/zitification.md) Prometheus server.

Once no longer exposed to the open internet, to maintain our Kubernetes cluster we could then turn to \[zitified\] (/zitification.md) tools. The OpenZiti project provides zitified versions of `kubectl` - [kubeztl](https://github.com/openziti-test-kitchen/kubectl) and `helm` - [helmz](https://github.com/openziti-test-kitchen/helm). Each of these tools have an OpenZiti SDK embedded inside them. This allows both tools to connect to the private Kubernetes API over the OpenZiti overlay network. To use them, you will need a strong, OpenZiti identity as well as be authorized to access the service. Also note that we're also not replacing the existing security constraints the Kubernetes ecosystem already provides. You can (and should) still secure your Kubernetes clusters using namespaces, roles, etc.

We'll explore `kubeztl` and `helmz` in future articles.

#### "Trusted" Intra-cluster Traffic

Lastly, let's turn our eyes toward the traffic running inside the Kubernetes cluster. Pay attention to the lines in orange and the lines in dark blue. Orange lines represent "private" traffic, traffic that needs to traverse the private network space.

At this point we cannot send traffic to the Kubernetes API via the overlay network. The Kubernetes API doesn't have an OpenZiti SDK embedded within it. That means when we deploy Prometheus into ClusterA and ClusterB to monitor the cluster, Prometheus will be forced to connect to a port exposed on the cluster's underlay network. Still, while not ideal, we have greatly improved the overall security posture of the cluster. We're no longer able to access the Kubernetes API without first gaining access to the zero trust overlay network. Accessing the Kubernetes API will also require the identity to be properly authorized to access the service attaching to the Kubernetes API.

Let's now focus on ClusterA. It contains a Prometheus server that decided against listening on the OpenZiti overlay. This means it will need to expose ports to the Kubernetes underlay network. The container inside the Prometheus pod will watch for configmap changes. To trigger the webhook, it will be forced to send unauthenticated webhook traffic to the Prometheus server on the underlay network in order to trigger the config to reload.

Still, accessing this cluster and the listening Prometheus server will require being on the OpenZiti overlay. Also, this Prometheus server does have an OpenZiti SDK built into it. We also deployed the "reflectz" workload with an OpenZiti SDK built into it as well. That means the Prometheus server must scrape the "reflectz" workload exclusively over the OpenZiti overlay. **Only** authorized identities can access that scrape data.

Contrast ClusterA with ClusterB. ClusterB deployed a Prometheus server with an embedded OpenZiti SDK and chose to provide its services exclusively on the OpenZiti overlay. We've also deployed a zitified "reflectz" workload here. Notice how little traffic traverses the Kubernetes cluster underlay network. The only traffic which needs to traverse the cluster's underlay network in ClusterB is the traffic which monitors the Kubernetes API. All other traffic in the cluster is now secured by the OpenZiti overlay network. You will need a strong identity, and you will need to be authorized on the overlay before even being allowed to connect to the target service.

## OpenZiti-Enabled Prometheus

We are now coming to the final piece of the puzzle. We have protected both Kubernetes clusters using OpenZiti. Now we want to bring all this data back to a centralized Prometheus server to make it easier on our user base. To do this, we'll again deploy an OpenZiti-enabled Prometheus server. This time we don't care where it is deployed except that we know we are not deploying it into either of the Kubernetes clusters we are already using. Since the Prometheus servers are all now accessible via the overlay network, we can literally deploy our server anywhere in the world. It could be on development server, it could be deployed in some other cloud, it could be deployed in our private data center. Because it's part of the overlay network, it no longer matters where we deploy the server. Wherever deployed, all it will need is outbound internet access, a strong identity, and access and authorization to services defined in the OpenZiti overlay network. Once that's done, OpenZiti will take care of the rest.

If you have made it this far, you might want to try all this for yourself. The [next article](https://blog.openziti.io/configuring-openziti-to-enable-prometheus) will go into the details necessary to implement this solution. When complete you'll be able to deploy a zitified version of Prometheus and give Prometheus the power to scrape anything from anywhere using OpenZiti.
