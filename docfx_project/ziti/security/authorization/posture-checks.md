---
uid: zitiSecurityPostureChecks
---

Posture Checks represent enironmental state (posture) that an endpoint must be in, in order for a Service Policy to grant access
to a service as either a client or host. Posture Checks are defined separately from Service Policies and assigned
to them via attributes on the Posture Checks and attribute selectors on the Service Policy. This allows Posture Checks
to flexibly be re-used.

The following Posture Check types are currently defined:

- OS / OS Version - requires a specific operating system and optionally a specific version or versions
- MAC Address - requires the client has a specific MAC address associated with its hardware
- MFA - requires the client currently has MFA TOTP enabled
- Multi Process - requires a client be running one or more applications
- Windows Domain - requires the client be a member of a specific domain


## OS/ OS Version

## MAC Address

## MFA

## Multi Process

## Windows Domain