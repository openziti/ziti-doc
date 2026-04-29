# Sequence Diagram 

OpenZiti systems provide a wide range of metrics for the monitoring of the network services, endpoints, and processes.  Some of the various metrics are visualized below to understand where they fall and what they measure in a network instance.  The bulk of the remaining metrics are measuring processes within the control plane, rather than network operation.

```mermaid
sequenceDiagram
title Metrics

participant Initiating SDK
participant Edge Router 1
participant Network Controller
participant Edge Router 2
participant Terminating SDK




Initiating SDK ->>Edge Router 1 : ingress rx


Edge Router 2 ->>Terminating SDK :egress tx

note over Initiating SDK, Edge Router 1 : ingress.rx.bytesrate<br>ingress.rx.msgrate<br>ingress.rx.msgsize <br>
note over Terminating SDK, Edge Router 2 : ingress.tx.bytesrate<br>ingress.tx.msgrate<br>ingress.tx.msgsize <br>

Edge Router 1 ->> Initiating SDK: ingress tx
Terminating SDK ->>Edge Router 2 : egress rx

note over Terminating SDK, Edge Router 2 : egress.rx.bytesrate<br>egress.rx.msgrate<br>egress.rx.msgsize <br>
note over Initiating SDK, Edge Router 1 : egress.tx.bytesrate<br>egress.tx.msgrate<br>egress.tx.msgsize <br>
par 
    Network Controller ->>Edge Router 1 : 
and 
    Edge Router 1 ->>Network Controller : Control Channel (ctrl)
end
par 
    Network Controller ->>Edge Router 2 : 
and 
    Edge Router 2 ->>Network Controller : Control Channel (ctrl)
end


note over Edge Router 1, Network Controller : ctrl.latency<br>ctrl.queue_time<br>ctrl.rx.bytesrate<br>ctrl.rx.msgrate<br>ctrl.rx.msgsize<br>ctrl.tx.bytesrate<br>ctrl.tx.msgrate<br>ctrl.tx.msgsize


Edge Router 2 ->>Edge Router 1 : 
Edge Router 1 ->>Edge Router 2 : link

note over Edge Router 1, Edge Router 2 :link.latency<br>link.queue_time<br>link.rx.bytesrate<br>link.rx.msgrate<br>link.rx.msgsize<br>link.tx.bytesrate<br>link.tx.msgrate<br>link.tx.msgsize
```
