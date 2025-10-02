---
title: "Jitsi, meet zrok"
date: 2024-07-31T18:25:02Z
cuid: clza6fr0v000608l2cnqjamv9
slug: jitsi-meet-zrok
authors: [KennethBingham]
image: "@site/blogs/openziti/v1722450203675/ee7c2e5c-4ef2-46e7-a05d-767cf2e7ab58.png"
tags: 
  - self-hosted

---

[Jitsi Meet](https://jitsi.github.io/handbook/) is an open-source video conferencing server. I've wanted to run Jitsi behind zrok and [someone asked about it today in the forum](https://openziti.discourse.group/t/local-jitsi-meet-zrok/2900/4?u=qrkourier) and we got it working! Here's how I conveniently self-host Jitsi with zrok.

<!-- truncate -->

## Why zrok?

[zrok.io](https://zrok.io) makes it easy to self-host web applications while obscuring your real public IP and protecting your private network. Your visitors will see a trusted certificate with the name `*.share.zrok.io` provided by zrok.io as a service when they visit your Jitsi Meet instance's public URL.

Jitsi Meet requires a trusted certificate for WebRTC, so zrok.io also spares you the chore of issuing, renewing, and configuring a TLS server certificate for Jitsi.

## Orientation

You only need Docker to follow this tutorial. There's nothing else to install. You can use this guide with a free account from [zrok.io](https://zrok.io) or a [self-hosted zrok instance](https://docs.zrok.io/docs/guides/self-hosting/docker/).

Jitsi Meet's Docker Compose project is pre-configured to publish the container ports to the Docker Host's external interfaces. Typically, that is necessary so they are reachable by clients.

zrok works differently and does not need the ports to be published externally. Instead, zrok runs inside the Compose project on the `meet.jitsi` bridge network. zrok will proxy the traffic securely to the containers' internal ports, so we'll override the forwarded, published ports, exposing them only inside the Compose project.

## The Steps

1. Follow [Jitsi's Docker Quickstart](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker/#quick-start) and wait to run `docker compose up`.
    
2. In your terminal, change to the directory where you have created these Jitsi quickstart files: `.env` and `docker-compose.yml`.
    
3. Download the zrok [public share compose example](https://docs.zrok.io/zrok-public-reserved/compose.yml) and save it as the filename `docker-compose.zrok.yml` in the same directory.
    
4. Add the following YAML as the filename `docker-compose.override.yml` in the same directory.
    
    ```yaml
    services:
      web:
        ports: !override []
      jicofo:
        ports: !override []
      jvb:
        ports: !override []
      zrok-share:
        networks:
          meet.jitsi:
    ```
    
5. Think of a name for your self-hosted Jitsi Meet instance. You will use it in the next step to define the unique name of the zrok share which is part of the public URL. The name must be 4-32 lowercase letters or numbers.
    
6. Save the following variable assignments as the filename `.env.zrok` in the same directory.
    
    ```bash
    PUBLIC_URL="https://myjitsi.share.zrok.io"  # subdomain must match ZROK_UNIQUE_NAME
    ZROK_UNIQUE_NAME="myjitsi"                  # must match PUBLIC_URL subdomain
    ZROK_ENABLE_TOKEN="ix9XrvQt13Rf"            # zrok account token from console
    ZROK_ENVIRONMENT_NAME="jitsi-zrok-compose"  # name for the environment in the console graph
    ZROK_API_ENDPOINT="https://api.zrok.io"     # must be set to the zrok API you're using
    ZROK_TARGET="https://web:443"               # this is correct for the web container's internal port
    ZROK_INSECURE="--insecure"                  # let zrok skip cert verification for the internal web:443 target
    ```
    
7. Optionally, turn on OAuth for this Jitsi Meet instance with zrok. Add the following to the `.env.zrok` file ([Docker public share guide has more info](https://docs.zrok.io/docs/guides/docker-share/docker_public_share_guide/)).
    
    ```bash
    ZROK_OAUTH_PROVIDER="google"  # google, github
    # space-separated list email patterns verified by the provider
    ZROK_OAUTH_EMAILS="alice.example@gmail.com *@acme.example.com"
    ```
    
8. Save the following script as the filename `compose.bash` in the same directory. This script configures the compose project and environment files.
    
    ```bash
    
    export COMPOSE_FILE="docker-compose.yml:docker-compose.zrok.yml:docker-compose.override.yml"
    export COMPOSE_ENV_FILES=".env,.env.zrok"
    
    docker compose  "${@}"
    ```
    
9. Ensure you have all the necessary files.
    
    1. `docker-compose.yml`
        
    2. `docker-compose.zrok.yml`
        
    3. `docker-compose.override.yml`
        
    4. `.env`
        
    5. `.env.zrok`
        
    6. `compose.bash`
        
10. Run Jitsi and zrok.
    
    ```bash
    bash ./compose.bash up
    ```
    
11. Open Jitsi in a web browser at the address from the `PUBLIC_URL` environment variable, e.g., `https://myjitsi.share.zrok.io` .
    
12. If you need to change the name, authentication, etc. you can delete the environment in the zrok web console and delete the Docker volumes like this to start over. It's also possible to make surgical changes if you don't want to start over. [Ask for help in Discourse](https://openziti.discourse.group/).
    
    ```bash
    bash ./compose.bash down --volumes
    ```
    

## zrok frontdoor

This tutorial for Jitsi Meet is a great example of [zrok frontdoor](https://docs.zrok.io/docs/guides/frontdoor/?os=Docker). zrok frontdoor brings many advantages for self-hosters and is always enabled when using zrok.io as a service with a production-ready service like this zrok public share in Docker. zrok.io users enjoy additional shielding for their Jitsi Meet public URL.

## Relatedly

zrok is built with OpenZiti. Here's [another post about running an Asterisk PBX without published ports](https://medium.com/netfoundry/tunneling-voip-over-openziti-69d6487605e4), just as your Jitsi Meet instance has no open ports on the Docker Host's outward-facing interfaces.

## Share the Project

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [**starring us on GitHub**](https://github.com/openziti/ziti/). It helps. Let us know if you found a good use for this or have an improvement or question in mind on [**X <s>twitter</s>**](https://twitter.com/openziti), in [/r/openziti](https://www.reddit.com/r/openziti/), or the [Discourse forum](https://openziti.discourse.group/). We upload and stream [**on YouTube**](https://youtube.com/openziti) too. We'd love to hear from you!
