---
title: "OpenAPI Python Clients"
date: 2023-03-03T20:06:20Z
cuid: clesyuhca000009lcf8f79ub7
slug: openapi-python-clients
authors: [StevenBroderick]
image: /blog/v1677866933476/6a4428fe-aa77-489d-b4f3-f8251969f8df.png
tags: 
  - python
  - openapi
  - openziti

---

At the [OpenZiti project](https://github.com/openziti), we heavily rely on OpenAPI specifications to streamline our development process. The OpenAPI project provides [code generators](https://openapi-generator.tech/docs/generators/) that support a variety of programming languages. In this blog, we'll focus on a practical guide for using a generated OpenAPI Python client library. Using a generated client as a user of an API is not entirely a straightforward process. Investing some time upfront to understand the translation between the spec and the code will help you establish the right mental model and kickstart your development.

We'll generate an OpenAPI Python client library from our [OpenZiti Edge Client API spec](https://github.com/openziti/edge-api/blob/main/client.yml). This API allows OpenZiti clients to create OpenZiti [controller](https://docs.openziti.io/docs/learn/introduction/components#openziti-controller) sessions to gather information needed for them to do work. We'll map what we define in the spec to the concepts expressed in the generated client. We'll step through a basic authentication and request/response example to help you understand what is going on.

## Generating an OpenAPI Python Client:

Our [edge-api](https://github.com/openziti/edge-api) project uses [go-swagger](https://github.com/go-swagger/go-swagger), which is strictly an OpenAPI 2.0 (a.k.a. Swagger 2.0/OAS2) implementation for Go. In our testing, the Python generator that best supported this spec version was the [python-prior](https://openapi-generator.tech/docs/generators/python/) generator. Below, we leverage the `openapi-generator-cli` docker container to generate the Python client library for the OpenZiti Edge Client API from its specification. The generator reads in the spec and produces a Python library compatible with our API. The `--package-name` option specifies the Python package name (directory structure under `site-packages` that will contain our library's `__init__.py` file).

```bash
docker run \
    --rm \
    --volume "$PWD":/out \
    docker.io/openapitools/openapi-generator-cli generate \
        --generator-name python-prior \
        --input-spec 'https://raw.githubusercontent.com/openziti/edge-api/main/client.yml'
        --output '/out' \
        --package-name 'openziti_edge_client'
```

Once generated, this library can be installed locally with `pip` as follows:

```bash
pip install .
```

## Understanding the Generated Files:

You'll have a wealth of generated files in the output of the generator. Let's take a condensed look at the structure of what is generated.

```txt
README.md
├── docs
├── openziti_edge_client
│   ├── api/
│   ├── api_client.py
│   ├── apis/
│   ├── configuration.py
│   ├── exceptions.py
│   ├── model/
│   ├── models/
│   └── rest.py
└── test
```

The `docs` folder contains a bunch of markdown files that document usage for each API endpoint and model generated in the library. The `README.md` file is essentially a `TOC` which links to these files, and additionally provides a synopsis of using the library.

The `models` and `apis` packages are there for convenience. Importing either will import all `api` or `model` modules respectively.

```python
import openziti_edge_client.apis   # all api modules
import openziti_edge_client.models # all model modules
```

By now, you may be wondering what we mean by `api` and `model` - they are the meat and potatoes of the translated spec.

The `api` package contains Python modules that map the OpenAPI resource `paths` into Python `classes`. The generator creates a class `method` for each HTTP request method associated with the OpenAPI spec for that `path`. The spec's `tags` field determines the generated set of `classes` the Python generator creates. A path specifying multiple `tags` in the spec results in the same `path` being available in multiple `api` modules.

The `model` package contains modules for each of the OpenAPI `definitions`. Each model module contains a Python `class` which maps a `definition`'s `properties` to the Python class attributes. Requests that contain a payload through an `api` module take a `model` instance pertaining to that `api` request as defined in the spec. Responses through the `api` modules return an instance of the module class pertaining to the defined response definitions in the spec. In other words, `models` are the things exchanged through the `api` modules. Because a model maps OpenAPI definition properties and instance attributes, accessing the response payload is a matter of accessing the resulting model's instance attributes.

Finally, if requests made against an `api` with the `api_client.py` result in an error, the library throws one of the exceptions defined in the `exceptions.py` module. The `configuration.py` contains a `Configuration` class to hold state regarding things like the `api_client` credentials, or the `logger` configuration. We'll show an example below that does this, and we take a closer look at the `api` and `model` modules.

For now, let's grab the OpenZiti Edge Client spec so we can inspect a few `paths`, `definitions`, and `securityDefinitions`.

```bash
curl -O https://raw.githubusercontent.com/openziti/edge-api/main/client.yml
```

We'll use `yq` to filter the spec YAML. I'll strip the `examples` throughout here to keep the output a little more concise.

## Let's Get Started:

Let's look at a subset of the generated documentation and map it to back to the spec.

| Class | Method | HTTP request | Description |
| --- | --- | --- | --- |
| *ServiceApi* | **list\_services** | **GET** /services | List services |

Here, we see we have a generated `ServiceApi` class. That class has a `list_services` method, which performs a `GET` request against the `/services` path in our API.

Let's briefly take a look at that path in our spec:

```bash
yq --yaml-output '.paths."/services"' client.yml
```

```yaml
get:
  security:
    - ztSession: []
  description: 'Retrieves a list of config resources; supports filtering, sorting,
    and pagination. Requires admin access.'
  tags:
    - Service
  summary: List services
  operationId: listServices
  parameters:
    - type: integer
      name: limit
      in: query
    - type: integer
      name: offset
      in: query
    - type: string
      name: filter
      in: query
    - type: array
      items:
        type: string
      collectionFormat: multi
      name: roleFilter
      in: query
    - type: string
      name: roleSemantic
      in: query
  responses:
    '200':
      description: A list of services
      schema:
        $ref: '#/definitions/listServicesEnvelope'
    '400':
      description: The supplied request contains invalid fields or could not be parsed
        (json and non-json bodies). The error's code, message, and cause fields can
        be inspected for further information
      schema:
        $ref: '#/definitions/apiErrorEnvelope'
    '401':
      description: The currently supplied session does not have the correct access
        rights to request this resource
      schema:
        $ref: '#/definitions/apiErrorEnvelope'
```

Notice a few of the keys in the spec and how they map to the generated documentation:

* `tags` =&gt; defines the Python class the requests methods will be generated in =&gt; `ServicesApi`
    
* `path` =&gt; the endpoint the request will operate against =&gt; `/services`
    
* `get` -&gt; defines the HTTP request method when executing the method =&gt; `GET`
    
* `operationId` -&gt; defines the method name that will perform the request =&gt; `list_services()`
    
* `parameters` -&gt; become the available function parameters in the generated method =&gt; `list_services(limit=my_limit, offset=my_offset, ...)`
    

Additionally, the `responses` describe a number of `schemas` that shall be returned by the API for each of the possible HTTP status codes. These are `models` in the generated Python library. When a request is made successfully (status code == `200`), the return value of the `list_services()` method will be an instance of the `ListServicesEnvelope` model class. For any other status code, implying an error has occurred, the method will instead return an instance of the `ApiErrorEnvelope` model class.

You'll also notice the `security` section on this path. This endpoint requires the `ztSession` security definition:

```bash
yq --yaml-output '.securityDefinitions' client.yml
```

```yaml
ztSession:
  description: An API Key that is provided post authentication
  type: apiKey
  name: zt-session
  in: header
```

Here, we see that requests to this endpoint must include a header named `zt-session` containing an API key.

## Using the Generated API Client:

OpenZiti Edge clients can authenticate using either the `password` or `cert` method. In practice, most OpenZiti clients will create a session with the controller by performing an mTLS handshake, reading a client `credentials.json` file after JWT enrollment. We'll add these credentials to our `api_client`'s `configuration`.

Once we authenticate, we'll gather the `zt-session` token out of the response and add it to our client `configuration` so that it is used in subsequent requests. We can then finally make a request with our `ServicesApi` class using the `list_services()` method, which will return a `ListServicesEnvelope` model to grant us access to our service information. OpenZiti [services](https://docs.openziti.io/docs/learn/core-concepts/services/overview) are container types that encapsulate information needed by OpenZiti clients to operate on the network.

```python
import json
import tempfile

import openziti_edge_client
from openziti_edge_client.api import authentication_api, service_api
from openziti_edge_client.model.authenticate import Authenticate

# NOTE: we omit some error handling here, to keep things clear

with open("./credentials.json", 'r', encoding='UTF-8') as id_f:
    id_json = json.load(id_f)

# The generated library expects the CA, client cert and key to be files
# so we'll split our `credentials.json` file contents here
ca_fp = tempfile.NamedTemporaryFile(buffering=0)
cert_fp = tempfile.NamedTemporaryFile(buffering=0)
key_fp = tempfile.NamedTemporaryFile(buffering=0)

ca_fp.write(id_json['id']['ca'].encode('UTF-8'))
cert_fp.write(id_json['id']['cert'].encode('UTF-8'))
key_fp.write(id_json['id']['key'].encode('UTF-8'))

# We instantiate a Configuration class to store the
# Edge Client API endpoint and client certificates
configuration = openziti_edge_client.Configuration(
    host=id_json['ztAPI'] + "/edge/client/v1",
    ssl_ca_cert=ca_fp.name
)

configuration.cert_file = cert_fp.name
configuration.key_file = key_fp.name

# We pass the configuration to the constructor of the `ApiClient`,
# which will read the stored state of the configuration class
with openziti_edge_client.ApiClient(configuration) as api_client:
    
    # We'll use this api_client as a context manager to make requests
    # against the Edge API and set the authentication method
    api_auth = authentication_api.AuthenticationApi(api_client)
    method = "cert"
  
    # The /authenticate endpoint requires an `Authenticate` model
    auth = Authenticate()

    # Session here will be an instance of the
    # CurrentApiSessionDetailEnvelope  model class
    session = api_auth.authenticate(method, auth=auth)

    # We can descend down the nested definitions to get our
    # final return value.
    configuration.api_key['ztSession'] = session.data.token
    
    # Finally, we can make a request to GET /services
    api_service = service_api.ServiceApi(api_client)
    services = api_service.list_services()
```

That's it! We authenticated to our API, gathered our `zt-session` token, and ran our first request to `ServiceApi.list_services()`. All other requests using the generated client follow a similar pattern. While not shown here, requests for HTTP resource types that contain a body (often a `POST`, `PUT`, etc.) will require you to create a model class instance with all required properties and attach it to your request via arguments to the relevant class methods.

A noteworthy aspect of the resulting `session` and `services` objects above is they are OpenAPI models whose schemas reference other schemas in the spec. When we descend down the instance attributes like `session.data.token`, we are actually traversing the attributes of 3 schema definitions. Similarly, the `services` object is a `ListServicesEnvelope` model class instance as prescribed in the spec, which is composed of other definitions. This relationship between the `api` classes and the `model` classes is key in the behavior of the Python client.

## A closer look at the response:

Let's recursively show the definitions defined in the `ListServicesEnvelope`, and see how we can access the list of services. Remember, each of these definitions becomes a model class in our generated client.

```bash
yq --yaml-output '.definitions.listServicesEnvelope' client.yml
```

```yaml
type: object
required:
  - meta
  - data
properties:
  data:
    $ref: '#/definitions/serviceList'
  meta:
    $ref: '#/definitions/meta'
```

Here, we see that the envelope itself is a JSON object with two properties: meta and data. The `data` property is itself a `serviceList` with an `array` type.

```bash
yq --yaml-output '.definitions.serviceList' client.yml
```

```yaml
type: array
items:
  $ref: '#/definitions/serviceDetail'
```

Each item in this array is a `serviceDetail`. These are the actual `service` objects stored in the OpenZiti database that the API client making this request has access to. If we want to inspect some properties of the services, we must do so through the `ServiceDetail` model nested in the result.

```bash
yq --yaml-output '.definitions.serviceDetail' client.yml
```

```yaml
type: object
allOf:
  - $ref: '#/definitions/baseEntity'
  - type: object
    required:
      - name
      - terminatorStrategy
      - roleAttributes
      - permissions
      - configs
      - config
      - encryptionRequired
      - postureQueries
    properties:
      config:
        description: map of config data for this service keyed by the config type
          name. Only configs of the types requested will be returned.
        type: object
        additionalProperties:
          type: object
          additionalProperties:
            type: object
      configs:
        type: array
        items:
          type: string
      encryptionRequired:
        description: Describes whether connections must support end-to-end encryption
          on both sides of the connection. Read-only property, set at create.
        type: boolean
      name:
        type: string
      permissions:
        $ref: '#/definitions/dialBindArray'
      postureQueries:
        type: array
        items:
          $ref: '#/definitions/postureQueries'
      roleAttributes:
        $ref: '#/definitions/attributes'
      terminatorStrategy:
        type: string
```

Continuing from our example above, we can traverse down to these services to inspect the properties described in the `ServiceDetail` above for each service in our `ServiceList`:

```python
    # ... continued from above ...
    services = api_service.list_services()
    
    # ListServicesEnvelope->ServiceList->ServiceDetail
    for service in services.data.value:
        print(f"Model: {type(service)}")
        print(f"Service Name: {service.name}")
        print(f"Service: {service}")
      
        # ServiceDetail->DialBindArray->DialBind
        for permission in service.permissions.value:
            print(f"Permissions: {permission}")
```

Finally, we've arrived at our actual services and can access the response JSON through the model's instance attributes.

We hope this guide has helped you get started using OpenAPI-generated Python clients. Currently, we host generated Python clients for our Edge Management and Client APIs in the [openziti-test-kitchen](https://github.com/openziti-test-kitchen) GitHub project.
