DEBIAN_FRONTEND="noninteractive" apt install wget unzip curl -y
mono --version
mkdir docfx
cd docfx
wget -q https://github.com/dotnet/docfx/releases/download/v2.54/docfx.zip
unzip docfx
export PATH=$PATH:$(pwd)
echo "mono $(pwd)/docfx.exe" > docfx
chmod +x docfx
cd ..
wget -q http://doxygen.nl/files/doxygen-1.8.18.linux.bin.tar.gz
tar -xvf doxygen-1.8.18.linux.bin.tar.gz
export PATH=$PATH:$(pwd)/doxygen-1.8.18/bin
ls -l
export GIT_BRANCH=$(if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then echo $TRAVIS_BRANCH; else echo $TRAVIS_PULL_REQUEST_BRANCH; fi)
./publish.sh docs
