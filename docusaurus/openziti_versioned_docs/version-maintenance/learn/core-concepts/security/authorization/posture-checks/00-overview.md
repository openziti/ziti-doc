---
uid: zitiSecurityPostureChecks
---

# Posture Checks

Posture Checks represent environmental state (posture) that an endpoint must be in for a
[Service Policy](../policies/overview.mdx) to grant access to a service as either a client or host. They allow
administrators to enforce that connecting devices meet specific requirements, such as running a particular operating
system version, having certain applications running, or belonging to a Windows domain, before and during access.

Posture Checks are defined independently from Service Policies and associated with them via role attributes. This
allows the same Posture Check to be reused across multiple Service Policies.

## Goals

The Posture Check system provides continuous, device-aware access control:

- **Device posture enforcement**: Restrict service access to devices that meet defined criteria at the time of
  connection and throughout the life of the connection.
- **Continuous evaluation**: Access is revoked as soon as a device leaves a valid posture state. Verification is
  not limited to connection establishment.
- **Separation of concerns**: Posture Checks are defined and managed independently from service access policies,
  enabling reuse and flexible composition across many policies.

## Two Posture Check systems

OpenZiti supports two posture check enforcement models, selected automatically based on the type of API Session in use:

|                                  | [Legacy Posture Checks](10-legacy-posture.md)        | [OIDC Posture Checks](20-oidc-posture.md)                  |
|----------------------------------|----------------------------------------------------|-----------------------------------------------------------|
| **Session type**                 | Legacy (`zt-session` token)                        | OIDC (JWT bearer token)                                   |
| **Posture data submitted to**    | Controller via REST API                            | Each connected edge router via SDK connection             |
| **Evaluated by**                 | Controller                                         | Edge router                                               |
| **Check definitions distributed**| Controller-only                                    | Controller → edge routers via Router Data Model           |
| **Enforcement point**            | Controller (on session create and continuously)    | Edge router (on dial/bind and continuously)               |

Both systems support the same Posture Check types and use the same configuration workflow through the controller (or
controllers in an HA deployment).

## Posture Data {#posture-data}

Environmental state is captured as **Posture Data**, a set of values describing the current state of the client
device. The SDK collects this data and submits it as **Posture Responses**. The controller informs the client which
checks are required per service via **Posture Queries** returned when listing services.

Where Posture Responses are submitted depends on the session type:

- **Legacy sessions**: Posture Responses are submitted to the controller via REST API. The controller stores and
  evaluates the data.
- **OIDC sessions**: Posture Responses are submitted directly to each connected edge router via the SDK connection.
  Each router evaluates the data locally using Posture Check definitions synced from the controller.

## Types

The following Posture Check types are supported by both systems:

- **OS / OS Version** - requires a specific operating system and optionally a specific version or versions
- **MAC Address** - requires the client has a specific MAC address associated with its hardware
- **MFA** - requires the client currently has MFA TOTP enabled
- **Multi Process** - requires a client be running one or more applications
- **Windows Domain** - requires the client be a member of a specific domain

Posture Check definitions are created and managed through the Edge Management API or CLI regardless of which
enforcement system is in use. See the [Legacy](10-legacy-posture.md#types) or [OIDC](20-oidc-posture.md#types) pages
for type details and creation examples.

## Associating with Service Policies

Posture Checks are associated to [Service Policies](../policies/overview.mdx) through
[Roles and Role Attributes](../policies/overview.mdx#roles-and-role-attributes). Each Posture Check has a set of
role attributes. Service Policies select Posture Checks using `postureCheckRoles` with the same `#attribute` and
`@name` syntax used for Identities and services.

## Access

A single service may be granted to a client through multiple Service Policies. Only one of those policies needs to
be in a passing state for access to be granted. For example, creating two Service Policies, one with Posture Checks
and one without, for the same service and client will result in the client always having access, because the policy
without Posture Checks will always pass.

## Evaluation

Posture Checks are evaluated as events are encountered rather than on a fixed polling interval. Once a failure state
is detected, access restrictions begin immediately as the Service Policy fails its associated Posture Checks. The
MFA Posture Check (see [Legacy](10-legacy-posture.md#mfa) / [OIDC](20-oidc-posture.md#mfa)) is one exception. It
defines grace periods for lock/unlock and wake events before the check begins to fail.
