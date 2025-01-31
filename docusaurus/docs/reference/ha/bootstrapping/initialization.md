---
sidebar_label: Initialization
sidebar_position: 40
---

# Initializing the First Controller

First start the controller:

```shell
ziti controller run </path/to/controller-config.yml>
```

Since this controller has not yet been initialized, it does not have an administrator 
identity that can be used to manage the network. The controller will pause startup
and wait for initialization. While waiting it will periodically emit a message:

```buttonless title="Output"
[   3.323] WARNING ziti/controller/server.(*Controller).checkEdgeInitialized: the 
Ziti Edge has not been initialized, no default admin exists.  Add this node to a 
cluster using 'ziti agent cluster add tls:localhost:6262' against an existing 
cluster member, or if this is the bootstrap node, run 'ziti agent controller init' 
to configure the default admin and bootstrap the cluster
```

As this is the first node in the cluster, there's no existing cluster to add it to. 

To add the default administrator, run:

```
ziti agent controller init <admin username> <admin password> <admin identity name>
```

This initializes an admin user that can be used to manage the network.

Once the admin user is created, the controller should be up and running. This is
now a functional HA cluster, albeit with a cluster size of one.
