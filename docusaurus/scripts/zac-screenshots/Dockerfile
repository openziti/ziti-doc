FROM ubuntu:24.04 AS bind6
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev && rm -rf /var/lib/apt/lists/*
COPY bind6.c /src/
RUN gcc -shared -fPIC -O2 -o /src/bind6.so /src/bind6.c -ldl

# The lab container: controller, router, ZAC, the services, the tunnelers, and the browser that drives ZAC.
# The Playwright version here must match package.json.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

ARG ZITI_VERSION=2.0.6
ARG TUNNEL_VERSION=1.19.1
ARG ZAC_VERSION=4.6.0

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl unzip jq openssl nginx-light \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/ziti/bin /opt/ziti/zac \
 && curl -fsSL "https://github.com/openziti/ziti/releases/download/v${ZITI_VERSION}/ziti-linux-amd64-${ZITI_VERSION}.tar.gz" \
    | tar -xz -C /opt/ziti/bin ziti \
 && curl -fsSL -o /tmp/zet.zip \
    "https://github.com/openziti/ziti-tunnel-sdk-c/releases/download/v${TUNNEL_VERSION}/ziti-edge-tunnel-Linux_x86_64.zip" \
 && unzip -q /tmp/zet.zip -d /opt/ziti/bin \
 && curl -fsSL -o /tmp/zac.zip \
    "https://github.com/openziti/ziti-console/releases/download/app-ziti-console-v${ZAC_VERSION}/ziti-console.zip" \
 && unzip -q /tmp/zac.zip -d /opt/ziti/zac \
 && chmod +x /opt/ziti/bin/* && rm /tmp/*.zip
COPY --from=bind6 /src/bind6.so /opt/ziti/lib/bind6.so
# the tunneler's IPC sockets, which ext-jwt-login uses in step 8, need the group the Linux packages create
RUN groupadd --system ziti
ENV PATH=/opt/ziti/bin:$PATH

WORKDIR /lab
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
