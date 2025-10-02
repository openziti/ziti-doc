---
title: "Websockets over zrok"
date: 2023-03-10T16:11:44Z
cuid: clf2qjqxx000109id6rmz1dfm
slug: websockets-over-zrok
authors: [CameronOtts]
image: "@site/blogs/openziti/v1678297112797/d3f17b17-22f7-40ef-aac4-a581a9ab19ea.jpeg"
imageDark: "@site/blogs/openziti/v1678297112797/d3f17b17-22f7-40ef-aac4-a581a9ab19ea.jpeg"
tags: 
  - debugging
  - openziti
  - zrok

---

## Where we started

If you were using `zrok` &lt;=`v0.3.3` you might have noticed that websockets weren't exactly behaving quite like we 
were expecting. We decided to quickly fix that to get users the features they want.

<!-- truncate -->

## How we got to now

Conversely, you'll notice come the `zrok` `v0.3.4` [release](https://github.com/openziti/zrok/releases/tag/v0.3.4) websockets are in a much better place. We strive to give users the best experience we possibly can. Let me take you on the journey that got us here and show you the debugging steps we took.  

### Digging Strategy

To assist with testing we developed 3 test commands (one of which we decided to not ship with `zrok`).

  
First, we have a very simple server `zrok test endpoint`. This is a simple echo server in which the `/echo` endpoint is a websocket connection. This also can listen over a Ziti network with the Ziti relevant flags.

  
Next is the corresponding websocket client `zrok test websocket`. This was made to directly integrate with the websocket portion of the aforementioned server so it only communicates on the `/echo` endpoint. Like above it can also communicate over Ziti with the relevant flags.

  
Finally, we have a test expandable proxy server. This was exclusively used just for testing the internal communication of `zrok` so it will not be present in the package. Once again this is optionally Ziti enabled, and all this did was link two URLs through a golang reverse proxy.

  
Having these three components will allow us to test each portion of the internal `zrok` workflow with less overhead to dig into the problem. We start with the simplest scenario, direct communication between a websocket endpoint and a test client. Then we add layers of `zrok` components into the equation, trying to locate where the communication fails.

So we start with a websocket server serving over HTTP, which turns out to be a success.

```bash
% zrok test websocket localhost:9090 
[ 0.001] INFO main.(*testWebsocketCommand).run: http://localhost:9090/echo
[ 0.006] INFO main.(*testWebsocketCommand).run: Writting to server...
[ 0.007] INFO main.(*testWebsocketCommand).run: Reading response...
[ 0.007] INFO main.(*testWebsocketCommand).run: MessageText
[ 0.007] INFO main.(*testWebsocketCommand).run: i received: "hi"
```

Next, let's go ahead and verify that websockets work as expected over a straight Ziti connection.

```bash
% zrok test websocket --ziti --ziti-identity identity.json --ziti-name ws 
[ 0.003] INFO main.(*testWebsocketCommand).run: http://ws/echo
[ 0.114] INFO main.(*testWebsocketCommand).run: Writting to server...
[ 0.114] INFO main.(*testWebsocketCommand).run: Reading response...
[ 0.115] INFO main.(*testWebsocketCommand).run: MessageText
[ 0.115] INFO main.(*testWebsocketCommand).run: i received: "hi"
```

  
Success!  
Well, what about introducing one proxy over HTTP?

```bash
% zrok test websocket localhost:1111
[ 0.002] INFO main.(*testWebsocketCommand).run: http://localhost:1111/echo
[ 0.007] INFO main.(*testWebsocketCommand).run: Writting to server...
[ 0.007] INFO main.(*testWebsocketCommand).run: Reading response...
[ 0.008] INFO main.(*testWebsocketCommand).run: MessageText
[ 0.008] INFO main.(*testWebsocketCommand).run: i received: "hi"
```

  
Still looking good.  
Now here is where we start looking like the back half of `zrok`. Let's have the proxy listen over Ziti and reach out to the websocket server running over HTTP.

```bash
% zrok test websocket --ziti --ziti-identity ~/.ziti/quickstart/identities/cam.json --ziti-name ws
[ 0.003] INFO main.(*testWebsocketCommand).run: http://ws/echo
[ 360.003] ERROR main.(*testWebsocketCommand).run: failed to WebSocket dial: failed to send handshake request: Get "http://ws/echo": context deadline exceeded
```

  
Huh, not great. This part easily took the longest to debug. Most of the process was cross-checking the golang http source to see what exactly the Ziti sdk was doing differently. `dlv` was a huge help here. While I tend to lean on message log debugging for better or worse, `dlv` certainly can help visualize the call stack great. After walking through multiple requests both through HTTP and ziti from the reverse proxy we see that it is consistently sticking during the connection hijack.

  
It turns out that the ziti sdk-golang wasn't properly handling deadline updates which are required by the `httputil.ReverseProxy`. This caused the application to hang until the client context deadline lapsed and caused the entire call to bubble back.  
To fix what we believe the problem is we need the sdk-golang package to be able to change the deadline for an inflight request and have the current read operation canceled. That boiled down to notifying the connection reader of the deadline change and recalculating the timeout necessary during the read and exiting early so the proxy server could properly handle the websocket upgrade on the connection. While doing this we discovered an oversight on how the sdk handles connection errors so as a bonus error handling should be much more stable.

  
So now if we try the same testing scenario as before we see some great news:

```bash
% zrok test websocket --ziti --ziti-identity identity.json --ziti-name ws
[ 0.002] INFO main.(*testWebsocketCommand).run: http://ws/echo
[ 0.110] INFO main.(*testWebsocketCommand).run: Writting to server...
[ 0.110] INFO main.(*testWebsocketCommand).run: Reading response...
[ 0.110] INFO main.(*testWebsocketCommand).run: MessageText
[ 0.110] INFO main.(*testWebsocketCommand).run: i received: "hi"
```

  
It works! Now let's add another proxy, this time listening over HTTP and reaching out over Ziti (like `zrok` will).

```bash
% zrok test websocket localhost:1112 
[ 0.001] INFO main.(*testWebsocketCommand).run: http://localhost:1112/echo[ 0.183] INFO main.(*testWebsocketCommand).run: Writting to server...
[ 0.183] INFO main.(*testWebsocketCommand).run: Reading response...
[ 0.185] INFO main.(*testWebsocketCommand).run: MessageText
[ 0.185] INFO main.(*testWebsocketCommand).run: i received: "hi"
```

  
Now, this is what we want to see! At this point we are running a very simple `zrok` setup, so why don't we run `zrok` with these changes? (I'm accomplishing this by using a go workspace and modifying a local version of the sdk-golang)

```bash
% zrok test websocket pdd22wqr5vy0.test:8080 
[ 0.001] INFO main.(*testWebsocketCommand).run: http://pdd22wqr5vy0.test:8080/echo
[ 0.183] INFO main.(*testWebsocketCommand).run: Writting to server...
[ 0.183] INFO main.(*testWebsocketCommand).run: Reading response...
[ 0.185] INFO main.(*testWebsocketCommand).run: MessageText
[ 0.185] INFO main.(*testWebsocketCommand).run: i received: "hi"
```

  
With that, we have websockets over `zrok`! I hope you enjoyed reading through this to get an idea of our process when there are things to fix and expand on. Keep on the lookout for future features and follow the process both here and on GitHub at [https://github.com/openziti/zrok](https://github.com/openziti/zrok).
