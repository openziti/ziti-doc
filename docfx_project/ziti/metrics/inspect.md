# Overview
The Ziti controller supports pulling metrics on demand via the `inspections` framework. 

The inspections framework is part of the fabric API, hosted by the controller. The fabric API binding will need to be enabled in the controller configuration file for this to work.


## Web API
Metrics are pulled by submitting a POST request to `https://controller:port/fabric/v1/inspections`.

### Required Headers:
|header|value|
-------|-----------
|Content-Type|Always `application/json`|
|zt-session|Ziti session id. The id is created by logging into the ziti controller|

### Request Body:
The request body is a json document with two fields:
* **appRegex:** Which components to pull metrics from.  .\* pulls everything,  other options include:
  * **ctrl_client:** Just the controller
  * **Router Id:** Just a single router
* **requestedValues:** An array of things to request.  The value will anways start with `metrics` for metrics requests.
  * **metrics:json:** Request metrics in Json format

### Example
Here is an example using curl

```
curl -k -H "zt-session:36dc1b1d-0d95-42d1-814c-0b74fcf9a9cb" -H "Content-Type: application/json" -X POST -d '{"appRegex":".*","requestedValues":["metrics:json"]}' https://localhost:1280/fabric/v1/inspections
```

## Ziti Command Line
The Ziti fabric CLI has support for the inspect command built in.  Here's an example:

```
ziti fabric inspect '.*' metrics:json
```

Let's break that command down a bit:
* **ziti fabric inspect:** The base fabric inspect command.
* **.\*:** The network components to inspect.  .\* inspects everything,  other options include:
  * **ctrl_client:** Just the controller
  * **Router Id:** Just a single router
* **metrics:json:** Get metrics in json format.  Other formats include:
  * **prometheus:** Get metrics in the Prometheus [text exposition format] (https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format).

**Tip:** The default CLI result will strip json markup.  Add `-j` to the inspect command to get the raw json output.

[!include[](./metric-types.md)]

