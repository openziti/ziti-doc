**Prerequisites**

**Note:** Make sure you have tar, hostname, jq and curl installed before running the expressInstall one-liner.

expressInstall may be customized with environment variables. Consider creating a DNS name for this installation before running the script. By default, the quickstart will install your Ziti network's PKI and configuration files in ${HOME}/.ziti/quickstart/$(hostname -s). You may choose a different location by defining ZITI_HOME=/custom/path/to/quickstart. If you do customize ZITI_HOME then you should also make this assignment in your shell RC, e.g., ~/.bashrc for future convenience.

You will almost certainly want to use the public DNS name of your instance. It is possible to use an IP address, but a DNS name is a more flexible option, which will be important if the IP ever changes.

The quickest and easiest thing to do, is find your external DNS name and set it into the EXTERNAL_DNS environment variable. You may skip setting EXTERNAL_DNS if you don't need to configure the advertised DNS Subject Alternative Name (SAN). For example,

```
export EXTERNAL_DNS="acme.example.com"
export EXTERNAL_IP="$(curl -s eth0.me)"       
export ZITI_EDGE_CONTROLLER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_ROUTER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_CTRL_EDGE_ADVERTISED_ADDRESS="${EXTERNAL_DNS}"
export ZITI_ROUTER_ADVERTISED_ADDRESS="${EXTERNAL_DNS}"
export ZITI_CTRL_ADVERTISED_PORT=8440
export ZITI_CTRL_EDGE_ADVERTISED_PORT=8441
export ZITI_ROUTER_PORT=8442
```