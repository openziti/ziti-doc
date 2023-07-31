# Overview

Ziti can report system metrics in a few different ways

* Scraping metrics using the [Prometheus](https://www.prometheus.io/) format
* Writing to a file
* On demand report

No metrics are reported by default.  

## Prometheus Endpoint

The network controller can expose a `/metrics` endpoint that returns metrics for the whole network in the prometheus format.  See [Prometheus](./40-prometheus.md) for more information.

## File Reporter

The network controller can write metrics to a text file at a configurable rate.  The controller writes metrics for the whole network.  See [File](./20-file.mdx) for more information.

## On Demand

The inspect facility built into the Ziti Fabric CLI can retrieve metrics from some or all network components on demand. The metrics can be displayed in plain text or json format.  See [Inspect](./30-inspect.md) for more information 
