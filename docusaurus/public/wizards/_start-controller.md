---
description: Make this the title
junk: this is junk
---

```bash
startController
```

Example output:

```bash
$ startController
ziti-controller started as process id: 1286. log located at: /home/vagrant/.ziti/quickstart/bullseye/bullseye.log
```

### Verify the Controller is Running

After running `expressInstall`, you will have environment variables set named `ZITI_CTRL_EDGE_ADVERTISED_ADDRESS` and
`ZITI_CTRL_EDGE_ADVERTISED_PORT`. After the controller has started, your controller should be listening at that
address:port combination. (Note, if you do not have these environment variables, you've probably closed your shell and opened
it up again. You can get the environment variables by sourcing the ".env" file.
[See the section at the bottom of the page](https://docs.openziti.io/docs/learn/quickstarts/network/local-no-docker/#sourcing-the-env-file)
for details)

You can see what your value is set to by running
`echo "${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}"`. This value defaults to:
`$(hostname -s):1280`. Make sure the controller is on and listening and then start the edge router.

```bash
echo "${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}"
```

Example output:

```bash
$ echo "${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}"
My-Mac-mini:1280
```
### Start Your Edge Router

Now that the controller is ready, you can start the edge router created with the 'express' process. You can start this
router locally by running:

```bash
startRouter
```

Example output:

```bash
$ startRouter
Express Edge Router started as process id: 1296. log located at: /home/vagrant/.ziti/quickstart/bullseye/bullseye-edge-router.log
```

You can verify the edge router is listening by finding the value of `$ZITI_ROUTER_ADVERTISED_ADDRESS:$ZITI_EDGE_ROUTER_PORT`.
Again, this will default to using `$(hostname -s)` as the host name and port 3022.

### Stopping the Controller and Router

```bash
stopRouter 
stopController 
```

Example output:

```bash
$ stopRouter 
INFO: Router stopped.

$ stopController 
INFO: Controller stopped.
```