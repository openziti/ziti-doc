---
title: "Go is Amazing for Zero Trust"
seoTitle: "Go + OpenZiti are a natural fit for zero trust"
seoDescription: "OpenZiti has numerous SDKs for creating secure-by-default applications. The OpenZiti Go SDK is an amazing option for developing secure applications."
date: 2023-12-14T02:45:46Z
cuid: clq4llx30000108jp8lhp7iy8
slug: go-is-amazing-for-zero-trust
authors: [ClintDovholuk]
image: /blogs/openziti/v1702331268646/98f54fa9-a33d-4fa9-91bf-ad88d936ed5a.jpeg
ogimage: /blogs/openziti/v1702331780840/80987396-5227-4fd6-8544-dc7c67a6e331.jpeg
tags: 
  - golang
  - appsec
  - zerotrust

---

I have the privilege of working on [the OpenZiti project](https://openziti.io). OpenZiti is a free, open-source overlay network and platform focused on making it easy to implement the principles of [zero trust](https://en.wikipedia.org/wiki/Zero_trust_security_model). OpenZiti believes zero trust belongs **inside applications** by adopting an SDK, not bolted onto the network after the application is developed. With zero trust built into the application, it becomes secure-by-default. Since OpenZiti is primarily written in [GoLang](https://go.dev/), naturally, we offer an [SDK based on Go](https://github.com/openziti/sdk-golang/) to allow you to secure your applications. But Go isn't the only SDK offered; the project also [has numerous](https://github.com/openziti/ziti-sdk-c) [SDKs](https://github.com/openziti/ziti-sdk-jvm) [in various](https://github.com/openziti/ziti-sdk-py/) [other languages](https://openziti.io/docs/reference/developer/sdk/). With one of these SDKs, you can build zero-trust principles into an application and make it secure-by-default.

Recently, I used our [SDK based on Go](https://github.com/openziti/sdk-golang/) and built an "Appetizer Demo" to give the world an idea of how easy it can be to secure applications by adopting an OpenZiti SDK. We want to make it trivial for people to experience frictionless zero trust in action. Using code, the demo shows you what it takes to include an OpenZiti SDK into an application to secure data in motion.

The [Appetizer Demo doc page](https://openziti.io/appetizer) is live. You can go there and experience it now if you like or later after reading a bit more about it here. It'll hopefully take five minutes or less, depending on how fast you are! If you'd prefer to look at the source from GitHub first, have a look at [the reflect server](https://github.com/openziti-test-kitchen/appetizer/blob/main/overlay/reflectServer.go) and/or the [reflect client](https://github.com/openziti-test-kitchen/appetizer/blob/main/clients/reflect.go).

![[object Object]](https://openziti.io/img/appetizer/step4.svg)

<!-- truncate -->

## Go Standard Library - `package net`

A year or two before the pandemic, OpenZiti began development with the premise that security should be embedded into, not bolted onto, applications. Naturally, this means the project would need SDKs for people to use. The project decided to migrate towards Go, which was relatively mature but still an "up-and-coming" language (and continues to gain popularity). Go was also gaining substantial traction in network-centric use cases. The team started to develop the SDK for Go and discovered the standard library contained the perfect abstractions necessary to implement zero-trust principles.

Security and zero-trust principles become crucial the moment one application initiates communication with another. Most often, communicating with other applications is accomplished using an IP-based network using [sockets and ports](https://en.wikipedia.org/wiki/Network_socket). This is where the Go standard library enters. The Go standard library has an interface, `net.Conn` that represents a general network connection and declares the critical functions needed. Most importantly, the interface is used throughout the standard library as a point of abstraction. Other functions and interfaces related to network connectivity from other packages reference this interface. Because it's used throughout the standard library, it's been adopted far and wide, and its use has expanded throughout the rest of the Go ecosystem.

Processes that accept connections from other processes ("server" applications) have a similar interface: the `net.Listener`. It represents a process capable of handling remote connections and is used extensively throughout the Go standard library.

With the standard library using `net.Conn` and `net.Listener` throughout, third parties implemented their solutions using the pattern, as did OpenZiti. Let's look at what that means.

## Go - Server Apps

![](/blogs/openziti/v1702330009801/bf998c1a-90b6-43e7-8cb4-343bae8fc66f.png)

It doesn't take much code to update an existing application with an OpenZiti SDK and make it secure-by-default. Somewhere in the codebase, there will be a server. Go provides a great implementation in the standard library already, so it will often be an `http.Server`. You'll also frequently see `Server` instructed to `ListenAndServe` (or `ListenAndServeTLS`), starting a process that can handle HTTP connections on the IP-based underlay network. That code, at a basic level, will resemble something like the following:

```go
func main() {
	http.HandleFunc("/hello", hello)
	http.HandleFunc("/add", add)
	if err := http.ListenAndServe(":8090", nil); err != nil {
		panic(err)
	}
}
```

The code shown above is a greatly simplified HTTP server example, listening on port `:8090`. When it runs, it will allow HTTP connections from clients that can access the server's IP at port `:8090`. If authentication is needed, the server will accept a connection and then present the authentication challenge. Below, we'll see how that pattern changes when listening on the OpenZiti overlay instead.

### After - Using OpenZIti

With that simple example in mind, compare the same server listening on an OpenZiti overlay, not the IP-based underlay (not shown is code that loads the strong identity, the handler function shown, nor the serviceName. For a full example see the GitHub repo):

```go
func main() {
    // ... other setup-related code
    if ctx, err := ziti.NewContext(zitiCfg); err != nil {
        if listener, err := ctx.Listen(serviceName); err != nil { 
            http.HandleFunc("/hello", hello)
            http.HandleFunc("/add", add)
            if err := http.Serve(listener, http.HandlerFunc(handler)); err != nil {
                log.Fatalf("https serving failed: %v", err)
            }
        }
    }
}
```

Not much difference, is there? So what changed?

1. We needed to create an OpenZiti `Context`. We need to authenticate and authorize the process with the OpenZiti overlay. Only identities **authorized** to host a service are allowed to do so. Contrast that to the IP-based underlay. With IP-based servers, **any** process can be a listening server. This allows for attacks like [DNS poisoning](https://en.wikipedia.org/wiki/DNS_spoofing). With a zero trust overlay, this whole style of attack is impossible.
    
2. The OpenZiti context contains a function to return a `Listener` interface. When using `ListenAndServe`, the standard library assumes the server should be listening on the common, IP-based underlay network because that's how it's always been done, but this is not the case with OpenZiti. Now, your server has **no listening ports** on the underlay network. It's literally **unattackable** via conventional IP-based tooling. Seriously, stop and consider that for just a moment. By adopting an OpenZiti SDK into the server, **all conventional network threats** are immediately useless.
    
3. The same amazing Go standard library then uses the `Listener` and starts listening for connections from clients on the overlay network. Now, all clients need to be authenticated and authorized to the OpenZiti overlay to connect to the server. If the server itself also requires authentication (a password, for example), it no longer accepts connections from **unauthenticated** and **unauthorized** clients, making [0-day vulnerabilities](https://en.wikipedia.org/wiki/Zero-day_(computing)) far less threatening.
    

## Go - Client Apps

![](/blogs/openziti/v1702330101777/9650046c-b610-422c-ae99-a5636e4014c1.png)

Go's standard library also fits clients perfectly. If you've created a server that listens on the OpenZiti overlay, the next step will be to make a client that connects to that server. Perhaps it's from a CLI, or perhaps it's connecting to a microservice. Regardless of the use case, you'll need to be able to connect to the server somehow. As that server is listening on the OpenZiti overlay, we know that a regular IP-based connection isn't going to work!

Let's examine what the code for a conventional IP-based client that makes an HTTP GET looks like:

```go
client := http.DefaultClient
resp, err := client.Get("http://" + args.ServiceName)
```

Cool, only two lines to make an HTTP client. It's hard to get much better than that!

### After - Using OpenZiti

Once you have an OpenZiti context, getting a client that is **authenticated** and **authorized** to connect to the HTTP server from above is also only two lines. The SDK provides a convenience function we can use to return an `http.Client`:

```go
client := sdk_golang.NewHttpClient(ctx, nil)
resp, err := client.Get("http://" + args.ServiceName)
```

But if you don't want to use that function, Go's standard library has your back yet again! Looking [at that function](https://github.com/openziti/sdk-golang/blob/9061ebecd115841f6860bef38778590097e7b1a3/http_transport.go#L18-L22), you can see that the SDK only manipulates the Go standard library using yet another excellent abstraction. Here's the full implementation of that function:

```go
func NewHttpClient(ctx ziti.Context, tlsConfig *tls.Config) *http.Client {
	return &http.Client{
		Transport: NewZitiTransport(ctx, tlsConfig),
	}
}
```

On display here is another great abstraction from the Go standard library: `http.Transport`. An [`http.Transport`](https://pkg.go.dev/net/http#Transport) is a struct that implements the [`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper) interface that represents a request and response. What's really cool here is that `Transport` allows developers to provide a `DialContext` (a function that allows developers to override **how** a `net.Conn` is created). OpenZiti uses these amazing abstractions to insert into the normal flow and provide a **zero trust** implementation of `net.Conn` while still being idiomatic Go!

If you don't want to use the wrapper function, you can make your own `http.Client` and provide the `Dial` function as the `DialContext` on your own `http.Transport`. Check out just how flexible the Go standard library is while still allowing us to provide a zero trust connection:

```go
func NewZitiClientFromContext(ctx ziti.Context) *http.Client {
	zitiDialContext := ZitiDialContext{context: ctx}

	zitiTransport := http.DefaultTransport.(*http.Transport).Clone() // copy default transport
	zitiTransport.DialContext = zitiDialContext.Dial
	return &http.Client{Transport: zitiTransport}
}
```

These abstractions are simple. They are flexible, easy to use, and all part of the standard library!

## Wrapping Up

If you haven't explored these structs and interfaces from the Go standard library, check them out! Go has nailed these abstractions. Go's standard library really does make it a pleasure to use Go for applications that demand secure connectivity. Does your application need to have secure connectivity? What application doesn't, right?!

Using the [OpenZiti Go SDK](https://github.com/openziti/sdk-golang/), you can secure your server and client applications quickly and easily with minimal developer time.

## Experience Zero Trust in Action

Try it out. If you have Go installed, it will hopefully be just a monment to clone the repo and experience zero trust in action. [The appetizer demo](https://openziti.io/appetizer) is live and ready to accept your connections.

You might notice that this appetizer demo doesn't use HTTP. OpenZiti is not limited to HTTP requests. You, the developer, are in charge! This example uses a simplified "read" protocol. You send it some text and a line feed, and it will return the text you sent to be displayed on the screen. If you want to see an HTTP example, the appetizer has you covered there, too! There's [`curlz`](https://github.com/openziti-test-kitchen/appetizer/blob/main/clients/curlz.go), a copy of the [Go SDK `curlz` example](https://github.com/openziti/sdk-golang/tree/main/example/curlz) that illustrates making a very basic HTTP request. There's also [`math`](https://github.com/openziti-test-kitchen/appetizer/blob/main/clients/math.go), a very simple API-type example you can check out.

## Share the Project

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png)

If you find this interesting, please consider [starring us on GitHub](https://github.com/openziti/ziti/). It really does help to support the project! And if you haven't seen it yet, check out [https://zrok.io](https://zrok.io). It's totally free sharing platform built on OpenZiti! It uses the Go SDK **a lot** since it's a ziti-native application. It's also [all open source too!](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [X <s>twitter</s>](https://twitter.com/openziti), [reddit](https://www.reddit.com/r/openziti/), or over at our [Discourse](https://openziti.discourse.group/). Or you can check out [our content on YouTube](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
