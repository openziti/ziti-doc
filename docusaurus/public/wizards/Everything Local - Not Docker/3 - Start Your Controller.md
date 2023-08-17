Start your Ziti Edge Controller with one simple command.

```
startController
```

Example output:

```
$ startController
ziti-controller started as process id: 1286. log located at: /home/vagrant/.ziti/quickstart/bullseye/bullseye.log
```

**Verify the Controller is Running**

Assuming you have sourced the script, you will have an environment variable set named $ZITI_EDGE_CONTROLLER_API. After the controller has started, your controller should be listening at that hostname:port combination. You can see what your value is set to by running echo $ZITI_EDGE_CTRL_ADVERTISED. This variable defaults to: $(hostname):1280. Make sure the controller is on and listening and then start the edge router.

```
$ echo $ZITI_EDGE_CTRL_ADVERTISED
My-Mac-mini.local.domain:1280
```