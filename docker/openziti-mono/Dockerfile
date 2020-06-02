FROM openziti/doc:mono-base

# docfx install && doxygen install
RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y vim wget unzip curl mono-devel awscli git && \
    wget https://github.com/dotnet/docfx/releases/download/v2.54/docfx.zip && \
    unzip docfx.zip -d docfx && \
    rm docfx.zip && \
    echo "mono $(pwd)/docfx/docfx.exe" > /usr/bin/docfx && \
    chmod +x /usr/bin/docfx && \
    wget -q -c http://doxygen.nl/files/doxygen-1.8.18.linux.bin.tar.gz -O - | tar -xz && \
    ln -s /doxygen-1.8.18/bin/doxygen /usr/bin/doxygen && \
    rm -rf /var/lib/apt/lists/* /tmp/*
    #&& \
    #rm docfx.zip doxygen*.gz