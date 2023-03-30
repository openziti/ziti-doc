# Metrics 

OpenZiti systems provide a wide range of metrics for the monitoring of the network services, endpoints, and processes.  Some of the various metrics are visualized below to understand where they fall and what they measure in a network instance.  The bulk of the remaining metrics are measuring processes within the control plane, rather than network operation.

[![](https://mermaid.ink/img/pako:eNqdlcFP5CAUxv-VF05rMjuJc2w2c1EPZuMedI8kBtvnSKSPkb66zhr_d6FjR6BUo-2JDz4--D1ankVtGxSV6PChR6rxVKuNU60k1mwQLpCdrjtJkrbKsa71VhHDOWnWijVt4Or0d9p31mwQLm3P6OA47fqD_M-6ezixxM4ag27eukq7_qJrNUWR45suBX6u18kCoALf5bDrwD3tHUlKMGRzQ4V7Aw8GsoxgH_3gNGoBM0FL97S82TF2TjH-unHrSG-7TVnt9H-EIMeB2cLSxFWUyDOJXEzkPDFlchyYZJt9pxig5MAy6GFlGDP_wo6wjBBLBPFTgJ9VDMv4sEQPZ-D5UwqSwD_T4106jpIUNW-OCfbCFNXYgJM7RYQGftTszJEkpOZr8asP4lffi0_Lm-xnAcXpgntpPFSqd4Hg0PY_nx6vWbd4kPIjMIpRSSIpFOQgccnKU-t7LWf-DNPaTSqW8zWa7j-EkhnC-BjH0E5xDFKOYxSjPUXSiGOQuGTlqTXGIRai9d-q0o2_HJ7DcZGC77BFKTwG0eCt6g1LIenFD1U926sd1aJi1-NC9NvGT_x2l4jqVpnuoJ41mq07iDg0L_a30HAZvbwCsdRbfQ?type=png)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNqdlcFP5CAUxv-VF05rMjuJc2w2c1EPZuMedI8kBtvnSKSPkb66zhr_d6FjR6BUo-2JDz4--D1ankVtGxSV6PChR6rxVKuNU60k1mwQLpCdrjtJkrbKsa71VhHDOWnWijVt4Or0d9p31mwQLm3P6OA47fqD_M-6ezixxM4ag27eukq7_qJrNUWR45suBX6u18kCoALf5bDrwD3tHUlKMGRzQ4V7Aw8GsoxgH_3gNGoBM0FL97S82TF2TjH-unHrSG-7TVnt9H-EIMeB2cLSxFWUyDOJXEzkPDFlchyYZJt9pxig5MAy6GFlGDP_wo6wjBBLBPFTgJ9VDMv4sEQPZ-D5UwqSwD_T4106jpIUNW-OCfbCFNXYgJM7RYQGftTszJEkpOZr8asP4lffi0_Lm-xnAcXpgntpPFSqd4Hg0PY_nx6vWbd4kPIjMIpRSSIpFOQgccnKU-t7LWf-DNPaTSqW8zWa7j-EkhnC-BjH0E5xDFKOYxSjPUXSiGOQuGTlqTXGIRai9d-q0o2_HJ7DcZGC77BFKTwG0eCt6g1LIenFD1U926sd1aJi1-NC9NvGT_x2l4jqVpnuoJ41mq07iDg0L_a30HAZvbwCsdRbfQ)

## Available Metrics

Metrics are reported to the log files, locale in /var/log/ziti by default.  There are 2 primary log files for metrics, utilization-metrics.log and utilization-usage.log.  These logs may be shipped to various reporting systems for easier visibility and monitoring.

| Metric | Type | Source | Description|
|------------------------|-----------|------------|-----------------------------------------------------------------------------------------------------|
|api-session.create | Histogram | controller | Time to create api sessions|
|api.session.enforcer.run | Timer | controller | How long it takes the api session policy enforcer to run|
|bolt.open_read_txs | Gauge | controller | Current number of open bbolt read transactions|
|ctrl.latency | Histogram | controller | Per control channel latency|
|ctrl.queue_time | Histogram | controller | Per control channel queue time (between send and write to wire)|
|ctrl.rx.bytesrate | Meter | controller | Per control channel receive data rate|
|ctrl.rx.msgrate | Meter | controller | Per control channel receive message rate|
|ctrl.rx.msgsize | Histogram | controller | Per control channel receive message size distribution|
|ctrl.tx.bytesrate | Meter | controller | Per control channel send data rate|
|ctrl.tx.msgrate | Meter | controller | Per control channel send message rate|
|ctrl.tx.msgsize | Histogram | controller | Per control channel send messsage size distribution|
|edge.invalid_api_tokens | Meter | router | Number of invalid api session token encountered|
|edge.invalid_api_tokens_during_sync | Meter | router | Number of invalid api session token encountered while a sync is in progress|
|egress.rx.bytesrate | Meter | router | Data rate of data received via xgress, originating from terminators. Per router.|
|egress.rx.msgrate | Meter | router | Message rate of data received via xgress, originating from terminators. Per router.|
|egress.rx.msgsize | Histogram | router | Message size distribution of data received via xgress, originating from terminators. Per router.|
|egress.tx.bytesrate | Meter | router | Data rate of data sent via xgress originating from terminators. Per router.|
|egress.tx.msgrate | Meter | router | Message rate of data sent via xgress originating from terminators. Per router.|
|egress.tx.msgsize | Histogram | router | Message size distribution of data sent via xgress, originating from terminators. Per router.|
|eventual.events | Gauge | controller | Number of background events pending processing|
|fabric.rx.bytesrate | Meter | router | Data rate of data received from fabric links|
|fabric.rx.msgrate | Meter | router | Message rate of data received from fabric links|
|fabric.rx.msgsize | Histogram | router | Message size distribution of data received from fabric links|
|fabric.tx.bytesrate | Meter | router | Data rate of data sent on fabric links|
|fabric.tx.msgrate | Meter | router | Message rate of data sent on fabric links|
|fabric.tx.msgsize | Histogram | router | Message size distribution of data sent on fabric links|
|identity.refresh | Meter | controller | How often an identity is marked, indicating that they need a full refresh of their service list|
|identity.update-sdk-info | Histogram | controller | Time to update identity sdk info|
|ingress.rx.bytesrate | Meter | router | Data rate of data received via xgress, originating from initiators. Per router.|
|ingress.rx.msgrate | Meter | router | Message rate of data received via xgress, originating from initiators. Per router.|
|ingress.rx.msgsize | Histogram | router | Message size distribution of data received via xgress, originating from initiators. Per router.|
|ingress.tx.bytesrate | Meter | router | Data rate of data sent via xgress originating from initiators. Per router.|
|ingress.tx.msgrate | Meter | router | Message rate of data sent via xgress originating from initiators. Per router.|
|ingress.tx.msgsize | Histogram | router | Message size distribution of data sent via xgress, originating from initiators. Per router.|
|link.latency | Histogram | controller | Per link latency in nanoseconds|
|link.queue_time | Histogram | controller | Per link queue time (between send and write to wire)|
|link.rx.bytesrate | Meter | controller | Per link receive data rate|
|link.rx.msgrate | Meter | controller | Per link receive message rate|
|link.rx.msgsize | Histogram | controller | Per link receive message size distribution|
|link.tx.bytesrate | Meter | controller | Per link send data rate|
|link.tx.msgrate | Meter | controller | Per link send message rate|
|link.tx.msgsize | Histogram | controller | Per link send messsage size distribution|
|service.policy.enforcer.run | Timer | controller | How long it takes the service policy enforcer to run|
|service.policy.enforcer.run.deletes | Meter | controller | How many sessions are deleted by the service policy enforcer|
|services.list | Histogram | controller | Time to list services|
|session.create | Histogram | controller | Time to create a session|
|xgress.ack_duplicates | Meter | router | Number of duplicate acks received. Indicates over-eager retransmission|
|xgress.ack_failures | Meter | router | Number of failures sending acks|
|xgress.acks.queue_size | Gauge | router | Number of acks queued to send|
|xgress.blocked_by_local_window | Gauge | router | Number of xgress instances blocked because the windowing threshold has been exceeded locally|
|xgress.blocked_by_remote_window | Gauge | router | Number of xgress instances blocked because the windowing threshold has been exceeded remotely|
|xgress.dropped_payloads | Meter | router | Number of payloads dropped because the xgress receiver side couldn't keep up|
|xgress.retransmission_failures | Meter | router | Number of retransmission send failures|
|xgress.retransmissions | Meter | router | Number of payloads retransmitted|
|xgress.retransmits.queue_size | Gauge | router | Number of payloads queued for retransmission|
|xgress.rx.acks | Meter | router | Number of acks received|
|xgress.tx.acks | Meter | router | Number of acks sent|
|xgress.tx_unacked_payload_bytes | Gauge | router | Total payload data size that has been buffered but not acked yet|
|xgress.tx_unacked_payloads | Gauge | router | Number of payload messages that have been buffered but not yet acked|
|xgress.tx_write_time | Timer | router | Time to write payloads to the xgress receiver|