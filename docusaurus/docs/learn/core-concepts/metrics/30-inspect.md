# On Demand

The Ziti Controller supports pulling metrics on demand via the `inspections` framework. 

The inspections framework is part of the fabric API, hosted by the controller. The fabric API binding will need to be enabled in the controller configuration file for this to work.

## Ziti Command Line

The Ziti fabric CLI has support for the inspect command built in.  Here's an example:

```bash
ziti fabric inspect '.*' metrics:json
```

Let's break that command down a bit:

* **ziti fabric inspect:** The base fabric inspect command.
* **.\*:** The network components to inspect.  .\* inspects everything,  other options include:
  * **ctrl_client:** Just the controller
  * **Router Id:** Just a single router
* **metrics:json:** Get metrics in json format.  Other formats include:
  * **prometheus:** Get metrics in the Prometheus [text exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format).

:::tip
The default CLI result will strip json markup.  Add `-j` to the inspect command to get the raw json output.
:::
