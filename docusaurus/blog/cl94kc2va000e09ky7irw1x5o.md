# Integrating Ziti is Easy!

# Integrating with Ziti? An Introduction
What is something everyone wants but can be difficult or cumbersome to implement? Better security practices. Here we are going to explore [Zero Trust](https://en.wikipedia.org/wiki/Zero_trust_security_model) via OpenZiti. Zero Trust is a concept where a network is never trusted and always reverified. Constantly revalidating all connections and participants to validate they should be there. OpenZiti seeks to alleviate the hassle of setting up a zero trust network and putting the power in developers to create more secure apps  If you haven't heard of OpenZiti then you can check out the [project here](https://github.com/openziti) as well as [an overview](https://openziti.github.io/ziti/overview.html). Today we are going to be extending a very helpful http testing tool to talk over Ziti.

## Why?
Sometimes we get a little excited when learning about a new technology or concept. Like learning about zero trust and finding OpenZiti! So we make a plan to setup our apps to use ziti Soon enough the engineering team had everything sorted out with their main application talking through a Ziti network, however, this was a small realization: what about all the testing infrastructure that relied on the app just reaching out to a web server? Well, luckily there are plenty of ways to still test an app over a Ziti network.

## What?
Let me introduce you to [go-httpbin](https://github.com/mccutchen/go-httpbin). There are a few reasons I went with this over the main httpbin. This fork is much more recent and actively being maintained. It also doesn't user any external packages, though that is about to change. Finally its in Go which happens to be my favorite language (a very subjective reason, I know). With OpenZiti's [go-sdk](https://github.com/openziti/sdk-golang) this should be a very simple task! Now let's get to some code.


![cup-of-coffee-1280537_1280.jpg](/blog/v1664985400182/_O6OC_fG5.jpg)

## How
We are pretty much going to apply the go-sdk outlined in [this repository](https://github.com/openziti-test-kitchen/go-http). If you'd like to follow along, then the finished code is in the [Ziti Test Kitchen](https://github.com/openziti-test-kitchen/go-httpbin)!
So, first thing we need to do when integrating OpenZiti into an app is store and take in information required to running against the network. All of the work we need to do is done within the command main `cmd/httpbin/main.go`. This would be the identity file and service name. I want this service to still listen over normal http so we can use a single binary for both Ziti and non Ziti testing so we are also going to have an enable Ziti flag. We'll use them later on, but for convenience we will also take in these from ENV: ENABLE_ZITI, ZITI_IDENTITY, ZITI_SERVICE_NAME.

```go
var (
    ...
    useRealHostname bool

    identityJson string
    serviceName  string
    enableZiti   bool
 )

func main() {
    ...
    flag.BoolVar(&useRealHostname, "use-real-hostname", false, "Expose value of os.Hostname() in the /hostname endpoint instead of dummy value")

    flag.BoolVar(&enableZiti, "ziti", false, "Enable the usage of a ziti network")
    flag.StringVar(&identityJson, "ziti-identity", "", "Path to Ziti Identity json file")
    flag.StringVar(&serviceName, "ziti-name", "", "Name of the Ziti Service")
}
```

Next we just have to do the normal stuff of checking flags and env. Erroring out when there are problems. All that fun stuff.

```go
if zitiEnv := os.Getenv("ENABLE_ZITI"); !enableZiti && (zitiEnv == "1" || zitiEnv == "true") {
	enableZiti = true
}

if enableZiti {
  if identityJson == "" && os.Getenv("ZITI_IDENTITY") != "" {
 	identityJson = os.Getenv("ZITI_IDENTITY")
 }
  if identityJson == "" {
 	fmt.Fprintf(os.Stderr, "Error: When running a ziti enabled service must have ziti identity provided\n\n")
 	flag.Usage()
 	os.Exit(1)
 }

  if serviceName == "" && os.Getenv("ZITI_SERVICE_NAME") != "" {
 	serviceName = os.Getenv("ZITI_SERVICE_NAME")
 }
  if serviceName == "" {
 	fmt.Fprintf(os.Stderr, "Error: When running a ziti enabled service must have ziti service name provided\n\n")
 	flag.Usage()
 	os.Exit(1)
  }
} 
```

Now we get to the fun part of Ziti integration. And its super easy to add! First we're going to manually create the net.Listener instead of it happening behind the scenes. OpenZiti's sdk allows us to easily create a listener that will listen over a Ziti network and then when we don't want that then the normal net listener will work great!

```go
var listener net.Listener

if enableZiti {
	config, err := config.NewFromFile(identityJson)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Unable to parse ziti identity: %v\n\n", err)
		os.Exit(1)
	}
	zitiContext := ziti.NewContextWithConfig(config)
	if err := zitiContext.Authenticate(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: Unable to authenticate ziti: %v\n\n", err)
		os.Exit(1)
	}

	listener, err = zitiContext.Listen(serviceName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Unable to listen on ziti network: %v\n\n", err)
		os.Exit(1)
	}
} else {
	listener, err = net.Listen("tcp", listenAddr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Unable to listen on %s: %v\n\n", listenAddr, err)
		os.Exit(1)
	}
}
server := &http.Server{
	Handler: h.Handler(),
}
``` 

Once we have the listener it's as easy as using the serve methods that don't create listeners. I additionally added some conditional logging, but that is entirely up to preference.

```go
var listenErr error
getListening := func() string {
	if enableZiti {
		return fmt.Sprintf("ziti serviceName=%s", serviceName)
	}
	s := "http"
	if serveTLS {
		s += "s"
	}
	return fmt.Sprintf("%s://%s", s, listenAddr)
}
if serveTLS {
	serverLog("go-httpbin listening on %s", getListening())
	listenErr = server.ServeTLS(listener, httpsCertFile, httpsKeyFile)
} else {
	serverLog("go-httpbin listening on %s", getListening())
	listenErr = server.Serve(listener)
}
if listenErr != nil && listenErr != http.ErrServerClosed {
	serverLog("%T", listenErr)
	logger.Fatalf("failed to listen: %s", listenErr)
}
```

Is there any more to do? Nope! That's all we need to enable OpenZiti on the go-httpbin project. And do you know what the best part is? Nothing we did was specific to this project. Any go project that uses the standard library for serving http content can be done in the exact same way! 

## Thank you!
You can check out the code used in this example in the [OpenZiti Test Kitchen](https://github.com/openziti-test-kitchen/go-httpbin). You can also find other projects that are ziti integrated here!