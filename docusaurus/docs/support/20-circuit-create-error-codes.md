---
hide_table_of_contents: true
---
# Circuit create error codes

The most fundamental action of a working OpenZiti instance is the dialing of services to create connections and pass data.  This action crosses a few borders, but the central process is the creation of a fabric circuit to carry the traffic between the initiating edge node (SDK embedded application, client, tunneler, etc.) and the terminating edge node.  When this process fails, it is important to understand why it failed, to properly troubleshoot the issue.  Below is a table of the various cause codes emitted by the controller, and a brief description of the context of the error.


| Circuit Create Error / Failure Cause | Description                                                                                                                                                                                                                                                                                                   |
| Error code (`failure_cause`) | Go constant | Description |
|---|---|---|
| `INVALID_SERVICE` | `CircuitFailureInvalidService` | The requested service id is not found in the controller's configuration database, typically due to recent changes or client sync failures. |
| `ID_GENERATION_ERR` | `CircuitFailureIdGenerationError` | The circuit identity generation function failed to produce a circuit identity string. |
| `NO_TERMINATORS` | `CircuitFailureNoTerminators` | The service has no terminators, usually indicating a hosting device lost network connectivity due to process, network, or power issues. |
| `NO_ONLINE_TERMINATORS` | `CircuitFailureNoOnlineTerminators` | The service has terminators, but all of them are hosted on routers that are currently offline. |
| `NO_PATH` | `CircuitFailureNoPath` | No calculable path exists between the initiating router and the terminating router. |
| `PATH_MISSING_LINK` | `CircuitFailurePathMissingLink` | No valid set of links creates a complete path from initiator to terminator, caused by link/router failures or restrictive routing/link policies. |
| `INVALID_STRATEGY` | `CircuitFailureInvalidStrategy` | The service references an undefined or unrecognized routing (xt) strategy. |
| `STRATEGY_ERR` | `CircuitFailureStrategyError` | The routing strategy returned an unexpected error while selecting a terminator. |
| `ROUTER_RESPONSE_TIMEOUT`  | `CircuitFailureRouterResponseTimeout` | The controller sent route messages to the routers along the calculated path but did not receive success/failure responses from all of them before the route timeout elapsed. Indicates a slow, overloaded, or unresponsive router, or a control-channel connectivity problem between controller and router. |
| `ROUTER_ERR_GENERIC` | `CircuitFailureRouterErrGeneric` | Unspecified route/dial failure reported by a router; the router's error did not match any of the more specific classifications below. |
| `ROUTER_ERR_INVALID_TERMINATOR` | `CircuitFailureRouterErrInvalidTerminator` | The terminating router reported the terminator as invalid (edge/tunnel bindings). Usually a state mismatch between the controller's terminator record and the hosting SDK connection; the controller deletes the stale terminator record when this occurs. |
| `ROUTER_ERR_MISCONFIGURED_TERMINATOR` | `CircuitFailureRouterErrMisconfiguredTerminator` | The terminator's address/binding data is malformed or otherwise unusable by the router (for example, the router could not create a dialer/binding for it). |
| `ROUTER_ERR_DIAL_TIMED_OUT` | `CircuitFailureRouterErrDialTimedOut` | The terminating router timed out while dialing from the terminating host to the service's backing socket/address. |
| `ROUTER_ERR_CONN_REFUSED` | `CircuitFailureRouterErrDialConnRefused` | The terminating router received a TCP reset (connection refused) when dialing from the terminating host to the service's backing socket. |
| `ROUTER_ERR_REJECTED_BY_APPLICATION`  | `CircuitFailureRouterErrRejectedByApp` | The hosting application (SDK-hosted service) actively rejected the inbound dial/connection request. |
| `ROUTER_ERR_DNS_RESOLUTION_FAILED`  | `CircuitFailureRouterErrDnsResolutionFailed` | The terminating router could not resolve the DNS name of the service's backing host when dialing the terminator (for example "no such host" or "server misbehaving"). |
| `ROUTER_ERR_PORT_NOT_ALLOWED`  | `CircuitFailureRouterErrPortNotAllowed` | The terminating router refused to dial the terminator because the destination port falls outside the allowed port ranges configured for that binding. |
| `ROUTER_ERR_INVALID_LINK_DESTINATION`  | `CircuitFailureRouterErrInvalidLinkDest` | An intermediate router could not install the forwarding route because the link destination specified in the route is invalid/unknown to that router. |
| `ROUTER_ERR_RESOURCES_NOT_AVAILABLE`  | `CircuitFailureRouterErrResourcesNotAvailable` | The terminating router ran out of local system resources while dialing (for example `EMFILE`/`ENFILE`/`ENOBUFS` — too many open files or exhausted socket buffers), indicating the router host is under file-descriptor or socket-buffer pressure. |

