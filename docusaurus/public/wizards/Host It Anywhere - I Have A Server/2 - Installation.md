When starting out deploying an OpenZiti Network, we recommend you follow and use the expressInstall function provided by the OpenZiti project. Once you're familiar with the network and the configuration options available you'll be better equipped to make changes.

**Firewall**

The first issue you will need to deal with is opening some ports. A network will consist of at least one controller and at least one edge router. Both of these components will require ports to be open. For the controller you will need to open a range of ports through your firewall:

* 8440/tcp: Edge Controller providing router control plane
* 8440/tcp: Edge Controller providing client sessions
* 8440/tcp: Edge Router providing client connections
* 8440/tcp: Ziti Admin Console (ZAC) [optional]

These are the arbitrary ports we'll use in this example for convenience when specifying the firewall exception as a port range.