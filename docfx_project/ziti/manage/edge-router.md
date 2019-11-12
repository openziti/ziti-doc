# Edge Router

The Edge Router is the entry point for Ziti-based clients. It is responsible for authenticating incoming connections by
verifying the connecting client has a valid network session.  It then is able to route traffic to whatever the
destination is for that given traffic. In simple deployments - a single edge router might be deployed as is the case
with the [Ziti Edge - Developer Edition]()




and
is notified by the Edge Controller of new network sessions for identities.
