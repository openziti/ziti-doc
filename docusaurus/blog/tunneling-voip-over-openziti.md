---
title: "Tunneling VoIP over OpenZiti"
date: 2022-08-05T15:43:13Z
cuid: cl6gmz8i302jtxvnv7bxk7c79
slug: tunneling-voip-over-openziti
authors: [ShawnCarey]
image: "@site/blogs/openziti//EAmibi9_df.jpeg"
tags: 
  - security
  - networking
  - voip

---

In this article we will look at what is VoIP (voice over IP), why it is inherently vulnerable to network based attacks, 
and how we can stop these attacks by closing inbound ports using open-source OpenZiti.

This will include a how-to guide on standing up an OpenZiti network and using OpenZiti tunnelers to connect IP phones 
from anywhere in the world using a Asterisk PBX server.

<!-- truncate -->

# VoIP Introduction

"VoIP" is an acronym for "voice over IP". It refers to a collection of protocols for coordinating calls between multiple phones and transferring the call data (e.g. voice, video, screen share, etc) - including making calls directly from data-driven devices (a [VoIP phone](https://explore.zoom.us/en/what-is-voip-phone/), your computer, etc.)

## My VoIP is working perfectly right now… what’s the problem?

![voip-vulnerability-architecture.png](/blogs/openziti/v1660750218633/HCbn-iFaF.png)

VoIP inherently relies on a strong and stable internet connection with low latency. Any disruption can impact performance and service availability. VoIP systems have critical components which need to be open to networks to operate – including SIP servers, SBCs, IP-PBX, proxies and TURN servers. By being exposed to the network (and internet) these systems are vulnerable to external attack, including DoS/DDoS. In 2021 we saw an [upsurge in the number of damaging DoS, DDoS and ransomware type cyberattacks](https://www.techradar.com/news/ddos-attack-takes-yet-another-voip-provider-offline) against VoIP systems.

While not a problem for all VoIP users, some have stringent availability requirements – e.g., a critical services call – where any disruption causes business downtime. We have mitigation techniques which help, but they are inherently limited – e.g., attacks against VoIP providers in 2021, [mitigation techniques](https://netfoundry.io/why-ddos-and-dos-targets-voip-and-how-zero-trust-can-mitigate-the-threat/) only provided limited and temporary respite. What if we could deploy our VoIP systems and not have them exposed to the network… particularly the approximately 4.3 billion IPs on the public internet?

## Invisible VoIP

We created OpenZiti to provide the next generation of secure, open-source networking for any application. It allows you to easily apply zero-trust principles, and high-performance mesh networking on any Internet connection, without VPNs.

![secure-voip-architecture.png](/blogs/openziti/v1660750445519/vwC0Tlg8z.png)

Both sides of the application, VoIP in this case, use strong identity (X.509 certificate; bi-directionally authenticated and authorized) to build outbound-only overlays – we call this [dark or invisible networks](https://www.youtube.com/watch?v=ygHTixbra6A&list=PLMUj_5fklasKF1oisSSuLwSzLVxuL9JbC&index=5&t=3s&ab_channel=OpenZiti). As a result, our critical components do not need to be exposed to the internet - closed inbound ports or deny all inbound on the firewall.  
An application using a Ziti Network configured with a truly zero-trust mindset will be IMMUNE to the "expand/multiply" phases of classic ransomware attacks.

We must remember though that VoIP is sensitive to having a stable and performant network. Luckily we built in features such as high throughput and smart routing into the mesh overlay which allows VoIP to operate without the traditional limitations associated with VPNs.

In this article we’ll show you how to use OpenZiti tunnelers to connect IP phones from anywhere in the world to an Asterisk server that doesn't expose any ports to the Internet. The protocols that we'll set up ziti services for today are SIP ([session initiation protocol](https://en.wikipedia.org/wiki/Session_Initiation_Protocol)) for call coordination, and RTP ([real time transport protocol](https://en.wikipedia.org/wiki/Real-time_Transport_Protocol)) for voice audio streams.

We would like to get your feedback on our solution and experience. A great place for questions and conversation is in our [discourse community](https://openziti.discourse.group/).

# OpenZiti Setup

The Ziti network that is shown in this article consists of a Ziti controller and a single Ziti edge router. Check out one of the [Ziti Quickstarts](https://openziti.github.io/ziti/quickstarts/quickstart-overview.html) for some guides on setting up a Ziti network of your own.

In addition to the Ziti network, we also need [Ziti Tunnelers](https://openziti.github.io/ziti/clients/tunneler.html) installed on the Asterisk and soft phone hosts to proxy SIP and RTP packets to/from the Ziti network.

\--------------------- --------------------- --------------------- | Linphone | | Asterisk | | Linphone | | \_\_\_\_\_ | | ,\_\_ | | \_\_\_\_\_ | | (.---.)-.*.-. | | ( \* ) | | (.---.)-.*.-. | | /:::\\ \_.---' | | \`\`' | | /:::\\ \_.---' | | '-----' | | | | '-----' | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | /\\ | | /\\ | | /\\ | | //\\ | | //\\ | | //\\ | | \\// | | \\// | | \\// | | / | | / | | / | | | | | | | | Ziti Desktop Edge | | ziti-edge-tunnel | | Ziti Desktop Edge | | for macOS | | for Linux | | for Windows | --------------------- --------------------- ---------------------

\_\_\_\_\_\_\_\_\_\_\_ / \_\_\_ /  
| | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_/

\------------------- ------------------- | /\\ | | /\\ | | //\\ | | //\\ | | \\// | | \\// | | / | | / | | | | | | ziti-controller | | ziti-router | ------------------- -------------------

Once the Ziti controller is up and running we can create the Ziti service along with identities and policies.

## Identities

Ziti identities are the basis for authentication to a Ziti network. You can think of Ziti identities as user accounts. See [the Ziti docs](https://openziti.io/docs/learn/core-concepts/identities/overview) for more information on identities.

We'll create three identities for our VoIP system: one to represent the Asterisk server and two more to represent connected IP phones:

$ ziti edge create identity device asterisk --role-attributes 'asterisk-voip-server' -o asterisk.jwt $ ziti edge create identity device ext6001 --role-attributes 'asterisk-voip-client' -o ext6001.jwt $ ziti edge create identity device ext6002 --role-attributes 'asterisk-voip-client' -o ext6002.jwt

Keep track of the JWT files that are created here. They'll be used to enroll the identities with the network when the tunnelers are installed. The role attributes will be used when we define the service policies.

## Service Configuration

The asterisk server will handle SIP messages as well as proxy RTP packets between phones. SIP is accessed at port 5060 and the RTP port range is defined in the Asterisk configuration (rtp.conf). The Ziti service configuration shown here assumes the default RTP port range of 10000-20000.

```
$ ziti edge create config asterisk-voip.intercept.v1 intercept.v1 '{ "protocols": \[ "udp" \], "addresses": \[ "192.168.8.1" \], "portRanges": \[ { "low": 5060, "high": 5060 }, { "low": 10000, "high": 20000 } \] }'

$ ziti edge create config asterisk-voip.host.v1 host.v1 '{ "protocol": "udp", "address": "127.0.0.1", "forwardPort": true, "allowedPortRanges": \[ { "low": 5060, "high": 5060 }, { "low": 10000, "high": 20000 } \] }'

$ ziti edge create service asterisk-voip -c asterisk-voip.intercept.v1,asterisk-voip.host.v1
```

## Policies

Ziti policies determine which identities can access which Ziti services.

Identities with the "asterisk-voip-server" identity role will be able to host the services, and those with the "asterisk-voip-client" role will be able to dial the service:

$ ziti edge create service-policy asterisk-voip-client Dial  
\--identity-roles '#asterisk-voip-client'  
\--service-roles '@asterisk-voip'

$ ziti edge create service-policy asterisk-voip-server Bind  
\--identity-roles '#asterisk-voip-server'  
\--service-roles '@asterisk-voip'

## Tunneler Installation

Install the Ziti tunnelers on any hosts that will participate in your VoIP network. This article uses macOS, Windows, and Linux tunnelers. See https://openziti.github.io/ziti/clients/tunneler.html for more info on tunnelers and how to install them.

Once installed, you'll use the tunnelers "Add Identity" (on "enroll") function to register the identity JWT file that was created above.

# Asterisk Setup

I installed Asterisk on Fedora with the following command:

$ sudo dnf install -y asterisk asterisk-pjsip asterisk-sounds-core-en-wav

These packages installed some sample configuration files in /etc/asterisk. For this article, I moved the pjsip and extensions example configuration files out of the way before creating my own.

$ sudo mv /etc/asterisk/pjsip.conf /etc/asterisk/pjsip.conf.orig $ sudo mv /etc/asterisk/externsions.conf /etc/asterisk/extensions.conf.orig

The complete pjsip.conf and extensions.conf that I used for the setup in this article are attached below for reference. Here I'll point out a few details that are relevant to tunneling SIP and RTP.

## Darkness

One benefit of connecting applications with Ziti is that all application components, including servers that accept incoming connections from clients, can be hidden behind a completely closed firewall. We'll configure Asterisk to listen for connections on the loopback interface. This is possible because the tunneler that connects Asterisk to our Ziti network is running on the same host as Asterisk. So not only is our Asterisk server inaccessible from the Internet; it's also inaccessible from the LAN.

Here's the bit from pjsip.conf that sets the bind address:

;===============TRANSPORT \[transport-udp\] type=transport protocol=udp bind=127.0.0.1

Notice that the `host.v1` service configuration above must agree with the Asterisk listen address that's specified here. Specifically, the `bind` address in */etc/asterisk/pjsip.conf* must match the `host.v1` "address" field, and the `rtpstart` and `rtpend` ports in */etc/asterisk/rtp.conf* must be included in the `inttercept.v1` "portRanges" and `host.v1` "allowedPortRanges" fields.

## Address Translation

We need to take special care in the Asterisk configuration so that it works correctly and reliably with Ziti tunnelers. The main issues that we need to deal with stem from the fact that the phones cannot connect to each other directly, and Asterisk cannot initiate connections to phones.

1. Asterisk provides IP phones with addresses that the phones will use to connect to Asterisk. We need to make sure that Asterisk always provides the address in the `intercept.v1` Ziti service configuration, so connections are made to Asterisk instead of other phones. Note that we are working on a feature that makes it possible for IP phones to connect each other's media streams directly - avoiding the extra hop through Asterisk. Take a look at https://github.com/openziti/ziti-tunnel-sdk-c/issues/443 for more details, and please do let me know in the comments (here or on the github issue) if direct media connections are something that is important to you.
    
2. Asterisk cannot initiate connections to the IP phones, so we need to make sure that the inbound connections from IP phones stay open to serve as a return path to the phones.
    

### SIP

SIP is a http-like protocol that is used for phone registration and setting up calls between phones. SIP agents (including IP phones and Asterisk) add a `Via` header to outbound SIP messages. Each agent that initiates or proxies a SIP message adds its own `Via` with an address (protocol:ip:port) that the recipient should use when sending SIP responses.

By default, Asterisk populates `Via` with the destination IP address of the inbound connection from the client This makes sense sometimes, particularly if there is no address translation (NAT) between the clients and the Asterisk server. But in our case we've chosen to lock down the Asterisk transport, so all inbound connections to Asterisk are going to 127.0.0.1. This means that phones will try to send SIP responses to themselves (127.0.0.1) unless we do something to change that! Fortunately the pjsip module supports the `external_signaling_address` configuration setting so that we can force the intercept address for our SIP service into the `Via` header of SIP messages that Asterisk sends to phones.

; provide ziti intercepted IP to clients external\_signaling\_address=192.168.8.1 ;; use when populating SDP fields

Asterisk also needs to be able to send unsolicited SIP messages to phones, for example a SIP `INVITE` is sent to the receiving phone when another phone initiates a call. Asterisk sends SIP messages to phones at the source IP:port from the phone's most recent inbound SIP message by default. This behavior will work for us if we can ensure that UDP connections (for SIP) between the hosting tunneler and the Asterisk server stay alive to serve as a return path to the phone.

To keep the SIP/UDP connections alive at the hosting tunneler we need to defeat logic in the client tunneler's that kills intercepted UDP connections when they've been idle for 30 seconds. We can use the `qualify_frequency` configuration setting in *pjsip.conf* to make sure that bytes move frequently enough to prevent the client's connection (and by extension the Ziti connection and the UDP connection at the hosting tunneler) from going idle:

; prevent client tunnelers from closing SIP/UDP connections due to 30s idle timeout. qualify\_frequency=20

### RTP

SIP is used for setting up calls between phones, RTP carries the "media" (e.g. voice data) of VoIP calls. Each IP phone that participates in a call provides the address that other phones can connect to for the outbound media stream. Typically, the media stream consists of RTP packets. The important point is that each phone's media stream is carried on a discrete connection, and the phone provides the address for that media connection in the SIP `INVITE` and `OK` messages that were exchange when the call was set up.

Of course, unless two phones are on the same network then it is unlikely that the phones will be able to produce an address that is routable from the other phones. This is why we are using Asterisk to proxy RTP connections (for now, at least). There are a few configuration options in *pjsip.conf* that we can use to ensure phones receive routable addresses for connecting to other phones:

| Configuration Item | Description |
| --- | --- |
| `external_media_address` | Address to use when populating SDP payloads. This will match the Ziti intercept address. |
| `direct_media=no` | Always use `external_media_address` in SDP content of outbound SIP messages. |
| `rtp_symmetric=yes` | Asterisk returns RTP packets to the source IP:port of incoming RTP messages. |

### SIP/SDP Conversation

Here's an example of a SIP/SDP INVITE conversation between a calling phone, Asterisk, and the receiving phone when everything is set up correctly:

ext 6001 Asterisk ext 6002 \_\_\_\_\_ \_\_\_\_\_ \_\_\_\_\_ (.---.)-.*.-. |=====| (.---.)-.*.-. /:::\\ \_.---' |^\* | /:::\\ \_.---' '-----' |:::: | '-----' \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |:::: | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | INVITE sip:6001@192.168.8.1 SIP/2.0 \\ ---&gt; |:::: | ---&gt; | INVITE sip:6001@192.168.8.1 SIP/2.0  
| Via: SIP/2.0/UDP 100.64.0.1:52047 | | | | Via: SIP/2.0/UDP 192.168.8.1:5060 | (1) | c=IN IP4 100.64.0.1 | ------- | c=IN IP4 192.168.8.1 | (2) | m=audio 7078 RTP/AVP 96 97 98 0 ... | | m=audio 16382 RTP/AVP 0 101 | (3) --------------------------------------- ---------------------------------------

1. The `Via` address in the message that Asterisk sends to the receiving phone is the `external_signaling_address`
    
2. The "c=" media address in the SDP `INVITE` message is the `external_media_address`
    
3. The "m=" audio connection port is not the phone's audio port, but one from the configured rtp port range because `direct_media` is disabled
    

# Linphone Configuration

Setting up Linphone is pretty straightforward; you just need to create a SIP account that connects to the intercepted address that's specified in the Ziti service:

![linphone-macos-setup.png](/blogs/openziti/v1659554018888/Xr1ffyp4Z.png)

The service will show a green checkmark if everything is working ok:

![linphone-macos-connected.png](/blogs/openziti/v1659554272258/aGNgDcXKZ.png)

If Linphone isn't connecting for some reason, a quick look in the tunneler logs might be helpful.

On macOS the logs are available from the Ziti menu bar icon:

![ziti-macos-logs.png](/blogs/openziti/v1659554458239/ID_-s3cND.png)

You'll probably want to start with the "Packet Tunnel" logs.

On Windows you'll want to look at the "Service" logs under "Main Menu" -&gt; "Advanced Settings"

![ziti-windows-menu.png](/blogs/openziti/v1659555106171/kw4XEmo1A.png)

On Linux the tunneler logs are visible from the console that was used to launch `ziti-edge-tunnel`, or in `journalctl` if the tunneler was started as a systemd service.

If the tunneler's log level is DEBUG or higher you'll see something like this in the client tunneler logs when SIP connections are working:

```
\[2022-08-03T19:09:16.081Z\] DEBUG tunnel-sdk:tunnel\_udp.c:251 recv\_udp() intercepted address\[udp:192.168.8.1:5060\] client\[udp:100.64.0.1:51446\] service\[asterisk-voip\] \[2022-08-03T19:09:16.081Z\] DEBUG tunnel-cbs:ziti\_tunnel\_cbs.c:364 ziti\_sdk\_c\_dial() service\[asterisk-voip\] app\_data\_json\[141\]='{"connType":null,"dst\_protocol":"udp","dst\_ip":"192.168.8.1","dst\_port":"5060","src\_protocol":"udp","src\_ip":"100.64.0.1","src\_port":"51446"}'
```

The hosting tunneler logs will look like this:

```
\[ 2.434\] DEBUG tunnel-cbs:ziti\_hosting.c:559 on\_hosted\_client\_connect() hosted\_service\[asterisk-voip\], client\[ext6001\]: received app\_data\_json='{"connType":null,"dst\_protocol":"udp","dst\_ip":"192.168.8.1","dst\_port":"5060","src\_protocol":"udp","src\_ip":"100.64.0.1","src\_port":"51446"}' \[ 2.434\] INFO tunnel-cbs:ziti\_hosting.c:610 on\_hosted\_client\_connect() hosted\_service\[asterisk-voip\], client\[ext6001\] dst\_addr\[udp:192.168.8.1:5060\]: incoming connection \[ 2.434\] DEBUG ziti-sdk:channel.c:211 ziti\_channel\_add\_receiver() ch\[0\] added receiver\[2\] \[ 2.463\] DEBUG tunnel-cbs:ziti\_hosting.c:338 on\_hosted\_client\_connect\_complete() hosted\_service\[asterisk-voip\] client\[ext6001\] server\[udp:127.0.0.1:5060\] connected
```

Feel free to reach out on the OpenZiti discourse at https://openziti.discourse.group if Linphone is not connecting and the tunneler logs aren't helping you.

# Asterisk Configuration Files

## pjsip.conf

```plaintext
;===============TRANSPORT

[transport-udp]
type=transport
protocol=udp
bind=127.0.0.1

; provide ziti intercepted IP to clients
external_media_address=192.168.8.1
external_signaling_address=192.168.8.1

;===============ENDPOINT TEMPLATES

[endpoint-basic](!)
type=endpoint
context=default
disallow=all
allow=ulaw

; asterisk puts this in the "host" section of outgoing From: headers.
; without this, the source IP of the message will be used (e.g. the host's lan ip).
from_domain=192.168.8.1
; don't attempt to connect phones directly with each other.
direct_media=no
; return rtp packets to the hosting tunneler's punched hole instead of the SDP c= address.
rtp_symmetric=yes

[auth-userpass](!)
type=auth
auth_type=userpass

[aor-single-reg](!)
type=aor
max_contacts=1
remove_existing=yes
; prevent client tunnelers from closing SIP connections due to 30s idle timeout.
qualify_frequency=25

;===============EXTENSION 6001

[6001](endpoint-basic)
auth=auth6001
aors=6001

[auth6001](auth-userpass)
password=6001
username=6001

[6001](aor-single-reg)

;===============EXTENSION 6002

[6002](endpoint-basic)
auth=auth6002
aors=6002

[auth6002](auth-userpass)
password=6002
username=6002

[6002](aor-single-reg)

;===============EXTENSION 6003

[6003](endpoint-basic)
auth=auth6003
aors=6003

[auth6003](auth-userpass)
password=6003
username=6003

[6003](aor-single-reg)
```

## rtp.conf

```plaintext
;
; RTP Configuration
;
[general]
;
; RTP start and RTP end configure start and end addresses
;
; Defaults are rtpstart=5000 and rtpend=31000
;
rtpstart=10000
rtpend=20000
```

## extensions.conf

```plaintext
[from-internal]
exten = 100,1,Answer()
same = n,Wait(1)
same = n,Playback(hello-world)
same = n,Hangup()

[default]
exten=>6001,1,Dial(PJSIP/6001,20)
exten=>6002,1,Dial(PJSIP/6002,20)
exten=>6003,1,Dial(PJSIP/6003,20)
```
