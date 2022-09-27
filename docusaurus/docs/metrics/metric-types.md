# Types of Metrics Reported
Ziti is instrumenting more code and adding additional metrics all of the time. This section will describe the different types of metrics that ziti reports, not individual metric names.

## intValue/floatValue
A gauge of a single value.  The value is the current metric value, and can go up and down over time

## Histogram
Standard histogram with:
* min
* max
* mean
* stdev
* variance
* percentiles
  * p50
  * p75
  * p95
  * p99
  * p999
  * p9999

## Timer
Timer metric with:
* count
* m1_rate
* m5_rate
* m15_rate
* min
* max
* mean
* std_dev
* variance
* percentiles
  * p50
  * p75
  * p95
  * p99
  * p999
  * p9999
