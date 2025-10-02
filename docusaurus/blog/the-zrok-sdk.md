---
title: "The zrok SDK"
date: 2023-08-23T20:09:05Z
cuid: cllo64dtc000n09mc96du917a
slug: the-zrok-sdk
authors: [MichaelQuigley]
image: "@site/blogs/openziti/v1692720007733/fa2b143a-5887-4e7a-9476-a3d531ab662b.png"
imageDark: "@site/blogs/openziti/v1692720007733/fa2b143a-5887-4e7a-9476-a3d531ab662b.png"
tags: 
  - developer
  - networking
  - openziti
  - zerotrust
  - zrok

---

Hopefully, you're already familiar with `zrok`, our open-source solution for easy and secure sharing. If you're not, 
check out the initial post [introducing `zrok`](https://hashnode.com/post/cldue515r000509l04jhy0c8q). There's also a 
more recent post describing some of the new 
[features in the latest v0.4.0 version](https://hashnode.com/post/cljen4m08000009li4hl1fz7c).

<!-- truncate -->

`zrok` is an open-source, self-hostable platform combined with a frictionless command-line client, that makes sharing resources like HTTP servers, TCP and UDP tunnels, and files simple, fast, and secure.

If you'd like to get started with `zrok`, but don't want to self-host, you can sign up for a free account at [https://zrok.io/](https://zrok.io/).

Check out the [Getting Started](https://docs.zrok.io/docs/getting-started/) guide for more information.

## Introducing the zrok SDK

As of `v0.4.3`, `zrok` ships with an SDK for creating your own custom applications and integrations. The same simple, secure sharing model used for sharing network resources and files can be extended to work for your custom tools.

The best way to understand how the SDK works is to take a look at the example application that ships with the SDK.

The example application is based on a "distributed copy/paste buffer" idea that we've called a "pastebin". It exists as two command-line applications, [`copyto`](https://github.com/openziti/zrok/blob/main/sdk/examples/pastebin/cmd/copyto/main.go) ([full source listing](https://github.com/openziti/zrok/blob/main/sdk/examples/pastebin/cmd/copyto/main.go)) and [`pastefrom`](https://github.com/openziti/zrok/blob/main/sdk/examples/pastebin/cmd/pastefrom/main.go) ([full source listing](https://github.com/openziti/zrok/blob/main/sdk/examples/pastebin/cmd/pastefrom/main.go)). The `copyto` utility accepts data through standard input and makes it available as a `zrok` share. The `pastefrom` utility emits a pastebin buffer shared from the `copyto` utility to its standard output.

> Side note: the "pastebin" concept will probably be expanded into a super-convenient, friction-free copy/paste wormhole for all of your `zrok`\-enabled environments in a future release. The expanded version will be included in the regular complement of `zrok` tools.

Here's what the `copyto` utility looks like in action. We're running this from a `zrok`\-enabled shell:

```bash
$ echo "oh, wow!" | copyto
access your pastebin using 'pastefrom 1v55r7l10xky'
```

We've piped the text `oh, wow!` into the pastebin buffer of `copyto`. Then `copyto` responds with the corresponding `pastefrom` command (including the share token that was created) that can be used to access the share. This `pastefrom` command can be executed from any other `zrok`\-enabled shell environment:

```bash
$ pastefrom 1v55r7l10xky
oh, wow!
```

`pastefrom` accesses the pastebin offered by `copyto` and emits it to its standard output.

Neither `copyto` nor `pastefrom` require any network security accommodations. No firewall rules or holes. They both connect from your local environment to the OpenZiti zero-trust network overlay used by `zrok`:

![](/blogs/openziti/v1692807490897/adc76ef9-ead1-4453-82d2-f79839d18c14.png)

Once connectivity is established with the overlay, an end-to-end encrypted network tunnel is established between `copyto` and `pastefrom` to securely transfer the pastebin buffer contents between them.

![](/blogs/openziti/v1692812967928/96a6f7e6-1aae-434d-9065-52a78ecfaa32.png)

Hitting `CTRL-C` to exit the `copyto` utility will automatically clean up the `zrok` share that it created. Then trying to access the pastebin buffer with the same share token will result in an error:

```bash
$ pastefrom 1v55r7l10xky
panic: unable to create access: [POST /access][404] accessNotFound
```

So our pastebin example works just like any other ephemeral `zrok` share.

### copyto

Let's take a look at the implementation of the `copyto` application. This is the `main` function:

```go
func main() {
	data, err := loadData()
    // error handling

	root, err := environment.LoadRoot()
    // error handling

	shr, err := sdk.CreateShare(root, &sdk.ShareRequest{
		BackendMode: sdk.TcpTunnelBackendMode,
		ShareMode:   sdk.PrivateShareMode,
		Target:      "pastebin",
	})
    // error handling

	fmt.Printf("access your pastebin using 'pastefrom %v'\n", shr.Token)

	listener, err := sdk.NewListener(shr.Token, root)
    // error handling

    // shutdown hook
	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		if err := sdk.DeleteShare(root, shr); err != nil {
			panic(err)
		}
		_ = listener.Close()
		os.Exit(0)
	}()

    // main connection handling loop
	for {
		if conn, err := listener.Accept(); err == nil {
			go handle(conn, data)
		} else {
			panic(err)
		}
	}
}
```

First, the `copyto` application loads the `pastebin` buffer from standard input using the `loadData` function ([see the `loadData` function listing](https://github.com/openziti/zrok/blob/349d251c84611f3e24ca6b3b6128eb6a30ab1692/sdk/examples/pastebin/cmd/copyto/main.go#L68)).

All `zrok` SDK applications utilize the enabled environment (via `zrok enable`) in the user's shell to provide identity and access control details. `zrok` SDK applications work alongside the built-in `zrok` CLI functions.

The `environment.LoadRoot` call retrieves the necessary details from the user's enabled environment.

With the root loaded, we can call `sdk.CreateShare` (passing in the loaded `root`) to create a share for our new pastebin buffer. We're advertising our application as a TCP tunnel backend (`sdk.TcpTunnelBackendMode`), utilizing a private share (`sdk.PrivateShareMode`). We've described the target as `pastebin`, the name of our application.

Now that we've got the share created, the `sdk.NewListener` call is all that is required to create an inbound listener for connections to this application over the secure OpenZiti overlay network.

The code wrapping the `sdk.DeleteShare` call is just a "shutdown hook", listening for an operating system signal (`SIGTERM`) to execute our goroutine that deletes the share we created with `sdk.CreateShare`. This just causes `copyto` to delete the share it created when the user exits with `CTRL-C`, or otherwise terminates the process.

And finally the `for {}` loop wraps around a call to `listener.Accept`, which accepts inbound connections, dispatching them to the `handle` function ([see the `handle` function listing](https://github.com/openziti/zrok/blob/349d251c84611f3e24ca6b3b6128eb6a30ab1692/sdk/examples/pastebin/cmd/copyto/main.go#L81)). This is the main connection handling loop for `copyto`, which runs until terminated.

### pastefrom

The `pastefrom` application is a simple client that works similarly to the `zrok access`command. `pastefrom` accesses the share created by `copyto` and emits the pastebin buffer to standard output.

Let's take a look at the `main` function from `pastefrom`:

```go
func main() {
	if len(os.Args) < 2 {
		panic("usage: pastefrom <shrToken>")
	}
	shrToken := os.Args[1]

	root, err := environment.LoadRoot()
    // error handling

	acc, err := sdk.CreateAccess(root, &sdk.AccessRequest{ShareToken: shrToken})
    // error handling  

    // deferred access cleanup
	defer func() {
		if err := sdk.DeleteAccess(root, acc); err != nil {
			panic(err)
		}
	}()

	conn, err := sdk.NewDialer(shrToken, root)
    // error handling
	defer func() {
		_ = conn.Close()
	}()

	buf := make([]byte, MAX_PASTE_SIZE)
	n, err := conn.Read(buf)
    // error handling

	fmt.Printf(string(buf[:n]))
}
```

First, a little command-line argument handling. As we saw in the example output of `copyto`, `pastefrom` expects the share token emitted by `copyto` to be provided as the first command-line argument.

Just like all `zrok` SDK applications, we call `environment.LoadRoot` to load the user's environment details.

Next we call `sdk.CreateAccess` to allow `pastefrom` to access the share created by `copyto`. Then we `defer` a call to `sdk.DeleteAccess` to clean up the access when `pastefrom` terminates.

The call to `sdk.NewDialer`creates an outbound connection to the `copyto` application through the underlying OpenZiti network.

Finally the pastebin buffer data is read from the connection using `conn.Read`, and then the data is emitted to standard output using `fmt.Printf`.

> A deeper dive: There is a deeper dive into the `zrok` SDK and this example application in the `zrok` Office Hours video from July 27th:

%[https://www.youtube.com/watch?v=T-sXQXG5xvE] 

## Under the Hood

The `zrok` SDK is an opinionated set of convenience wrappers around the `zrok` API and the OpenZiti SDK. Applications built using the `zrok` SDK will interoperate with the built-in `zrok` functionality and will automatically benefit from the same simple, secure, friction-free model used throughout the `zrok` ecosystem.

`zrok` SDK applications can grow to exploit the full spectrum of capabilities provided by OpenZiti and its SDKs.

At the core of these SDKs are the familiar `net.Conn` and `net.Listener` concepts that will be familar to every network programmer working in golang.

A follow-up blog post and `zrok` Office Hours video will be coming out later this year that will dive more deeply into how `zrok` works, and what it's doing to build on top of OpenZiti. This deeper dive will allow explain how purely native OpenZiti applications can interoperate with `zrok` SDK applications and the `zrok` ecosystem.

## Support for Other Programming Languages

The `zrok` SDK currently supports `golang`. Support for other languages is forthcoming. If you'd like to express interest in having the `zrok` SDK support other languages, reach out to us on our [Discourse](https://openziti.discourse.group/c/zrok/24).

If you like `zrok` and want to support its continued development, please drop a star on our [repository on GitHub](https://github.com/openziti/zrok), it means a lot to us.
