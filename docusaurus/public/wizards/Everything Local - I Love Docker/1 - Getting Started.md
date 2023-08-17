Docker is a popular container engine, and many developers enjoy using solutions delivered via Docker. Ziti provides a single Docker container which contains the entire stack of Ziti components. This is not the most common mechanism for deploying containers, we recognize that. However, we think that this makes it a bit easier for people to get started with deploying Ziti components using Docker. We will certainly look to create individual containers for each component in the future but for now it's a single container. You can get this container by issuing

```
docker pull openziti/quickstart:latest
```