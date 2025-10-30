---
title: "OpenZiti Python SDK: Introduction"
seoDescription: "Build your next Python application with embedded zero trust networking using OpenZiti SDK"
date: 2022-09-20T17:51:44Z
cuid: cl8ahtom3080fu5nv6bxr6ylc
slug: openziti-python-sdk-introduction
authors: [EugeneKobyakov]
image: "@site/blogs/openziti/v1663698832345/Nj2I2jCi0.jpg"
imageDark: "@site/blogs/openziti/v1663698832345/Nj2I2jCi0.jpg"
tags: 
  - python
  - opensource
  - sdk
  - openziti

---

# Ziti Python SDK: Intro

OpenZiti project adds security layers that make your service available without exposing incoming ports, provides identity-specific end-to-end encryption, masks your network traffic protocols/ports, and allows developers to be more agile and secure than ever in all networking scenarios.

<!-- truncate -->

In our previous posts, we introduced the concept of [Zitification](https://openziti.io/docs/reference/glossary/#zitification-zitified-zitify) -- taking an app and changing it to use a secure, zero-trust, overlay network -- and shared a [few](./zitifying-ssh.md) [examples](./zitifying-scp.md) we developed internally.

This article will show how to *zitify* your Python applications with minor code changes.

![Ziggy Loves Python.jpg](/blogs/openziti/v1663167906947/aDQdNSiXW.jpg)

## Setup

There are several ways to get started with OpenZiti.

* follow instructions from previous posts
    
* read [quickstart](https://openziti.github.io/ziti/quickstarts/quickstart-overview.html) docs
    
* and even play in our [sandbox/ZEDS](https://zeds.openziti.org) -- fastest way to start. Ziti Edge Developer Sandbox(ZEDS) hosts a multi-tenant Ziti network.
    

## Acquiring SDK

OpenZiti Python SDK is published to Python Package Index(PyPI) so just go ahead with standard install, or add it to your application's `requirements.txt`

```pycon
$ pip install openziti
```

## Basic Usage

In the following code examples the following is assumed (read more about Ziti [identities](https://openziti.io/docs/learn/core-concepts/identities/overview) and [services](https://openziti.io/docs/learn/core-concepts/services/overview)):

* `id.jwt` - enrollment token file
    
* `id.json` - ziti identity file
    
* `best-service-ever` - name of the ziti service
    

### Ziti identity enrollment

```pycon
$ python -m openziti enroll --jwt id.jwt --identity id.json
```

### Open connection to Ziti service

```python
import openziti

# load ziti context, provide full path to identity file if needed
ztx = openziti.load('id.json')

conn = ztx.connect('best-service-ever')

# do cool stuff here with conn (socket)
```

you can also connect with an intercepted address (each service may have one or more standard network address `[protocol, host, port]`):

```python
conn = ztx.connect(('httpbin.ziti', 80))
```

### Host(serve) Ziti service

```python
import openziti

ztx = openziti.load(ziti_id)
server = ztx.bind(service)
server.listen()

while True:
    # conn is the incoming connection(socket)
    # peer is a tuple (connecting identity, 0)
    conn, peer = server.accept()
    
    # do some cool interaction with your client
```

## It's 2022: WDIMMOS\*?!!

\*`WDIMMOS`: why do I manage my own sockets

Obviously when you develop your cool Python application you probably would not start with writing your own networking layer. Instead, you'd use excellent networking capabilities of Python standard library or other modules to do networking for you. The good news is that you can use OpenZiti SDK with other networking modules.

### Client Side

For example, let's say you want to make an HTTP request with `requests`, `urllib3`, or even `urllib`:

```python
import requests

r = requests.get('http://httpbin.org/json')
print(r.headers)
print(r.json())
```

In order to make `requests` library use Ziti socket, we [`monkeypatch`](https://en.wikipedia.org/wiki/Monkey_patch) the code. In this case you can `request`(get it?) with an intercepted address.

```python
import requests
import openziti

ztx = openziti.load('id.json')

with openziti.monkeypatch():
    # FIY, httpbin.ziti is a common service you can use in our sandbox
    r = requests.get('http://httpbin.ziti/json')
    print(r.headers)
    print(r.json())
```

### Server Side

On the hosting server side we need inform the monkey patching code what it needs to do when underlying networking code binds to an address. This is done via `bindings` parameter to the `monkeypatch()` method. The value must be a map from network address(host, port) to the Ziti context/service -- like this:

```python
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
import openziti

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        msg = """{"msg": "Hello! Have some ziti!"}"""
        self.wfile.write(bytes(msg, "utf-8"))

if __name__ == "__main__":
    bind_addr = ('localhost', 8080)
    srv_addr = {
        ztx: 'id.json',
        service: 'best-service-ever'
    }
    # map network bind address to Ziti Service target
    bind_map = { bind_addr: srv_addr }

    openziti.monkeypatch(bindings=bind_map)
    webServer = HTTPServer(bind_addr, MyServer)
    webServer.serve_forever(poll_interval=600)
```

## Next Steps

We would love to hear from you about your applications and if decide that [OpenZiti](https://github.com/openziti/ziti) is the right fit to secure them.

Checkout some of our projects that use OpenZiti Python SDK:

* [Call a Dark Webhook from AWS Lambda](./my-intern-assignment-call-a-dark-webhook-from-aws-lambda)
    
* [Zitified Ansible/Paramiko](https://github.com/openziti-test-kitchen/ansible-paramikoz-demo)
    

Follow us:

* Python SDK [repo](https://github.com/openziti/ziti-sdk-py)
    
* Main OpenZiti [repo](https://github.com/openziti/ziti) - give us a star!
    
* Join [discussion](https://openziti.discourse.group/)
    
* Follow [@openziti](https://twitter.com/openziti)
