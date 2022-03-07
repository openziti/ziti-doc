
# Ziti controlller REST API

The API version and Swagger (OpenAPI 2.0) definition for a particular controller may be fetched and there are relatively good documents
available as well, also served directly from the controller. There are two main endpoints 

## Edge-Client API

The edge-client API services are used by endpoints to interact with the [Ziti Network](~/ziti/overview.md#overview-of-a-ziti-network).
These services are necessary to authenticate, enroll, return services and fetch other information related to the
endpoint's participating in the network.

### Download the Edge-Client API Spec

The edge-client API spec for your running controller is published as part of the API itself and may be fetched from [https://${CONTROLLER_ADDRESS}/edge/client/v1/docs](https://${CONTROLLER_ADDRESS}/edge/client/v1/docs). The latest edge-client API spec for is also available from [the Git repo](https://github.com/openziti/edge/blob/main/specs/client.yml).

## Management API

The management API is used to configure, manage, and maintain the [Ziti Network](~/ziti/overview.md#overview-of-a-ziti-network).

### Download the Management API Spec

The management API spec too may be downloaded for your running controller at [https://${CONTROLLER_ADDRESS}/edge/management/v1/docs](https://${CONTROLLER_ADDRESS}/edge/management/v1/docs). The latest management API spec is also available from [the Git repo](https://github.com/openziti/edge/blob/main/specs/management.yml).

## The Fabric Management API

The fabric API is a lesser concern for most users, implementers, and integrators because it is itself implemented by the Ziti Edge and so most fabric-level operations are performed on your behalf in the course of using Ziti.

### Download the Fabric Management API Spec

The fabric API spec may be fetched from [the Git repo](https://github.com/openziti/fabric/blob/main/specs/swagger.yml).

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
