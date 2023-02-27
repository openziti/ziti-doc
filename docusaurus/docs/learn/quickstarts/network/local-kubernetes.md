---
sidebar_position: 60
sidebar_label: Kubernetes
---

# Kubernetes Quickstart

`minikube` quickly sets up a local Kubernetes cluster on macOS, Linux, or Windows. This quickstart is a great way to explore running your own OpenZiti controller and routers. I'll assume you have a terminal with BASH or ZSH terminal for pasting commands.

## Before You Begin

`minikube` can be deployed as a VM, a container, or bare-metal. We'll use the preferred Docker driver for this quickstart.

1. [Install Docker](https://docs.docker.com/engine/install/)
1. [Install `kubectl`](https://kubernetes.io/docs/tasks/tools/)
1. [Install Helm](https://helm.sh/docs/intro/install/)
1. [Install `minikube`](https://minikube.sigs.k8s.io/docs/start/)
1. [Install `ziti` CLI](https://github.com/openziti/ziti/releases/latest)
1. [Install a Ziti tunneler app](https://docs.openziti.io/docs/downloads)
1. Optional: Install `curl` and `jq` for testing a Ziti service in the terminal. 

## Create the `miniziti` Cluster

First, let's create a brand new `minikube` profile named "miniziti". We'll also use "*.miniziti" as a top-level domain name to represent the Kubernetes cluster in DNS.

```bash
minikube --profile miniziti start
```

`minikube` will try to configure the default context of your KUBECONFIG. Let's test the connection to the new cluster. 

:::info
You can always restore the KUBECONFIG context from this Minikube quickstart like this:

```bash
minikube --profile miniziti update-context
```

:::

Let's do a quick test of the current KUBECONFIG context.

```bash
kubectl cluster-info
```

## Install `minikube` Addons

We'll use the `ingress-nginx` and associated DNS addon in this quickstart. This allows us to run DNS locally instead of deploying cloud infrastructure for this exercise.

```bash
minikube --profile miniziti addons enable ingress
minikube --profile miniziti addons enable ingress-dns
```

Ziti will need SSL passthrough, so let's patch the `ingress-nginx` deployment to enable that feature.

```bash
kubectl patch deployment -n ingress-nginx ingress-nginx-controller \
   --type='json' \
   --patch='[{"op": "add", 
         "path": "/spec/template/spec/containers/0/args/-",
         "value":"--enable-ssl-passthrough"
      }]'
```

Now your miniziti cluster is ready for some Ziti!

## Install the Ziti Controller

### Required Custom Resource Definitions

You need to first install the required [Custom Resource Definitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) (CDR) that Ziti Controller will use. This adds APIs to Kubernetes for managing certificates.

```bash
kubectl apply \
   -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.crds.yaml
kubectl apply \
   -f https://raw.githubusercontent.com/cert-manager/trust-manager/v0.4.0/deploy/crds/trust.cert-manager.io_bundles.yaml
```

### Install the Controller Helm Chart

Let's create a Helm release named "miniziti" for our Ziti controller. This will also install sub-charts `cert-manager` and `trust-manager` in the same Kubernetes namespace "ziti-controller."

```bash
helm install \
   --create-namespace --namespace ziti-controller \
   "miniziti" \
   openziti/ziti-controller \
      --set clientApi.advertisedHost="controller.miniziti" \
      --values https://docs.openziti.io/helm-charts/charts/ziti-controller/values-ingress-nginx.yaml
```

This may take a few minutes. You can watch the controller's pod status progress to "Running" like this.

```bash
kubectl --namespace ziti-controller get pods --watch
```

## Configure DNS

Let's configure your computer (the one that's running `minikube`) and the miniziti cluster to use the DNS addon we enabled earlier. The addon provides a nameserver that can answer queries about the cluster's ingresses, e.g. "controller.miniziti" which we just created by installing the controller chart.

1. First, let's make sure the DNS addon is working. Send a DNS query to the `minikube ip` address where the ingress nameserver is running.

   ```bash
   nslookup controller.miniziti $(minikube --profile miniziti ip)
   ```

1. Next, let's configure your computer to send certain DNS queries to the `minikube ip` DNS server automatically. They have a pretty good guide for this step over at [the `minikube` web site](https://minikube.sigs.k8s.io/docs/handbook/addons/ingress-dns/#installation).

   Now that your computer is set up to use the `minikube` DNS server for DNS names that end in "*.miniziti", you can test it again without specifying where to send the DNS query.

   ```bash
   # test your DNS configuration
   nslookup controller.miniziti
   ```

   You know it's working if you see the same IP address in the response as when you run `minikube ip`.

1. Finally, let's configure the miniziti cluster too. Add the miniziti forwarder to the end of the value of `Corefile` in CoreDNS's configmap. Don't forget to substitute the real IP for `{MINIKUBE_IP}`, and be mindful to keep the indentation the same as the default `.:53` handler.

   ```bash
   # 1. Edit the configmap. 
   # 2. Save the file. 
   # 3. Exit the editor.
   kubectl --namespace kube-system edit configmap "coredns"
   ```

   ```json
    miniziti:53 {
            errors
            cache 30
            forward . {MINIKUBE_IP}
    }
   ```

   It should look like this.

   ```yaml
   apiVersion: v1
   data:
   Corefile: |
      .:53 {
         log
         errors
         health {
            lameduck 5s
         }
         ready
         kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
         }
         prometheus :9153
         hosts {
            192.168.49.1 host.minikube.internal
            fallthrough
         }
         forward . /etc/resolv.conf {
            max_concurrent 1000
         }
         cache 30
         loop
         reload
         loadbalance
      }
      miniziti:53 {
               errors
               cache 30
               forward . 192.168.49.2
      }
   kind: ConfigMap
   metadata:
   creationTimestamp: "2023-02-25T16:17:24Z"
   name: coredns
   namespace: kube-system
   resourceVersion: "19660"
   uid: deae90e7-5b3d-49ea-b996-4f525da5597a
   ```

   Delete the running CoreDNS pod so a new one will pick up the Corefile change you just made. 
   
   ```bash
   # 1. Find the name of the pod.
   kubectl --namespace kube-system get pods | grep coredns
   ```

   ```bash
   # 2. Issue the delete command.
   kubectl --namespace kube-system delete pods # coredns-787d4945fb-j8vwj
   ```

   Test DNS from inside your cluster. You know it's working if you see the same IP address in the response as when you run `minikube ip`.

   ```bash
   kubectl run --rm --tty --stdin dnstest --image=busybox --restart=Never -- \
         nslookup controller.miniziti
   ```

## Install the Router Helm Chart

1. Log in to Ziti.

   ```bash
   ziti edge login controller.miniziti:443 \
      --yes --username admin \
      --password $(
         kubectl --namespace ziti-controller \
            get secrets miniziti-controller-admin-secret \
            -o go-template='{{index .data "admin-password" | base64decode }}'
      )
   ```

1. Create a Router with role "default" and save the enrollment one-time-token as a temporary file.

   ```bash
   ziti edge create edge-router "minirouter" \
      --role-attributes default \
      --tunneler-enabled \
      --jwt-output-file /tmp/minirouter.jwt
   ```

1. List your minirouter.

   ```bash
   ziti edge list edge-routers
   ```

   ```bash
   # example output
   $ ziti edge list edge-routers
   ╭────────────┬────────────┬────────┬───────────────┬──────┬────────────╮
   │ ID         │ NAME       │ ONLINE │ ALLOW TRANSIT │ COST │ ATTRIBUTES │
   ├────────────┼────────────┼────────┼───────────────┼──────┼────────────┤
   │ oYl6Zi2oKS │ minirouter │ false  │ true          │    0 │ default    │
   ╰────────────┴────────────┴────────┴───────────────┴──────┴────────────╯
   results: 1-1 of 1
   ```

1. Install the Router Chart.

   ```bash
   helm install \
      --create-namespace --namespace ziti-router \
      "minirouter" \
      openziti/ziti-router \
         --set-file enrollmentJwt=/tmp/minirouter.jwt \
         --set edge.advertisedHost=minirouter.miniziti \
         --set ctrl.endpoint=miniziti-controller-ctrl.ziti-controller.svc:6262 \
         --values https://docs.openziti.io/helm-charts/charts/ziti-router/values-ingress-nginx.yaml
   ```

   These Helm chart values configure the router to use the controller's cluster-internal service that provides the router control plane, i.e., the "ctrl" endpoint.

## Install the Console Helm Chart

1. Install the chart

   ```bash
   helm install \
      --create-namespace --namespace ziti-console \
      "miniconsole" \
      openziti/ziti-console \
         --set ingress.advertisedHost=miniconsole.miniziti \
         --set settings.edgeControllers[0].url=https://controller.miniziti \
         --values https://docs.openziti.io/helm-charts/charts/ziti-console/values-ingress-nginx.yaml
   ```

1. Get the admin password on your clipboard.

   ```bash
   # print the admin password and a newline to
   # make it easier to copy to your clipboard
   echo $(kubectl --namespace ziti-controller \
      get secrets miniziti-controller-admin-secret \
         -o go-template='{{index .data "admin-password" | base64decode }}')
   ```

1. Open [http://miniconsole.miniziti](http://miniconsole.miniziti) in your web browser and login with username "admin" and the password from your clipboard.

## Create Ziti Identities and Services

Here's a BASH script that runs several `ziti` CLI commands to illustrate a minimal set of identities, services, and policies.

```bash
ziti edge create identity device edge-client1 \
    --jwt-output-file /tmp/edge-client1.jwt --role-attributes webhook-clients

ziti edge create identity device webhook-server1 \
    --jwt-output-file /tmp/webhook-server1.jwt --role-attributes webhook-servers

ziti edge create config webhook-intercept-config intercept.v1 \
    '{"protocols":["tcp"],"addresses":["webhook.miniziti"], "portRanges":[{"low":80, "high":80}]}'

ziti edge create config webhook-host-config host.v1 \
    '{"protocol":"tcp", "address":"httpbin","port":8080}'

ziti edge create service webhook-service1 --configs webhook-intercept-config,webhook-host-config

ziti edge create service-policy webhook-bind-policy Bind \
    --service-roles '@webhook-service1' --identity-roles '#webhook-servers'

ziti edge create service-policy webhook-dial-policy Dial \
    --service-roles '@webhook-service1' --identity-roles '#webhook-clients'

ziti edge create edge-router-policy default \
    --edge-router-roles '#default' --identity-roles '#all'

ziti edge create service-edge-router-policy default \
    --edge-router-roles '#default' --service-roles '#all'

ziti edge enroll /tmp/webhook-server1.jwt
```

## Install the `httpbin` Demo Webhook Server Chart

This Helm chart installs a Ziti fork of `go-httpbin`, so it doesn't need to be accompanied by a Ziti tunneler. We'll use it as a demo webhook server to test the Ziti service you just created named "webhook-service1".

```bash
helm install webhook-server1 openziti/httpbin \
   --set-file zitiIdentity=/tmp/webhook-server1.json \
   --set zitiServiceName=webhook-service1
```

## Load the Client Identity in your Ziti Tunneler

Follow [the instructions for your tunneler OS version](https://docs.openziti.io/docs/reference/tunnelers/) to add the Ziti identity that was saved as filename `/tmp/edge-client1.jwt`.

As soon as identity enrollment completes you should have a new DNS name available to you. Let's test that with a DNS query.

```bash
# this DNS answer is coming from the Ziti tunneler
nslookup webhook.miniziti
```

## Test the Webhook Service

```bash
curl -sSf -XPOST -d ziti=awesome http://webhook.miniziti/post | jq .data
```

You can also visit [http://webhook.miniziti/get](http://webhook.miniziti/get) in your web browser to see a JSON test response from the demo server.

## Explore the Ziti Console

Now that you've successfully tested the Ziti service, check out the various entities in your that were created by the script in [http://miniconsole.miniziti/](http://miniconsole.miniziti/).

## Optional Hello Server Demo

1. Create a Ziti service, configs, and policies for the Hello Demo Server

   ```bash
   ziti edge create identity device hello-server1 \
      --jwt-output-file /tmp/hello-server1.jwt --role-attributes hello-servers

   ziti edge create config hello-intercept-config intercept.v1 \
      '{"protocols":["tcp"],"addresses":["hello.miniziti"], "portRanges":[{"low":80, "high":80}]}'

   ziti edge create config hello-host-config host.v1 \
      '{"protocol":"tcp", "address":"hello-server1.default.svc","port":80}'

   ziti edge create service hello-service1 --configs hello-intercept-config,hello-host-config

   ziti edge create service-policy hello-bind-policy Bind \
      --service-roles '@hello-service1' --identity-roles '#hello-servers'

   ziti edge create service-policy hello-dial-policy Dial \
      --service-roles '@hello-service1' --identity-roles '#hello-clients'

   ziti edge update identity edge-client1 \
      --role-attributes webhook-senders,hello-clients

   ziti edge enroll /tmp/hello-server1.jwt
   ```

1. Install the Hello Toy chart.

   This chart is a regular, non-Ziti demo server deployment. Next we'll connect it to our Ziti network with a Ziti tunneler deployment.

   ```bash
   helm install hello-ziti-1 openziti/hello-toy \
      --set serviceDomainName=hello-server1
   ```

1. Deploy a Ziti Hosting Tunneler

   This chart installs a Ziti tunneler in hosting mode to connect regular cluster services to the Ziti network.

   ```bash
   helm install ziti-host1 openziti/ziti-host \
      --set-file zitiIdentity=/tmp/hello-server1.json
   ```

1. Visit the Hello Demo page in your browser: [http://hello.miniziti/](http://hello.miniziti/)

   Now you have two Ziti services available to your Ziti tunneler app.

## Next Steps

1. In the Ziti Console, fiddle the policies and roles to revoke then restore your permission to acess the demo services.
1. Add a service, configs, and policies to expose the Kubernetes apiserver as a Ziti service. 
   1. Hint, the address is "kubernetes.default.svc:443" inside the cluster. 
   1. Connect to the K8s apiserver from another computer with [`kubeztl`, the Ziti fork of `kubectl`](https://github.com/openziti-test-kitchen/kubeztl/). `kubeztl` works by itself without a Ziti tunneler.
1. Share the demo server with someone.
   1. Create another identity named " edge-client2" with role "hello-clients" and send it to someone. 
   1. Ask them to [install a tunneler and load the identity](https://docs.openziti.io/docs/reference/tunnelers/) so they too can access [http://hello.miniziti/](http://hello.miniziti/).
