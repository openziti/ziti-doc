# Types of Metrics Reported
Ziti is instrumenting more code and adding additional metrics all of the time. This section will describe the different types of metrics that ziti reports, not individual metric names.

## intValue/floatValue
A gauge of a single value.  The value is the current metric value, and can go up and down over time

## Histogram
  Histogram metrics utilize the Go metrics module, and are set to a 128 sample exponentially decaying bucket with a alpha value of .015.  This is important to understand, especially in reference to minimum and maximum values.  The bucket is sample bound, not time bound.  In practice this means one will often see a maximum or minimum value that carries on for several time samples; this is expected behavior.  The histogram implementation allows for extremely fast and memory efficient data collection.  As some of the metrics are multiplied by multiple levels of cardinality, it is critical to maintaining the operations of the software.
  
  An exponentially decaying histogram means that as the samples age across the 128 sample window, they are weighted less than the newer samples.  This makes functions, such as the mean, which is often used, able to respond more quickly to changes than a straight sliding window.  An alpha value of .015 means that the sample weights range from 1 (the newest sample) to approximately .93.  This means that when calculating the mean, the oldest sample in the window is weighted to 93%, reducing its contribution to the function.

  A simple weighting exercise:
    Given 3 samples, 10, 5, and 5, how does the weighting and order affect the mean function?
   | Sample	| Weight | Weighted Value |
   |--------|-------------|----------------|
   | 10 | 1.0 |	10.0 |
   | 5	| .95	| 4.75 |
   | 5	| .90	| 4.5 |
   | Sum	| 2.85 | 19.25 |
   | Mean	| 19.25/2.85 | 6.75 |

   | Sample	| Weight | Weighted Value |
   |--------|-------------|----------------|
   | 5 | 1.0 | 5.0 |
   | 5 | .95 | 4.75 |
   | 10 | .90 | 9.0 |
   | Sum | 2.85 | 18.75 |
   | Mean | 18.75/2.85 | 6.58 |

		


Standard histograms provide:
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

It is important to note the sample size (128) means the more specific percentiles will use the same actual values, and may be repetetive.

## Meter
Meters are used for rate measurements, how much of something happened per unit time.  The samples are exponentially decayed, similar to the histogram, however the values are bound to specific time intervals, such as 1, 5, and 15 minutes.  They can also provide similar statistical values to histograms

Meter metric with:
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

## Timer
Timers provide statistical samples of timed events. 

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

## Gauge
Gauges present a point in time measurement of a metric.  For example, the number of open database transactions at a given moment.