Ziti Tunnellers allow pre-existing, unmodified TCP/IP applications to access or provide services on a secure Ziti network. A Ziti Tunneler is a Ziti-native application that communicates with local peers using TCP/IP and proxies the payload to/from a Ziti service.

Note that embedding the Ziti SDK directly into a standalone application or plugin is preferable to using a Ziti Tunneler, if possible. Such a Ziti-native application is secured and encrypted to the farthest edges of the communication path - all the way to the application's internal buffers. A Ziti Tunneler cannot secure the communication between itself and the TCP/IP application.

Ziti Tunnellers are intended for situations where going Ziti-native is expensive or impossible to implement (e.g. a third-party application or library). Ziti Tunnellers enable standard TCP/IP applications to reap _most_ of the security and reliability benefits offered by Ziti networks without changing a line of code.

Ziti provides tunnelers for each major operating system.

[!include[](../downloads/tunneler.md)]
