---
slug: zero-trust-monitoring-with-openziti
title: "Zero Trust Monitoring with OpenZiti"
authors: [EugeneKobyakov]
date: 2023-01-09
tags:
  - zero-trust
  - monitoring
  - openziti
---
# Zero Trust monitoring with OpenZiti

# Intro

Monitoring is very important in today's technology world. It allows system administrators to

* detect early signs of failures and security breaches, and address them before they cause outages
    
* improve resource utilization
    
* reduce time spent on active monitoring and instead be alert-driven

<!-- truncate -->
    

Monitoring systems are usually deployed alongside the main system or software that is being monitored. What this means is that monitoring systems must have the same security requirements as any other production system. If your monitoring system is vulnerable a sophisticated attacker can launch a multi-prong attack on your whole infrastructure. Disabling or impairing monitoring can lead to a delayed discovery of incidents or missing them altogether.

![](/blogs/openziti/v1672149178577/1otp4yY5I.png)

This is a typical monitoring system at a very high level. The link from `Agent` to `Collector` is likely to go over the public Internet, which means that `Collector` endpoints are vulnerable to attacks by malevolent actors. These attacks can range from [DDOS](https://en.wikipedia.org/wiki/Denial-of-service_attack) to targeting vulnerabilities in `Collector` software (e.g. [Log4Shell](https://en.wikipedia.org/wiki/Log4Shell)). When the collector becomes compromised or impaired, your `Analytics` engine cannot trigger appropriate alerts. While these attack vectors can be mitigated with VPNs, firewalls with port-forwarding/ACL/IP-whitelists, etc., those solutions are non-trivial to implement and maintain.

OpenZiti is offering a solution that avoids deploying additional software (e.g VPN agents) or maintaining other infrastructure (e.g. firewalls). OpenZiti SDKs allow building zero trust networking right into your applications and leverage full mesh, zero trust overlay, policy controlled access without separate agents.

The rest of this article will walk through connecting modified popular agent and collector software over OpenZiti overlay network. It makes `Collector` inaccessible from the public Internet and makes it available only to `Agents` with proper permissions.

![](/blogs/openziti/v1670514568002/2iIdy5Ep1.png)

# Implementation Overview

For this exercise, we picked [Elastic](https://www.elastic.co/logstash/) Logstash as the collector and Elastic Beats tools as the agents. It was done for two reasons:

* The Beats/LogStash combination is a very popular monitoring solution
    
* Our own Ops team (at NetFoundry) is using them for monitoring data collection and is incorporating Zero Trust into our internal tools
    

## Beats

Elastic Beats tools are written in Golang. We use OpenZiti Golang SDK to embed Zero Trust networking right into the executables.

To get *zitified* Beats binaries, clone our fork and build them:

```bash
$ git clone --branch=zitify https://github.com/openziti-test-kitchen/beats.git
$ cd beats
$ mkdir build
$ go build -o build/ ./filebeat #./metricbeat, etc
```

These binaries can be dropped into the existing beats install and configured to use OpenZiti overlay network.

### Beats implementation details

The fork above just pulls the zitified version of the Elastic agent support library with the following `replace`

```less
github.com/elastic/elastic-agent-libs => github.com/openziti-test-kitchen/elastic-agent-libs v0.0.0-20221118205208-c84fcc069fb2
```

In the modified library the only code [change](https://github.com/elastic/elastic-agent-libs/compare/main...openziti-test-kitchen:elastic-agent-libs:zitify-transport?diff=unified) (aside from added dependency in `go.mod`) is this:

![](/blogs/openziti/v1672929730994/7b56ef69-a963-485e-aa4a-f0e7be490a47.png)

The Ziti dialer takes care of matching the target address to the service with a matching intercept.

## LogStash

On the LogStash side, we created a [zitified](https://github.com/openziti-test-kitchen/logstash-input-zitibeats/tree/zitify) version of the LogStash Beats input plugin. LogStash is built with JRuby/Java. We use OpenZiti JVM SDK to embed Zero Trust networking into the Beats plugin.

To build and install zitified plugin (make sure you have all the required tools for LogStash plugin development):

```bash
$ git clone --branch=zitify https://github.com/openziti-test-kitchen/logstash-input-zitibeats.git
$ cd logstash-input-zitibeats
$ ./gradlew vendor
$ gem build ./logstash-input-zitibeats.spec
# LS_HOME is logstash installation directory
$ ${LS_HOME}/bin/logstash-plugin install ./logstash-input-zitibeats-6.4.1-java.gem
```

### LogStash Input Beats implementation

We implemented a Beats input endpoint [server](https://github.com/openziti-test-kitchen/logstash-input-zitibeats/blob/zitify/src/main/java/org/openziti/logstash/beats/Server.java) by using `org.openziti:ziti-netty` library.

```java
ServerBootstrap server = new ServerBootstrap();
server.group(workGroup)
      .channelFactory(new ZitiServerChannelFactory(ztx))
      .childHandler(getBeatsInitializer());

Service service = ztx.getService(serviceName, 10000L);
Channel channel = server.bind(new   ZitiAddress.Bind(service.getName())).sync().channel();
```

It fits nicely with the original plugin and reuses the rest of the original implementation.

# Configuring OpenZiti

To tie it all together, the OpenZiti network has to be configured with appropriate identities, services, and policies.

%[https://gist.github.com/ekoby/63163db01f8496164adae6e4410fdf71] 

The diagram below shows how ziti configuration is mapped/used in the LogStash/Beats deployments.

![](/blogs/openziti/v1671648706947/ZzjDwkvvM.png)

## Running Zitified LogStash

Once our new input is configured LogStash can be started. This is a sample output you'd see in the LogStash log.

```less
[2022-12-27T12:33:56,061][INFO ][org.openziti.impl.ZitiImpl][main] ZitiSDK version 0.23.18 @23cb6b8()
[2022-12-27T12:33:56,332][INFO ][logstash.javapipeline    ][main] Pipeline started {"pipeline.id"=>"main"}
[2022-12-27T12:33:56,398][INFO ][org.openziti.logstash.beats.Server][main][a0be65cb7a03f4efc1785fd4746bd82f98469e6bef41caf7afeb4b8ac3763006] Starting server for service: beats.logstash
[2022-12-27T12:33:56,406][INFO ][logstash.agent           ] Pipelines running {:count=>1, :running_pipelines=>[:main], :non_running_pipelines=>[]}
[2022-12-27T12:33:56,714][INFO ][org.openziti.api.Controller][main] controller[https://fec44561-7d3b-41e7-a26f-e9f851a9ec33.production.netfoundry.io/] version(v0.26.11/807dd591b1f5)
```

It shows that Ziti SDK is loaded and the plugin is waiting for connections on the configured service.

## Running Zitified Beats agents

To connect zitified Beats agents over Ziti overlay network you need to do two things:

* point `output.logstash` to the service intercept address
    
    ```less
    output.logstash:
      hosts: ["beats.logstash.ziti:5044"]
    ```
    
* reference enrolled agent identity file in `ZITI_IDENTITIES` environment variable
    
    ```less
    $ export ZITI_IDENTITIES=beatz.json
    $ ./metricbeat -c metricbeat.yml
    ```
    

# Conclusion

Using Zero Trust solutions is important not only in customer-facing production systems but in internal ones as well. Systems monitoring falls under that umbrella.

OpenZiti SDKs make it easy to embed Zero Trust networking right into your applications provided you can modify the source code. OpenZiti SDKs are designed to match target languages/frameworks styles of programming and in most cases can be embedded with just a few lines of code.

See all of them on [GitHub](https://github.com/orgs/openziti/repositories?q=sdk).

Want to learn more or provide feedback? Head to our [docs](https://openziti.github.io/) and discussion [forum](https://openziti.discourse.group/top?period=quarterly), and follow this very [blog](https://blog.openziti.io/).