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
RUN wget https://github.com/dotnet/docfx/releases/download/v2.59.3/docfx.zip \
    && unzip docfx.zip -d docfx \
    && rm docfx.zip \
    && echo "mono /docfx/docfx.exe \$@" > /usr/bin/docfx \
    && chmod +x /usr/bin/docfx \
    && wget -q -c http://doxygen.nl/files/doxygen-1.9.4.linux.bin.tar.gz -O - | tar -xz \
    && ln -s /doxygen-1.9.4/bin/doxygen /usr/bin/doxygen
WORKDIR /ziti-doc
