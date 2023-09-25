---
title: Kubernetes Node Daemonset
sidebar_label: Node Proxy
sidebar_position: 70
---

This [daemonset manifest](https://get.openziti.io/tun/docker/ziti-tun-daemonset.yaml) installs a privileged Ziti tunneler on each selected node. The tunneler provides a nameserver to CoreDNS for resolving Ziti addresses, and IP routes to capture pod egress for Ziti services. 

## Configure CoreDNS

The default nameserver address is `100.64.0.2`, but containers don't automatically use it until you configure cluster DNS. CoreDNS doesn't currently have a fallthrough mechanism, but you can use conventional names for your OpenZiti services' like `*.ziti`, and configure CoreDNS to forward queries that match that namespace to the OpenZiti nameserver.

```
apiVersion: v1
data:
  Corefile: |
    .:53 {
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
        forward . /etc/resolv.conf {
           max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
    ziti {
        forward . 100.64.0.2
    }
```

Some Kubernetes distributions provide a method for persisting CoreDNS configuration, e.g., the `import` plugin. A common pattern is for the CoreDNS pod to mount a configmap with a particular name in the `kube-system` namespace, e.g., `coredns-custom` on a directory like `/etc/coredns/custom/` with an aligned statement in the Corefile like `import /etc/coredns/custom/*.server`. The CoreDNS customization configmap then has contents like:

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  ziti.server: |
    ziti {
      forward . 100.64.0.2
    }
```

The result is that CoreDNS automatically includes Corefile server blocks from the customization configmap.
