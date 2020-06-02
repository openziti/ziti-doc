sudo apt install gnupg ca-certificates
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb https://download.mono-project.com/repo/ubuntu stable-bionic main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list
sudo apt update
DEBIAN_FRONTEND="noninteractive" apt install mono-devel wget unzip curl -y
mono --version
mkdir docfx
cd docfx
wget -q https://github.com/dotnet/docfx/releases/download/v2.54/docfx.zip
unzip docfx
export PATH=$PATH:$(pwd)
echo "mono $(pwd)/docfx.exe" > docfx
chmod +x docfx
cd ..
wget "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"
unzip awscli-exe-linux-x86_64.zip
mkdir aws-bin
./aws/install -b aws-bin
export PATH=$(pwd)/aws-bin:$PATH
wget -q http://doxygen.nl/files/doxygen-1.8.18.linux.bin.tar.gz
tar -xvf doxygen-1.8.18.linux.bin.tar.gz
export PATH=$PATH:$(pwd)/doxygen-1.8.18/bin
ls -l
export GIT_BRANCH=$(if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then echo $TRAVIS_BRANCH; else echo $TRAVIS_PULL_REQUEST_BRANCH; fi)
./publish.sh docs
