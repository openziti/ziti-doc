The [previous post][1] showed how to use a zero trust overlay like Ziti for transferring files by zitifying `scp`. Next
up in the list of zitifications is `kubectl`. [Kubernetes][2] is a container orchestration system. Its purpose is to
deploy, scale, and manage the deployment containers. Containers are self-contained, pre-built images of software
generally with a singular purpose. Developers often like using containers because they are self-contained. This means
the containers are able to run anywhere there's a container engine such as on their local computer using a container
engine. This is where Kubernetes starts to come into focus.

In this article we'll use a cloud provider to make us a Kubernetes cluster (Oracle OKE in this case). Once created we
will then access the cluster three ways:

1. Via the public Kubernetes API secured via mTLS. This is the default, out of the box mechanism provided by Kubernetes.
2. Via a tunneling app. I run Windows so I'll use the Ziti Desktop Edge for Windows.
3. Via a zitified `kubectl`. Here's where we'll get to see the power of a truly zitified application. We'll be able to
   access our cluster extremely securely using the Ziti overlay network without installing an additional agent. Once
   access to the cluster comes entirely from the [Ziti Network][8] we will be able to turn public access to the
   Kubernetes management API entirely!

***

## About Kubernetes

If you are not already familiar with Kubernetes then it's probably best for you to stop reading and learn a little about
it first. Though this article only expects you to understand the most rudimentary of commands, it won't teach you enough
about Kubernetes to understand the what's and why's. Lots of documentation on this topic already exist and are just a
search away in your search engine of choice.

Kubernetes itself is not a container engine, it's an orchestrator. This means that Kubernetes knows how to interface
with container engines to do that deployment and management of workloads on the behalf of operators. This provides
people with a common abstraction to use when doing this management and deployment. Interacting with the Kubernetes API
is made easy by using the command-line tool: `kubectl`.

[kubectl][4] provides numerous commands and utilities to interact with your Kubernetes cluster. It does this by creating
REST requests to a well-known endpoint. This endpoint is a highly-valuable target as it is the entry-point to the
cluster. Plenty of blogs exist already on the internet addressing how to secure this endpoint but in this post we'll
take it one step further than ever before by removing the Kubernetes control plane from the internet entirely. Following
that we will even go one step further by replacing the existing `kubectl` command with a zero-trust implementation
leveraging the ziti golang sdk.

If you'd prefer to watch a video that goes over the same content contained in the rest of this article you can go ahead
and click here to watch.

<a href="https://youtu.be/CRoansolpR0">
    <img alt="Secure Kubernetes" src="https://img.youtube.com/vi/CRoansolpR0/0.jpg" height="180px">
</a>

* * *

## Setup

Below is an overview of the [Ziti Network][8] created. On the left you can see that the client, my computer, runs
Windows 10. Inside Windows 10 I run linux and bash using Ubuntu via [Windows Subsystem For Linux (WSL)][5]. If you run
Windows and don't have WSL installed I would encourage you to install and learn it!  In my bash shell I have downloaded
the linux version of `kubectl` created by combining the Ziti Golang SDK into it. You too can grab it from [this link][6]
if you like or go check out [the code on github][7] and build it yourself! :)

### Solution Overview

![private-kubernetes.svg][3]

### Basic Ziti Setup

To accomplish our stated goals, we will need not only an existing [Ziti Network][8] but we'll also have to configure
that network accordingly. Here's a list of the components necessary to deliver Kubernetes with our zero-trust network:

1. A configuration for the `Bind` side of the service. This informs the identity within Kubernetes where to send traffic
   and how.
2. A configuration for the `Dial` side of the service. This is strictly **only** necessary for tunneling apps. In this
   example, for the Ziti Desktop Edge for Windows and specifies what host and port will be interecepted on the machine
   running the stock `kubectl`. for Windows.
3. The service itself which ties our polices mentioned above together.
4. A `Bind` service-policy which specifies which identities are allowed to act as a "host" for the service (meaning an
   identity to send traffic to which knows where and how to offload that traffic). In our example this will be
   the `ziti-edge-tunnel` running in a Kubernetes pod.
5. A `Dial` service-policy which specified the identities allowed to access the service. This will be the identity using
   `kubectl`.

Here are some example commands using the [ziti cli][9] which illustrate how to create these services. Some things of
note worth mentioning. I'm setting a variable to make my configuration easier. I reuse these code blocks a lot and by
extracting some variables it makes it easy for me to delete/recreate services. First I set the `service_name`
variable. I use this variable in all the names of the Ziti objects I create just to make it more clear and obvious if I
have to look back at my configuration again.

After that, since I'm going to be access my Kubernetes API deployed in the Oracle cloud - I chose to use `k8s.oci` as my
service name. Next - the Kubernetes API is generated with numerous SANS and IP address I can choose from. The Oracle
cloud console returns the private IP of `10.0.0.6` when clicking on the 'Access Cluster' button which is why I use that
value below. I could also choose to use any of the DNS names provided by OKE. There are at least five I could choose
from, all visible as SANS on the cert that the server returns: kubernetes, kubernetes.default, kubernetes.default.svc,
kubernetes.default.svc.cluster, kubernetes.default.svc.cluster. local. I went with the IP since it's obvious that it's
an internal IP. Also worth noticing is that I'm mapping the port as well. I'm changing the port that the server
provides, 6443, to the common HTTPS port of 443 for the local intercept. With zitified `kubectl` we don't even need
these intercepts, but we'll keep it here so that we can use the unmodified `kubectl` as well. Also note that these
command are all run in bash.

```bash
service_name=k8s.oci
ziti edge create config "${service_name}"-host.v1 host.v1 \
    '{"protocol":"tcp", "address":"10.0.0.6","port":6443 }'
    
ziti edge create config "${service_name}"-client-config intercept.v1 \
    '{"protocols":["tcp"],"addresses":["10.0.0.6","kubernetes"], "portRanges":[{"low":443, "high":443}]}'
    
ziti edge create service \
    "${service_name}" \
    --configs "${service_name}"-client-config,"${service_name}"-host.v1
    
ziti edge create service-policy "${service_name}"-binding Bind \
    --service-roles '@'"${service_name}" \
    --identity-roles '#'"${service_name}"'ServerEndpoints'
    
ziti edge create service-policy "${service_name}"-dialing Dial \
    --service-roles '@'"${service_name}" \
    --identity-roles '#'"${service_name}"'ClientEndpoints'
```

## Kubernetes Config Files

endpoints are often described entirely in a file on your local file system. By default, this file will be located at
`$USER/.kube/config` (`%USERPROFILE%\.kube\config` for Windows users).

## Cheatsheat Commands

[1]: /articles/zitification/zitifying-scp/index.html

[2]: https://Kubernetes.io/

[3]: ./private-kubernetes.svg

[4]: https://Kubernetes.io/docs/reference/kubectl/overview/

[5]: https://docs.microsoft.com/en-us/windows/wsl/install

[6]: https://github.com/openziti-incubator/kubectl/releases/latest/download/kubectl-linux-amd64

[7]: https://github.com/openziti-incubator/kubectl

[8]: /ziti/overview.html#overview-of-a-ziti-network

[9]: https://github.com/openziti/ziti/releases/latest