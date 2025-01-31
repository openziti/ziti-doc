---
sidebar_label: Routers
sidebar_position: 40
---

# Routers in Controller HA

There are only a few differences in how routers work in an HA cluster.

## Configuration

Instead of specifying a single controller, you can specify multiple controllers
in the router configuration.

```yaml
ctrl:
  endpoints:
    - tls:192.168.3.100:6262
    - tls:192.168.3.101:6262
    - tls:192.168.3.102:6262
```

If the controller cluster changes, it will notify routers of the updated 
controller endpoints. 

By default these will be stored in a file named `endpoints` in the same directory
as the router config file.

However, the file can be customized using a config file settings.

```yaml
ctrl:
  endpoints:
    - tls:192.168.3.100:6262
  endpointsFile: /var/run/ziti/endpoints.yaml
```

In general, a router should only need one or two controllers to bootstrap itself,
and thereafter should be able to keep the endpoints list up to date with help 
from the controller.

## Router Data Model

In order to enable HA functionality, the router now receives a stripped down 
version of the controller data model. While required for controller HA, this 
also enables other optimizations, so use of the router data model is also enabled
by default when running in standalone mode. 

The router data model can be disabled on the controller using a config setting,
but since it is required for HA, that flag will be ignored if the controllers
are running in a cluster.

The data model on the router is periodically snapshotted, so it doesn't need to
be fully restored from a controller on every restart. 

The location and frequency of snapshotting can be [configured](../configuration/router#edge).

## Controller Selection

When creating circuits, routers will chose the most responsive controller, based on latency.
When doing model updates, such as managing terminators, they will try to talk directly to
the current cluster leader, since updates have to go through the leader in any case.
