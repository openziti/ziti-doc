---
sidebar_position: 60
hide_table_of_contents: true
sidebar_label: Kubernetes
title: Kubernetes Quickstart
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`minikube` quickly sets up a local Kubernetes cluster on macOS, Linux, or Windows (WSL). This quickstart is a great way to explore running your own OpenZiti Controller, Router, and Console.

## Tools of the Trade

We'll use the preferred `minikube` Docker driver for this quickstart. You can run `minikube` in WSL with Docker Engine or Docker Desktop, but keep an eye out for one extra step to run `minikube tunnel` at the necessary point in the process.

1. [Install Docker](https://docs.docker.com/engine/install/)
1. [Install `kubectl`](https://kubernetes.io/docs/tasks/tools/)
1. [Install Helm](https://helm.sh/docs/intro/install/)
1. [Install `minikube`](https://minikube.sigs.k8s.io/docs/start/)
1. [Install `ziti` CLI](https://github.com/openziti/ziti/releases/latest)
1. [Install an OpenZiti Tunneler app](https://docs.openziti.io/docs/downloads)
1. Optional: Install `curl` and `jq` for testing an OpenZiti Service in the terminal. 

Make sure these command-line tools are available in your executable search `PATH`.

## Configure DNS

Your computer running `minikube` needs to resolve these three domain names. They will all resolve to the same IP address where minikube exposes ingresses on your OS.

* minicontroller.ziti
* miniconsole.ziti
* minirouter.ziti

<Tabs groupId="operating-systems">
  <TabItem value="win" label="Windows (WSL2)">

   This step allows you to connect to the `minikube` ingresses from Windows or WSL. We'll need that connection to the ingresses later when we run the `ziti` CLI in WSL.

1. Enable localhost binding in WSL.

   ```cmd
   %USERPROFILE%\.wslconfig
   ```

   Add `localhostforwarding=true` to the `[wsl2]` section like this.

   ```ini
   [wsl2]
   # Turn off default connection to bind WSL 2 localhost to Windows localhost
   localhostforwarding=true
   ```

1. Add the DNS names to the system hosts file. This allows us to resolve the DNS names from both Windows and WSL.

   Edit the system hosts file.
   
   ```cmd
   %SYSTEMROOT%\system32\drivers\etc\hosts
   ```

   Add this line to the system hosts file.

   ```ini
   # miniziti
   127.0.0.1  minicontroller.ziti  minirouter.ziti  miniconsole.ziti
   ```

1. Restart WSL.

   ```powershell
   wsl --shutdown
   ```

1. In WSL, verify that Docker restarted successfully.

   ```bash
   docker ps
   ```

   If Docker has restarted then you'll see your running containers, if any. If you don't have any running containers then you'll only see the headings, like this. This is a healthy result and you can skip to the next numbered step.

   ```bash
   $ docker ps
   CONTAINER ID   IMAGE  COMMAND  CREATED  STATUS  PORTS  NAMES
   ```

   If you see an error then you need to restart Docker. If you have Docker Desktop it may be necessary to "Quick Docker Desktop" in the system tray menu (right-click tray icon).

   You can verify that the `docker-desktop-data` instance is running with this PowerShell command.

   ```powershell
   wsl -l -v
   ```

   Example output:

   ```powershell
   % wsl -l -v
   FIXME: paste output here showing WSL, docker-desktop, docker-desktop-data running
   ```

1. In WSL, verify that localhost is bound. You know it's working if you see the *.ziti DNS names in `/etc/hosts` duplicated from Windows.

   ```bash
   grep ziti /etc/hosts
   ```

   It should look like this.

   ```bash
   $ grep ziti /etc/hosts
   127.0.0.1    minicontroller.ziti  minirouter.ziti  miniconsole.ziti
   ```

1. In WSL, Run `minikube tunnel`.

   Keep a separate terminal window open so you can make sure the tunnel is still running and provide your password if prompted. Create a "miniziti" profile if you haven't, and run the tunnel.

   :::info
   You will likely be prompted by `minikube tunnel` for your WSL user's password, but this prompt may not occur immediately. This grants permission for the tunnel to add a route to the minikube node IP. 
   :::

   ```bash
   minikube --profile miniziti start
   minikube --profile miniziti tunnel

   ```

</TabItem>
<TabItem value="mac" label="macOS">

In macOS, `minikube` sets up localhost port forwarding to the IP of the Docker container of the `minikube` node. Docker will forward localhost:80,443/tcp to support the HTTP ingresses to your miniziti cluster.

```bash
sudo tee -a /etc/hosts <<< "127.0.0.1  minicontroller.ziti  minirouter.ziti  miniconsole.ziti" 
```

</TabItem>
<TabItem value="linux" label="Linux">

On Linux, the IP of the `minikube` node running in Docker is routeable via the bridge interface created by `minikube`. Create a "miniziti" profile if you haven't, and obtain the node's external IP for your hosts file.

```bash
minikube --profile miniziti start
sudo tee -a /etc/hosts <<< "$(minikube --profile miniziti ip) minicontroller.ziti  minirouter.ziti  miniconsole.ziti" 
```

</TabItem>
</Tabs>

<Tabs>
  <TabItem value="miniziti.bash" label="BASH Script" default>

## BASH Script

You can run this script or perform the steps manually yourself. Click the "Manual Steps" tab directly above to switch your view. 

It's recommended that you read the script before you run it. It's safe to re-run the script if it encounters a temporary problem.

To run the script you'll need to [download the file](./miniziti.bash) and run it like this:

```bash
bash ./miniziti.bash
```

  </TabItem>
  <TabItem value="manual" label="Manual Steps" default>

## Manual Steps to Learn by Doing

This section explains the actions performed by the `miniziti.bash` script.You need a BASH or ZSH terminal for pasting commands.<br/><br/>

### Create the `miniziti` Cluster

First, let's create a brand new `minikube` profile named "miniziti".

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

A good result looks like this (no errors).

```bash
# macOS and Linux look like this
$ kubectl cluster-info
Kubernetes control plane is running at https://192.168.49.2:8443
CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

```bash
# Windows with WSL looks like this
$ kubectl cluster-info
Kubernetes control plane is running at https://127.0.0.1:49439
CoreDNS is running at https://127.0.0.1:49439/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

### Install Ingress Addons

You will need two Minikube addons:

1. `ingress`: installs the Nginx ingress controller. Ingresses provide access into the cluster and are the only things exposed to networks outside the cluster.
1. `ingress-dns`: provides a DNS server that can answer queries about the cluster's ingresses, e.g. "minicontroller.ziti" which will be created when you install the OpenZiti Controller Helm chart.

```bash
minikube --profile miniziti addons enable ingress
minikube --profile miniziti addons enable ingress-dns
```

OpenZiti will need SSL passthrough, so let's patch the `ingress-nginx` deployment to enable that feature.

```bash
kubectl patch deployment "ingress-nginx-controller" \
   --namespace ingress-nginx \
   --type='json' \
   --patch='[{"op": "add", 
         "path": "/spec/template/spec/containers/0/args/-",
         "value":"--enable-ssl-passthrough"
      }]'

# wait for ingress-nginx
kubectl wait jobs "ingress-nginx-admission-patch" \
    --namespace ingress-nginx \
        --for condition=complete \
        --timeout=120s

kubectl wait pods \
    --namespace ingress-nginx \
    --for=condition=ready \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s
```

Now your miniziti cluster is ready for some OpenZiti!<br/><br/>

### Install the OpenZiti Controller

#### Allow Kubernetes to Manage Certificates

You need to install the required [Custom Resource Definitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) (CRD) for the OpenZiti Controller.

```bash
kubectl apply \
   --filename https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.crds.yaml
kubectl apply \
   --filename https://raw.githubusercontent.com/cert-manager/trust-manager/v0.4.0/deploy/crds/trust.cert-manager.io_bundles.yaml
```

#### Add the OpenZiti Helm Repository

Add the OpenZiti Helm Repo

```bash
helm repo add "openziti" https://docs.openziti.io/helm-charts/
```

#### Install the Controller

Let's create a Helm release named "minicontroller" for the OpenZiti Controller. This will also install sub-charts `cert-manager` and `trust-manager` in the same Kubernetes namespace "ziti-controller."

1. Install the Controller chart

   ```bash
   helm install "minicontroller" openziti/ziti-controller \
      --namespace ziti-controller --create-namespace \
      --set clientApi.advertisedHost="minicontroller.ziti" \
      --values https://docs.openziti.io/helm-charts/charts/ziti-controller/values-ingress-nginx.yaml
   ```

1. This may take a few minutes. Wait the controller's pod status progress to "Running." You can get started on the DNS set up in the next section, but you need the controller up and running to install the router.

   ```bash
   kubectl wait deployments "minicontroller" \
      --namespace ziti-controller \
      --for condition=Available=True \
      --timeout=240s
   ```

### Cluster DNS

Configure CoreDNS in the miniziti cluster. This is necessary no matter which host DNS resolver method you used above. 

1. Add the *.ziti forwarder to the end of the value of `Corefile` in CoreDNS's configmap. Don't forget to substitute the real IP from `minikube --profile miniziti ip` if you get something different than "192.168.49.2", and be mindful to keep the indentation the same as the default `.:53` handler.

   ```bash
   # 1. Edit the configmap. 
   # 2. Save the file. 
   # 3. Exit the editor.
   kubectl edit configmap "coredns" \
      --namespace kube-system
   ```

   ```json
       ziti:53 {
          errors
          cache 30
          forward . 192.168.49.2
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
      ziti:53 {
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

1. Delete the running CoreDNS pod so a new one will pick up the Corefile change you just made. 
   
   ```bash
   kubectl get pods \
      --namespace kube-system \
      | awk '/^coredns-/ {print $1}' \
      | xargs -rl kubectl delete pods \
         --namespace kube-system
   ```

1. Verify that *.ziti DNS names are resolvable from inside your cluster. This is required for your pods to communicate with the OpenZiti Controller's advertised address.You will know it's working because you see the same IP address in the response as when you run `minikube --profile miniziti ip`.

   ```bash
   kubectl run "dnstest" --rm --tty --stdin --image=busybox --restart=Never -- \
         nslookup minicontroller.ziti
   ```

### Install the Router

1. Log in to OpenZiti.

   ```bash
   kubectl get secrets "minicontroller-admin-secret" \
               --namespace ziti-controller \
               --output go-template='{{index .data "admin-password" | base64decode }}' \
      | xargs -rl ziti edge login minicontroller.ziti:443 \
         --yes --username "admin" \
         --password
   ```

1. Create a Router with role "public-routers" and save the enrollment one-time-token as a temporary file.

   ```bash
   ziti edge create edge-router "minirouter" \
      --role-attributes "public-routers" \
      --tunneler-enabled \
      --jwt-output-file /tmp/minirouter.jwt
   ```

1. Install the Router Chart.

   ```bash
   helm install "minirouter" openziti/ziti-router \
      --namespace ziti-router --create-namespace \
      --set-file enrollmentJwt=/tmp/minirouter.jwt \
      --set edge.advertisedHost=minirouter.ziti \
      --set ctrl.endpoint=minicontroller-ctrl.ziti-controller.svc:6262 \
      --values https://docs.openziti.io/helm-charts/charts/ziti-router/values-ingress-nginx.yaml

   kubectl wait deployments "minirouter" \
      --namespace ziti-router \
      --for condition=Available=True
   ```

   These Helm chart values configure the router to use the controller's cluster-internal service that provides the router control plane, i.e., the "ctrl" endpoint.

1. Verify the new router is "online=true"

   ```bash
   ziti edge list edge-routers
   ```

   ```bash
   # example output
   $ ziti edge list edge-routers
   ╭────────────┬────────────┬────────┬───────────────┬──────┬────────────────╮
   │ ID         │ NAME       │ ONLINE │ ALLOW TRANSIT │ COST │ ATTRIBUTES     │
   ├────────────┼────────────┼────────┼───────────────┼──────┼────────────────┤
   │ opR39JLZ2v │ minirouter │ true   │ true          │    0 │ public-routers │
   ╰────────────┴────────────┴────────┴───────────────┴──────┴────────────────╯
   results: 1-1 of 1
   ```

### Install the Console

1. Install the chart

   ```bash
   helm install "miniconsole" openziti/ziti-console \
      --namespace ziti-console --create-namespace  \
      --set ingress.advertisedHost=miniconsole.ziti \
      --set settings.edgeControllers[0].url=https://minicontroller-client.ziti-controller.svc:443 \
      --values https://docs.openziti.io/helm-charts/charts/ziti-console/values-ingress-nginx.yaml
   ```

1. Wait for deployment.

   You'll see an Nginx 503 error while the console is deploying.

   ```bash
   kubectl wait deployments "miniconsole" \
      --namespace ziti-console \
      --for condition=Available=True \
      --timeout=240s
   ```

1. Get the admin password on your clipboard.

   ```bash
   kubectl get secrets "minicontroller-admin-secret" \
      --namespace ziti-controller \
      --output go-template='{{"\nINFO: Your OpenZiti Console http://miniconsole.ziti password for \"admin\" is: "}}{{index .data "admin-password" | base64decode }}{{"\n\n"}}'
   ```

1. Open [http://miniconsole.ziti](http://miniconsole.ziti) in your web browser and login with username "admin" and the password from your clipboard.

### Create OpenZiti Identities and Services

Here's a BASH script that runs several `ziti` CLI commands to illustrate a minimal set of identities, services, and policies.

```bash
ziti edge create identity device "miniziti-client" \
    --jwt-output-file /tmp/miniziti-client.jwt --role-attributes testapi-clients

ziti edge create identity device "testapi-host" \
    --jwt-output-file /tmp/testapi-host.jwt --role-attributes testapi-hosts

ziti edge create config "testapi-intercept-config" intercept.v1 \
    '{"protocols":["tcp"],"addresses":["testapi.ziti"], "portRanges":[{"low":80, "high":80}]}'

ziti edge create config "testapi-host-config" host.v1 \
    '{"protocol":"tcp", "address":"httpbin","port":8080}'

ziti edge create service "testapi-service" \
   --configs testapi-intercept-config,testapi-host-config

ziti edge create service-policy "testapi-bind-policy" Bind \
    --service-roles '@testapi-service' --identity-roles '#testapi-hosts'

ziti edge create service-policy "testapi-dial-policy" Dial \
    --service-roles '@testapi-service' --identity-roles '#testapi-clients'

ziti edge create edge-router-policy "public-routers" \
    --edge-router-roles '#public-routers' --identity-roles '#all'

ziti edge create service-edge-router-policy "public-routers" \
    --edge-router-roles '#public-routers' --service-roles '#all'

ziti edge enroll /tmp/testapi-host.jwt
```

### Install the `httpbin` Demo API Server Chart

This Helm chart installs an OpenZiti fork of `go-httpbin`, so it doesn't need to be accompanied by an OpenZiti Tunneler. We'll use it as a demo API to test the OpenZiti Service you just created named "testapi-service".

```bash
helm install "testapi-host" openziti/httpbin \
   --set-file zitiIdentity=/tmp/testapi-host.json \
   --set zitiServiceName=testapi-service
```

  </TabItem>
</Tabs>

## Add the Client Identity

Add the client identity you created to your OpenZiti Tunneler.

Follow [the instructions for your tunneler OS version](https://docs.openziti.io/docs/reference/tunnelers/) to add the OpenZiti Identity that was saved as filename `/tmp/miniziti-client.jwt` (or WSL's "tmp" directory, e.g., `\\wsl$\Ubuntu\tmp` in Desktop Edge for Windows).

As soon as identity enrollment completes you should have a new OpenZiti DNS name available to this device. Let's test that with a DNS query.

```bash
# this DNS answer is coming from the OpenZiti Tunneler, e.g. Ziti Desktop Edge
nslookup testapi.ziti
```

## Test the Demo API Service

```bash
# macOS or Linux, including WSL
curl -sSf -XPOST -d ziti=awesome http://testapi.ziti/post | jq .data
```

Visit [http://testapi.ziti/get](http://testapi.ziti/get) in your web browser in macOS, Linux, or Windows to see a JSON test response from the demo server.

## Explore the OpenZiti Console

Now that you've successfully tested the OpenZiti Service, check out the various entities in your that were created by the script in [http://miniconsole.ziti/](http://miniconsole.ziti/).

## Next Steps

1. In the OpenZiti Console, try to revoke then restore your permission to acess the demo services.
1. Deploy a non-Ziti demo application to Kubernetes and securely [share it with a Ziti proxy pod](../services/kubernetes-service)
1. Add a configs, service, and policies to access the Kubernetes apiserver with OpenZiti. 
   1. Hint: the apiserver's address is "kubernetes.default.svc:443" inside the cluster. 
   1. Hint: After you create the configs, service, and policies, grant "Bind" permission for the service to "minirouter" by adding a role.

      ```bash
      # the role you add needs to match the bind policy's identity roles
      ziti edge update identity "minirouter" \
         --role-attributes k8sapi-hosts
      ```

   1. Connect to the K8s apiserver from another computer with [`kubeztl`, the OpenZiti fork of `kubectl`](https://github.com/openziti-test-kitchen/kubeztl/). `kubeztl` works by itself without an OpenZiti Tunneler.
1. Share the demo server with someone.
   1. Create another identity named " miniziti-client2" with role "hello-clients" and send it to someone. 
   1. Ask them to [install a tunneler and load the identity](https://docs.openziti.io/docs/reference/tunnelers/) so they too can access [http://hello.ziti/](http://hello.ziti/).

## Cleanup

<Tabs groupId="operating-systems-cleanup">
<TabItem value="win" label="Windows (WSL2)">

1. Remove the `mini*.ziti` DNS names from the system hosts file.

   Edit the system hosts file.
   
   ```cmd
   %SYSTEMROOT%\system32\drivers\etc\hosts
   ```

   Remove this line.

   ```ini
   # miniziti
   127.0.0.1  minicontroller.ziti  minirouter.ziti  miniconsole.ziti
   ```

</TabItem>
<TabItem value="mac" label="macOS">

1. Remove the `mini*.ziti` names from `/etc/hosts`.

   ```bash
   sudo sed -iE '/mini.*\.ziti/d' /etc/hosts
   ```

</TabItem>
<TabItem value="linux" label="Linux">

1. Remove the `mini*.ziti` names from `/etc/hosts`.

   ```bash
   sudo sed -iE '/mini.*\.ziti/d' /etc/hosts
   ```

</TabItem>
</Tabs>

2. Delete the cluster.

   ```bash
   minikube --profile miniziti delete
   ```

2. In your OpenZiti Tunneler, "Forget" your Identity.

## minikube `ingress-dns` nameserver

This option configures your host to use use the DNS addon we enabled earlier for DNS names like *.ziti. If you do this then you don't need to edit the `/etc/hosts` file at all.

1. Make sure the DNS addon is working. Send a DNS query to the  address where the ingress nameserver is running.

   ```bash
   nslookup minicontroller.ziti $(minikube --profile miniziti ip)
   ```

   You know it's working if you see the same IP address in the response as when you run `minikube --profile miniziti ip`.

1. Configure your computer to always send certain DNS queries to the `ingress-dns` nameserver. Follow the steps in [the `minikube` web site](https://minikube.sigs.k8s.io/docs/handbook/addons/ingress-dns/#installation) to configure macOS, Windows, or Linux's DNS resolver.

   Now that your computer is set up to use the `minikube` DNS server for DNS names that end in *.ziti, you can test it again without specifying where to send the DNS query.

   ```bash
   # test your DNS configuration
   nslookup minicontroller.ziti
   ```

   You know it's working if you see the same IP address in the response as when you run `minikube --profile miniziti ip`.
