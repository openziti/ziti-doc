---
title: "Easy Steps to Install a Private VPN on Linux with zrok"
seoTitle: "Install Private VPN on Linux with zrok"
seoDescription: "Learn easy steps to install, configure, and join a private VPN on Linux using zrok."
date: 2024-08-02T17:10:31Z
cuid: clzcynn3a000009kwfowoela4
slug: zrok-vpn-linux-service
authors: [KennethBingham]
image: "@site/blogs/openziti/v1722617478239/b985c30b-aae1-42c1-a450-b3fd255b14a3.avif"
tags: 
  - vpn

---

The great thing about the `zrok-share.service` is that it comes with the `zrok` binary and is always on in the background, so it's a good fit for a reliable VPN connection. Let's install the service and configure it to auto-start after a reboot.

<!-- truncate -->

```bash
curl -sSLf https://get.openziti.io/install.bash | sudo bash -s zrok-share
```

Edit `/opt/openziti/etc/zrok/zrok-share.env`.

```bash
# env
ZROK_ENABLE_TOKEN="w9pEuX3Gb750"  # account token from the console
ZROK_ENVIRONMENT_NAME="my zrok vpn service on hostname"

# share
ZROK_UNIQUE_NAME="mysecretsharetoken"
ZROK_BACKEND_MODE="vpn"
ZROK_TARGET="172.21.71.1/24"  # allocate ip in some private subnet
ZROK_FRONTEND_MODE="reserved-private"
```

You can control access to your VPN by keeping `ZROK_UNIQUE_NAME` a secret (the share token) or adding the following to restrict zrok accounts by email. Only your account can use the share in closed mode if you don't add grants.

```bash
ZROK_PERMISSION_MODE="closed"
ZROK_ACCESS_GRANTS="alice@example.com bob@example.org"
```

Grant kernel capability `NET_ADMIN` to the service.

```bash
sudo sed -Ei 's/.*AmbientCapabilities=CAP_NET_ADMIN/AmbientCapabilities=CAP_NET_ADMIN/' /etc/systemd/system/zrok-share.service.d/override.conf
sudo systemctl daemon-reload
```

Start the service now and auto-start after a reboot.

```bash
sudo systemctl enable --now zrok-share.service
```

Check the logs.

```bash
sudo journalctl -lfu zrok-share.service
```

The logs should look like this, confirming this device is allocated 172.21.71.1 on the VPN.

```json
Aug 02 16:33:08 ubuntu zrok-share.bash[6243]: {"level":"info","ts":1722616388.2556849,"msg":"interface created tun0"}
Aug 02 16:33:08 ubuntu zrok-share.bash[6243]: {"level":"info","ts":1722616388.255752,"msg":"exec /sbin/ip [link set dev tun0 mtu 16384]"}
Aug 02 16:33:08 ubuntu zrok-share.bash[6243]: {"level":"info","ts":1722616388.2595484,"msg":"exec /sbin/ip [addr add 172.21.71.1/24 dev tun0]"}
Aug 02 16:33:08 ubuntu zrok-share.bash[6243]: {"level":"info","ts":1722616388.2627363,"msg":"exec /sbin/ip [-6 addr add fd00:7a72:6f6b::1/64 dev tun0]"}
Aug 02 16:33:08 ubuntu zrok-share.bash[6243]: {"level":"info","ts":1722616388.2659466,"msg":"exec /sbin/ip [link set dev tun0 up]"}
Aug 02 16:33:08 ubuntu zrok-share.bash[6243]: {"level":"info","ts":1722616388.2711568,"msg":"interface configured tun0"}
```

## Join the VPN from Another Device

The zrok console looks like this for an account with two environments, one per VPN peer, and one VPN share.

![](/blogs/openziti/v1722617910042/3972fae3-e826-402f-82e9-9c3514f0bfe4.png)

To temporarily join the zrok VPN you only need to run this command.

```bash
sudo -E zrok access private mysecretsharetoken
```

You will see zrok's terminal user interface (TUI) telling you what is happening. This second device will be allocated 172.21.71.2 and subsequent devices will get unique IP allocations when they join. This is a network-layer VPN. You can send ICMP, TCP, UDP, etc.

Now, this second device is joined to the VPN, so it has a dashed line to the VPN share indicating a zrok "private access."

![](/blogs/openziti/v1722618841867/969509da-0a39-4a4b-ad76-0c0dc0a524c9.png)

## Share the Project

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please [give zrok a star on GitHub](https://github.com/openziti/zrok)!

Let us know if you found a good use for this or have an improvement or question in mind on [**X <s>twitter</s>**](https://twitter.com/openziti), in [/r/openziti](https://www.reddit.com/r/openziti/), or the [Discourse forum](https://openziti.discourse.group/). We upload and stream [**on YouTube**](https://youtube.com/openziti) too. We'd love to hear from you!
