
# Ziti controlller REST API

The API version and Swagger definition for a particular controller may be fetched.

## Examples

### Find the controller version

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

### Download the Swagger definition

You may wish to import the definition in Postman to create a collection of requests or generate boilerplate client code for your preferred programming language.

`GET /edge/v1/specs/swagger/spec`

<!-- TODO: there might be a way to transclude the current definition of pasting a stale version in-line -->
