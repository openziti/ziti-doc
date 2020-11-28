FROM openziti/doc:mono-base-2004

ENV DEBIAN_FRONTEND=noninteractive

# docfx install && doxygen install
RUN apt update && \
    apt install -y \
    vim \
    wget \
    unzip \
    curl \
    awscli \
    git \
    ssh \
    jq \
    clang-9 \
    libclang-9-dev
RUN wget https://github.com/dotnet/docfx/releases/download/v2.56.5/docfx.zip && \
    unzip docfx.zip -d docfx && \
    rm docfx.zip && \
    echo "mono /docfx/docfx.exe \$@" > /usr/bin/docfx && \
    chmod +x /usr/bin/docfx && \
    wget -q -c http://doxygen.nl/files/doxygen-1.8.20.linux.bin.tar.gz -O - | tar -xz && \
    ln -s /doxygen-1.8.20/bin/doxygen /usr/bin/doxygen && \
    curl -s https://api.github.com/repos/netfoundry/ziti-ci/releases/latest | jq -r '.assets[] | select (.name=="ziti-ci") | .browser_download_url' | wget -i - -O ziti-ci && \
    chmod +x ziti-ci
    #&&
    #\
    #rm -rf /var/lib/apt/lists/* /tmp/*
