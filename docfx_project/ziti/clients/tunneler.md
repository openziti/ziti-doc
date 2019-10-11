# Tunnelers

[!include[](./tunneler-overview.md)]

Each tunneller operates similarly. The goal is to have the tunneler intercecpt traffic destined for Ziti
services and forward that traffic over the Ziti overlay instead of the underlay network.  There are two basic modes a
tunneler operate in: seamless and proxy. A seamless tunneler will transparently intercept traffic via IPv4 address or
DNS whereas a tunneler in proxy mode works as a proxy. Seamless mode is transparent to existing services and
applications. Proxy mode is not as transparent at all. It requires applications to send traffic to the localhost proxy
specifically. This means when running in proxy mode - it does not do any intercepting at all.

Here you can learn about the
ways each tunneler operates and see the similarities as well as any differences.

[!include[](./linux.md)]

[!include[](./windows.md)]

[!include[](./android.md)]

[!include[](./iOS.md)]

[!include[](./macos.md)]
