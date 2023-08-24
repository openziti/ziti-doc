## Customizing the Express Install

You can influence and customize the express installation somewhat if you wish. This is useful if trying to run more than
one instance of Ziti locally. The most common settings you might choose to customize would be the ports used or the name
of the network. 

### Configuration File Location

You can change the location of the configuration files output by setting the `ZITI_NETWORK` environment variable prior 
to running `expressInstall`. However, if you do this you will also need to set other environment variables as well. 
Please realize that if you change these variables each of the "hostname" variables will need to be addressable:

* ZITI_CTRL_EDGE_ADVERTISED_ADDRESS
* ZITI_CTRL_EDGE_ADVERTISED_PORT
* ZITI_ROUTER_ADVERTISED_ADDRESS
* ZITI_EDGE_ROUTER_PORT

Here is an example which allows you to put all the files into a folder called: `${HOME}/.ziti/quickstart/newfolder`, uses
a host named 'localhost', and uses ports 8800 for the edge controller and 9090 for the edge router:

```bash
ZITI_NETWORK="newfolder"; \
ZITI_CTRL_EDGE_ADVERTISED_ADDRESS=localhost; \
ZITI_CTRL_EDGE_ADVERTISED_PORT=8800; \
ZITI_ROUTER_ADVERTISED_ADDRESS=localhost; \
ZITI_EDGE_ROUTER_PORT=9090; \
source ziti-cli-functions.sh; expressInstall
```