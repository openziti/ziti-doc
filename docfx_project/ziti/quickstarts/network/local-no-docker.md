# Local - No Docker

This page will show you how to get your [Ziti Network](~/ziti/overview.md#overview-of-a-ziti-network) up and running 
quickly and easily, entirely locally. Since you'll be running everything locally you'll have no issues communicating
between network components. All the processes will run locally and you'll be responsible for starting and stopping them
when you want to turn the overlay network on or off.

## Preparation

There is not much preparation necessary to getting up-and-running locally. At this time, this guide expects that
you'll be running commands within a `bash` shell. If you're running Windows, you will need to make sure you have 
Windows Subsystem for Linux installed for now. We plan to provide a Powershell script in the future but for now the
script requires you to be able to use `bash`.

## One-liner Setup

Running the latest version of Ziti locally is as simple as running this one command:

    source <(wget -qO- https://raw.githubusercontent.com/openziti/ziti/release-next/quickstart/docker/image/ziti-cli-functions.sh); expressInstall

This script will perform an 'express' install of Ziti which does the following:

* download the latest version of the Ziti components (`ziti`, `ziti-controller`, `ziti-edge-router`, `ziti-tunnel`)
* extract the components into a predefined location: ~/.ziti/quickstart/$(hostname)
* create a full PKI for you to explore
* create a controller configuration using default values and the PKI created above
* create an edge-router configuration using default values and the PKI created above 
* add helper functions and environment variables to your shell (explore the script to see all)

## Start the Components

Once the latest version of Ziti has been downloaded and added to your path it's time to start your controller and 
edge router. 

### Start Your Controller

Start your controller by running `startZitiController`. The location of the log file will be output for you to look
at, tail etc. Notice that this log is written to the given location. There is no log rotation. Once run you will see
output that looks like the following:

```bash
ziti-controller started as process id: 7282. log located at: /Users/clint/.ziti/quickstart/My-Mac-mini.local.domain/ziti-edge-controller.log
```

### Verify the Controller is Running

Assuming you have sourced the script you will have an environment variable set named `$ZITI_EDGE_CONTROLLER_API`. After
the controller has started, your controller should be listening at that hostname:port combination. You can see what your
value is set to by running `echo $ZITI_EDGE_CONTROLLER_API`. This variable defaults to: `$(hostname):1280`. Make sure the
controller is on and listening and then start the edge router. It's best to make sure port 1280 is free before running
the controller.

```bash
~ % echo $ZITI_EDGE_CONTROLLER_API
My-Mac-mini.local.domain:1280
```

### Start Your Edge Router

Now that the controller is ready you can start the edge router created with the 'express' process. You can start this 
router locally by running `startExpressEdgeRouter`.

You should see output that looks like this:

```bash
Express Edge Router started as process id: 7555. log located at: /Users/clint/.ziti/quickstart/My-Mac-mini.local.domain/My-Mac-mini.local.domain-edge-router.log
```

You can verify the edge router is listening by finding the value of `$ZITI_EDGE_ROUTER_HOSTNAME:$ZITI_EDGE_ROUTER_PORT`.
Again this will default to using `$(hostname)` as the host name and port 3022. Make sure port 3022 is available before 
trying to start the edge router.

## Testing Your Overlay

At this point you should have a functioning [Ziti Network](~/ziti/overview.md#overview-of-a-ziti-network). The script 
you sourced provides another function to login to your network. Try this now by running `zitiLogin`. You should see 
something similar to this:
```bash
~ % zitiLogin
Token: 40d2d280-a633-46c9-8499-ab2e005dd222
Saving identity 'default' to /Users/clint/.ziti/quickstart/My-Mac-mini.local.domain/ziti-cli.json
```

Congratulations! You can now use the `ziti` CLI to interact with Ziti! ([Ziti CLI Help Here](~/ziti/cli/cli.md)) The 
`ziti` binary is not added to your path by default but will be available at `"${ZITI_BIN_DIR-}/ziti"`. Add that folder
to your path, alias `ziti` if you like. Let's try to use this command to see if the edge router is online by running:
``"${ZITI_BIN_DIR-}/ziti" edge list edge-routers`.

```bash
~ % "${ZITI_BIN_DIR-}/ziti" edge list edge-routers
id: rhx6687N.P    name: My-Mac-mini.local.domain    isOnline: true    role attributes: {}
results: 1-1 of 1
```

Horray! Our edge router shows up and is online!