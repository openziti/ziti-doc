FROM ubuntu:18.04

# mono and dependencies install
RUN apt update && \
    apt install gnupg ca-certificates -y && \
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF && \
    echo "deb https://download.mono-project.com/repo/ubuntu stable-bionic main" | tee /etc/apt/sources.list.d/mono-official-stable.list && \
    apt update && DEBIAN_FRONTEND=noninteractive apt install -y vim wget unzip curl mono-devel awscli git && \
    rm -rf /var/lib/apt/lists/* /tmp/*