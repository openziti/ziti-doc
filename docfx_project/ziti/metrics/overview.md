# Ziti Metrics

Ziti can report system metrics in a few different ways
* Scraping metrics [Prometheus] (https://www.prometheus.io/)
* Writing to a file
* On demand report

No metrics are reported by default.  

## Prometheus
The network controller can expose a `/metrics` endpoint that returns metrics for the whole network in the prometheus format.  See [Prometheus] (./prometheus.md) for more information.

## File
The network controller can write metrics to text file at a configurable rate.  The controller writes metrics for the whole network.  See [File] (./file.md) for more information.

## On Demand
The inspect factility built into the Ziti Fabric CLI can retrieve metrics from some or all network components on demand. The metrics can be displayed in plain text or json format.  See [Inspect] (./inspect.md) for more information 
