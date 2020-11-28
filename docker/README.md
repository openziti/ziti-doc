Here are the steps to test/rebuild the docker image used to produce docfx docs...

#pull the base image...
docker pull ubuntu:groovy

#build the base image... build this to change the version of mono etc
docker build openziti-mono-base -t openziti/doc:mono-base-2004

# if you're only changing docfx version or doxygen version etc you only need
# to build the openziti-mono folder:
# build the image that is pushed out to docker hub
docker build openziti-mono -t openziti/doc:docfx

# to run the contain and 'try things out' run:
docker run -v "$(pwd)":/ziti-doc --rm -it openziti/doc:docfx /bin/bash

# once inside you can run:
cd /ziti-doc && ./gendoc.sh

# assuming everything seems ok - push out to docker hub
docker push openziti/doc:docfx