---
title: "Limitless zrok with Docker"
date: 2024-05-22T20:00:34Z
cuid: clwi90z8q000e09m6bzop4hr1
slug: limitless-zrok-with-docker
authors: [KennethBingham]
image: "@site/blogs/openziti/v1716328568062/8df0ac72-be9a-471b-ac5e-3f03e21a8ae3.png"
imageDark: "@site/blogs/openziti/v1716328568062/8df0ac72-be9a-471b-ac5e-3f03e21a8ae3.png"
tags: 
  - self-hosted
  - docker-compose
  - openziti
  - zrok
  - tunneling

---

You can conveniently run a zrok instance on a Linux server. The Caddy option makes it easy to auto-renew a wildcard certificate to protect the zrok API and your public shares with TLS.

<!-- truncate -->

## What's This Good For?

* [You can publicly share websites, files, etc.](https://docs.zrok.io/docs/concepts/sharing-public/), with auth from your computers without punching holes in their inbound firewalls. This is called reverse tunneling. Your Linux server is public and acts as a relay.
    
* [You can privately share TCP/UDP services or create a VPN](https://docs.zrok.io/docs/concepts/sharing-private/). You must give the other party an account on your instance. This is excellent for multi-player games, etc.
    
* **No limits** — Maximize the use of your available bandwidth and compute.
    
* **Data sovereignty** — Assuming you control your server, no third parties can access your data.
    
* **Availability** — You control upgrades and uptime...which can be a double-edged sword!
    

## The Needful Things

* [Install Docker on your Linux](https://docs.docker.com/engine/install/) server.
    
* Create a wildcard record in the zrok DNS zone for your Linux server's public IP address.
    
* to enable Caddy TLS, you'll need an API token from your DNS provider.
    

## The Short Version

```bash
curl https://get.openziti.io/zrok-instance/fetch.bash | bash
```

Then, configure your environment with an `.env` file

```bash
ZROK_DNS_ZONE=share.example.com

ZROK_USER_EMAIL=me@example.com
ZROK_USER_PWD=zrokuserpw

ZITI_PWD=zitiadminpw
ZROK_ADMIN_TOKEN=zroktoken

# if you don't plan to enable Caddy TLS,
#  set this to publish insecure ports
ZROK_INSECURE_INTERFACE=0.0.0.0
```

...and start the containers.

```bash
docker compose up --build
```

## Enable Caddy TLS

If you have an API token from your DNS provider, you can add these values to your `.env` file to configure Caddy to auto-renew a wildcard certificate for your zrok DNS zone.

```bash
CADDY_DNS_PLUGIN=cloudflare
CADDY_DNS_PLUGIN_TOKEN=abcd1234
```

Enable Caddy by renaming the extra compose file.

```bash
mv caddy.compose.override.yml compose.override.yml
```

Restart the containers.

```bash
docker compose up --build --force-recreate
```

## The Longer Version

<iframe width="100%" height="315" src="https://www.youtube.com/embed/70zJ_h4uiD8"></iframe>

Here's [a link to the full guide](https://docs.zrok.io/docs/guides/self-hosting/docker/) used in the video.

## Get in Touch

Visit us in [our Discourse community](https://openziti.discourse.group/) if you have any ideas or questions.
