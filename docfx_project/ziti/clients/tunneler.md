# Tunnelers

[!include[](~/ziti/clients/tunneler-overview.md)]

Tunneler behaves similarly for all desktop and mobile operating systems. The goal is for Tunneler to direct traffic matching a Ziti
service over the Ziti overlay instead of the underlay network.

The default mode of operation for Tunneler is to configure the operating system's DNS resolver to check with Tunneler for matches before recursing internet nameservers. Alternatively, the command-line interface (CLI) versions of Tunneler offers a `proxy` mode that binds a particular service to a particular local port instead of matching the IP destination or domain name.

Scroll down to know more about operating Tunneler on each operating system.

[!include[](./linux.md)]

[!include[](./windows.md)]

[!include[](./android.md)]

[!include[](./iOS.md)]

[!include[](./macos.md)]
