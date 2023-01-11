
# Ziti Controller REST API

The API version and Swagger definition for a particular controller may be fetched and there are relatively good documents
available as well, also served directly from the controller. There are two main endpoints 

## Client API

The client api services are used by endpoints to interact with the [Ziti Network](../../../learn/introduction/index.mdx).
These services are necessary to authenticate, enroll, return services and fetch other information related to the 
endpoint's participating in the network.

### Download the Client API Spec

The client api spec can be downloaded from your controller, e.g., `https://ctrl.example.com:1280/edge/client/v1/docs`.

## Management API

The management api is used to configure, manage, and maintain the [Ziti Network](../../../learn/introduction/index.mdx).

### Download the Management API Spec

The client api spec can be downloaded from your controller, e.g., `https://ctrl.example.com:1280/edge/management/v1/docs`.

## Example

### Find the controller version

Here's one of many examples you'll find linked in the docs

`GET /`

```json
{
    "data": {
        "apiVersions": {
            "edge": {
                "v1": {
                    "path": "/edge/v1"
                }
            }
        },
        "buildDate": "2021-04-23 18:09:47",
        "revision": "fe826ed2ec0c",
        "runtimeVersion": "go1.16.3",
        "version": "v0.19.12"
    },
    "meta": {}
}
```
