---
title: "The Python zrok SDK"
date: 2024-02-29T20:30:28Z
cuid: clt7ojqne000009l55fwz4dgu
slug: the-python-zrok-sdk
authors: [CameronOtts]
image: /blogs/openziti/v1701893161134/a2cd088f-0260-4ce7-9ea2-26a1a97a23db.webp
tags: 
  - python
  - openziti
  - zrok

---

If you are reading this, hopefully, you are familiar with `zrok`: an open source solution for easy and secure sharing 
built on OpenZiti. If not you can check out this post [introducing `zrok`](https://blog.openziti.io/introducing-zrok). 
If you have then that's great news! You might be familiar with the Golang SDK that was 
[recently released](https://blog.openziti.io/the-zrok-sdk).

<!-- truncate -->

`zrok` is built to enable developers to seamlessly and securely share their applications. We are expanding that philosophy by supporting a Python SDK. Using just a little code enables you to share your app through `zrok`'s robust network.

Today we'll be talking about the exciting news of the `zrok` python SDK! We will be spinning up an http server using flask and waitress to be served up via `zrok`! If you want to follow along you'll need to have a `zrok` environment set up. If you don't want to self host you can sign up for a free account at [https://zrok.io](https://zrok.io).

Check out the [Getting Started](https://docs.zrok.io/docs/getting-started/) guide for more information.

![](/blogs/openziti/v1701893410612/3adab72c-f78a-4cfc-b4e3-d4c645a70376.png)

## **Expanding into Python**

Here is all it takes to spin up a `zrok` enabled server using flask and waitress:

```python
from flask import Flask
import sys
import zrok
from zrok.model import ShareRequest
import atexit

app = Flask(__name__)
zrok_opts = {}
bindPort = 18081


@zrok.decor.zrok(opts=zrok_opts)
def runApp():
    from waitress import serve
    # the port is only used to integrate Zrok with frameworks that expect a "hostname:port" combo
    serve(app, port=bindPort)


@app.route('/')
def hello_world():
    print("received a request to /")
    return "Look! It's zrok!"


if __name__ == '__main__':
    root = zrok.environment.root.Load()
    try:
        shr = zrok.share.CreateShare(root=root, request=ShareRequest(
            BackendMode=zrok.model.TCP_TUNNEL_BACKEND_MODE,
            ShareMode=zrok.model.PUBLIC_SHARE_MODE,
            Frontends=['public'],
            Target="http-server"
        ))
        shrToken = shr.Token
        print("Access server at the following endpoints: ", "\n".join(shr.FrontendEndpoints))

        def removeShare():
            zrok.share.DeleteShare(root=root, shr=shr)
            print("Deleted share")
        atexit.register(removeShare)
    except Exception as e:
        print("unable to create share", e)
        sys.exit(1)

    zrok_opts['cfg'] = zrok.decor.Opts(root=root, shrToken=shrToken, bindPort=bindPort)

    runApp()
```

Just a few calls and we're running! Let's quickly go over what's happening here:

The `zrok` decorator takes a config dictionary to allow users to easily input their own settings. Taking in the root config, share token, and the bind port and you're off to the races.

We create a share (and setup a callback to clean up after ourselves once the server closes) which we then use to populate our options struct for our decorator. Thats it! That share is then accessed via some sort of share. In this case we're using a public share which you can find if on [here](https://blog.openziti.io/the-zrok-oauth-public-frontend).

To expand from here you would declare any routes your app wants to expose and it's just like producing a typical web server. No additional complications!

## Why **Though**?

Well, the big reason is we want this to be easy above all else. Sharing what you make should be painless. You develop the application and let `zrok` handle the rest.

Plus you can deploy your application anywhere. So long as the environment can reach out to the `zrok` host controller it can be wherever you need it to be. It can live in a container, cloud hosted, or even running nicely at home.

## **Moving Forward**

Moving forward we want `zrok` to be as accesible as possible, both in options and ease of use. Support for more languages is coming! If you would like to talk about languages to support, or friction points then please reach out to us on [Discourse](https://openziti.discourse.group/c/zrok/24)!

[  
](https://openziti.discourse.group/c/zrok/24)Also if you like `zrok` or OpenZiti and want to support it then please drop a star on [Github (zrok)](https://github.com/openziti/zrok) / [Github (OpenZiti)](https://github.com/openziti/ziti). It really means a lot!
