---
title: "Postman and the Management API"
date: 2023-03-02T15:08:04Z
cuid: cler8r24d000n09ichw8y48u8
slug: postman-mgmt
authors: [KennethBingham]
image: /blogs/openziti/v1677732038328/f6149856-e282-4451-b1a4-f278eff9f11b.png
ogimage: /blogs/openziti/v1677731728423/ba352516-83a5-48a8-a41b-e028c2dad45e.png
tags: 
  - postman
  - swagger
  - rest-api
  - openapi
  - codegeneration

---

Postman can build a collection of API requests and has a friendly interface for walking the API specification. This article aims to accelerate your timeline for productively exploring the API and developing an integration.

<!-- truncate -->

## About the Management API

The [OpenZiti](https://netfoundry.io/docs/openziti/learn/introduction/) controller provides an edge-management API for creating, reading, updating, and deleting (CRUD) OpenZiti resources, e.g., Services, Edge Router Policies, etc. The simplest way to use the edge-management API is through [the `ziti` CLI](https://netfoundry.io/docs/openziti/downloads#the-ziti-executable) or [the console](https://github.com/openziti/ziti-console#readme).

### What about the Client API?

The edge-management API is distinct from the edge-client API. [Edge SDKs](https://netfoundry.io/docs/openziti/reference/developer/sdk/) use the edge-client API to authenticate and find services and routers. The OpenZiti Controller can be configured to provide both APIs on the same server port. Whether the two APIs are combined or split, their URL paths are discrete. You can learn more about both APIs in [the developer references](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/).

## Generated Clients

Before you write an edge-management client, could you use the [Go client (`go-swagger`)](https://github.com/openziti/edge-api/tree/main/rest_management_api_client) or [Python client (`openapi-generator`)](https://github.com/openziti-test-kitchen/openziti-edge-management-python) generated from the specification? Those might save you some typing if you can adapt them to your purpose.

## Get the OpenAPI 2.0 Specification

The best place to get the specification is your running OpenZiti Controller. That way, you know the specification matches the version you are using. The controller publishes the spec in the edge-management API at the path `/edge/management/v1/swagger.json`. There's also a built-in API reference website at the path `/edge/management/v1/docs`. If you don't have a running controller, browse [the latest spec and API reference on the docs site](https://netfoundry.io/docs/openziti/reference/developer/api/edge-management-reference).

## Import to Postman

Click the "[Import](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" button on your Postman Workspace and provide a file path or URL to the OpenZiti edge-management API specification.

## Create a Postman Environment

1. Create a Postman environment for this API. [Here's the Postman help for reference](https://learning.postman.com/docs/sending-requests/managing-environments/).
    
2. Add a variable "[baseUrl](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" and assign the current value of your management API's URL. For example, if the API is listening on local port 1280, assign `https://localhost:1280/edge/management/v1`.
    
3. Add another variable named "**apiKey**" without any value. This variable will be assigned by the "authenticate" request's test script.
    

## Customize the Authenticate Request

Modify the "[authenticate](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" request to store your API session token in your Postman environment. All subsequent requests will use this bearer token.

In the collection of requests that Postman generated from the spec, find the request named "**authenticate**" and select the POST operation named "**Authenticate via a method supplied via a query string parameter**."

1. In the "[Params](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" tab of the request, ensure you have a query param named "[method](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" with the value "[password](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)".
    
2. Ensure the request path of the operation is now showing `{{baseUrl}}/authenticate?method=password`.
    
3. In the "Tests" tab of the request, add this Javascript.
    
    ```javascript
    var jsonData = JSON.parse(responseBody);
    pm.environment.set("apiKey", jsonData.data.token);
    ```
    
4. In the "[Body](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" tab of the request, add JSON like this with your correct username and password for the management API.
    
    ```json
    {
        "username": "admin",
        "password": "Otz2q5gnYVSTkza2aJ1EUq72hGGiFvmZ"
    }
    ```
    
5. Click the "[Send](https://ziti-doc-git-kube-guide-openziti.vercel.app/docs/reference/developer/)" button.
    

You should have received an HTTP OK (200) response from the management API. Now you can send any other requests in the collection, and they will automatically use the token from your Postman environment.
