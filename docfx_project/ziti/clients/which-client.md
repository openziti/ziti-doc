# Choosing a client

Once you have a Ziti Network - you are going to require a Ziti-aware client in order to access the network. There are
two basic choices to make. Either use a tunneler or an SDK.

Choosing which type of client you will use to connect to a Ziti Network is very straightfoward and comes down to a
single question. If you are you installing Ziti in front of an existing application which has already been developed and
deployed you need to use a [tunneler](tunneler.md).  If you are developing a new product and starting from scratch and
you want to take advantage of a fully zero-trust solution you will probably want to use an SDK.

## Tunnelers

A tunneler is purpose-built software designed to connect applications which are not Ziti-aware to the Ziti Network.
NetFoundry provides tunnelers for each major operating system.

* [Windows](https://netfoundry-clients.s3-us-west-1.amazonaws.com/ziti/0.4.16-2301/ziti-tunnel.exe)
* [MacOS](https://netfoundry-clients.s3-us-west-1.amazonaws.com/ziti/0.4.16-2301/ziti-tunnel-mac.tar.gz)
* [Linux](https://netfoundry-clients.s3-us-west-1.amazonaws.com/ziti/0.4.16-2301/ziti-tunnel-linux.tar.gz)

Read more on using [tunnelers here](./tunneler.md)

## SDK

If you are starting from scratch you have a unique opportunity to choose to use one of the Ziti SDKs and to create a
truly zero-trust application from the start! Navigate over to the [api](../../api/index.md) page to learn more about which SDKs
are avialable and for documentation focused on using these sdks.
