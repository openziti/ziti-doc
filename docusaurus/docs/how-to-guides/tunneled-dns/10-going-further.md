---
sidebar_label: 10. Going further
---

# Going further: the Learn OpenZiti series

The steps above cover DNS and web apps. The other things you asked about, remote backup servers and keeping the
admin console private, are covered in more depth in the four-part
[Learn OpenZiti](https://github.com/openziti-test-kitchen/ziti-tv/tree/main/learn-openziti) series from Ziti TV.
Each part has a README with every command and a compose file to run it yourself.

## Part 1: All-in-one

[part1-all-in-one](https://github.com/openziti-test-kitchen/ziti-tv/tree/main/learn-openziti/part1-all-in-one)

A controller and router in Docker, with Let's Encrypt certificates. Start here if you want to run your own
controller instead of the one used in this lab.

## Part 2: Adding a second router

[part2-adding-a-second-router](https://github.com/openziti-test-kitchen/ziti-tv/tree/main/learn-openziti/part2-adding-a-second-router)

Splits the quickstart into separate containers and adds an edge router on the "home" network. This lab used a
tunneler on the Pi-hole host to reach the LAN. Part 2 shows the other option: a router on the LAN that can host
services for every machine behind it, with no tunneler on each one.

## Part 3: Advanced services

[part3-services](https://github.com/openziti-test-kitchen/ziti-tv/tree/main/learn-openziti/part3-services)

This part covers your remote backup servers.

- **SSH to a remote machine through the overlay.** `sshtarget` runs `ziti-edge-tunnel run-host` and hosts its own
  SSH service. A backup server is the same pattern. Run the tunneler on the backup server, then change the host
  config to its backup port (rsync over SSH, the restic REST server, and so on).
- **Addressable services.** With `bindUsingEdgeIdentity` on the host side and `"dialOptions": {"identity":
  "$dst_hostname"}` on the intercept, one service covers many hosts. A client dials `<identity-name>.zititv` and
  reaches the host enrolled under that name. To add a backup server, enroll an identity with the bind attribute. The
  service and policies stay the same.
- **Wildcard intercepts with `forwardAddress`.** The same technique as [step 9](./09-wildcard-web.mdx), applied to
  `*.zititv`.

## Part 4: Dark management API

[part4-dark-management-api](https://github.com/openziti-test-kitchen/ziti-tv/tree/main/learn-openziti/part4-dark-management-api)

This part covers keeping the admin console (ZAC) private.

The controller's `edge-management`, `fabric`, and `zac` bindings move to a web listener that isn't exposed to the
internet. The management API and ZAC are then published as an OpenZiti service that only admin identities may dial.
Once it's done, ZAC can't be reached from the internet at all. You need an enrolled admin identity with its tunneler
running to open it.
