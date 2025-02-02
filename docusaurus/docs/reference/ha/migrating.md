---
sidebar_label: Migrating
sidebar_position: 30
---

# Migrating Controllers

A controller can be moved from standalone mode to HA mode. It can also be returned
from HA mode back to standalone mode.

## Standalone to HA

### Requirements
First, ensure that the controller's certificates and configuration meet the requirements
in [Bootstrapping](./bootstrapping.md).

### Data Model Migration
The controller's data can be imported in one of two ways:

**Using Config**

Leave the `db: </path/to/ctrl.db/>` setting in the controller config. When the controller
starts up, it will see that it's running in HA mode, but isn't initialized yet. It will
try to use the database in the configuration to initialize its data model.

**Using the Agent**

The agent can also be used to provide the controller database to the controller.

```
ziti agent controller init-from-db path/to/source.db
```

Once the controller is initialized, it should start up as normal and be usable.
The cluster can now be expanded as explained in [Bootstrapping](./bootstrapping.md).

## HA to Standalone

This assumes that you have a database snapshot from an HA cluster. This could either
be the ctrl-ha.db from the `dataDir`, or a snapshot created using the snapshot 
CLI command. 

To revert back to standalone mode, the `raft` section would be removed from the
config file and the `db:` section would be added back, pointing at the snapshot
from the HA cluster. Now when started, it should come up in standalone mode.
