Some quick notes on building this in travis.

#build the base image...
docker build openziti-mono-base -t openziti/doc:mono-base

#build the image that is pushed out to docker hub
docker build openziti-mono -t openziti/doc:docfx

#push out to docker hub
docker push openziti/doc:docfx
