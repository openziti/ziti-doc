
# Build the docker image used to produce docfx docs

1. Pull the base image

    ```bash
    docker pull ubuntu:groovy
    ```

2. Build `openziti-mono-base` only if changing the version of Mono

    ```bash
    docker build openziti-mono-base -t openziti/doc:mono-base-2004
    ```

3. Build the `openziti-mono` folder if you're only changing docfx version or doxygen version

    This is the image that is pushed out to docker hub.

    ```bash
    docker build openziti-mono -t openziti/doc:docfx
    ```

4. Run the container to gain a shell

    ```bash
    docker run -v "$(pwd)":/ziti-doc --rm -it openziti/doc:docfx /bin/bash
    ```

5. Try things out

    ```bash
    cd /ziti-doc && ./gendoc.sh
    ```

6. Push to Docker Hub

    ```bash
    docker push openziti/doc:docfx
    ```
