---
uid: zitiSecurityPostureChecks
---
# Posture Checks

Posture Checks represent environmental state (posture) that an endpoint must be in, in order for a Service Policy to 
grant access to a service as either a client or host. Posture Checks are defined separately from Service Policies and 
assigned to them via attributes on the Posture Checks and attribute selectors on the Service Policy. This allows Posture
Checks to be re-used.

Environmental state is saved as [Posture Data](#posture-data). Posture Data is provided to the controller via 
[Posture Response](#posture-queries--responses) sent from the client. Posture Responses are constructed from 
[Posture Queries](#posture-queries--responses) which are reported to the client per service from the controller.

[![](https://mermaid.ink/img/pako:eNptkMtuAjEMRX9l5BWo8ANZsJl210XVkdgQFunkto2aBzgOEkL8e4PIICTwypLPsa98ojFZkKKMfUEc8erMD5ugY1er9w5RlqvVS5-icPIerLp3l2UAH9yIPJs38jav9PLqqW6znbiHfY3oGUZQwY-UpTA-kXcp5ifCXYChfAUns0fpeZg7c228s_VgE6f0U9GCAjgYZ-tHTpeZJvlFgCZVW2v4T5OO58qV3WXPm3WSmNS38RkLMkXScIwjKeGCCWovbdT5H_eEfjA)](https://mermaid.live/edit#pako:eNptkMtuAjEMRX9l5BWo8ANZsJl210XVkdgQFunkto2aBzgOEkL8e4PIICTwypLPsa98ojFZkKKMfUEc8erMD5ugY1er9w5RlqvVS5-icPIerLp3l2UAH9yIPJs38jav9PLqqW6znbiHfY3oGUZQwY-UpTA-kXcp5ifCXYChfAUns0fpeZg7c228s_VgE6f0U9GCAjgYZ-tHTpeZJvlFgCZVW2v4T5OO58qV3WXPm3WSmNS38RkLMkXScIwjKeGCCWovbdT5H_eEfjA)

A single service may be granted to a client through multiple Service Policies. Only one of those policies needs to be
in a passing state for access to be granted. For example creating two service policies, one with posture checks and
one without, both to the same service and client will cause posture check state to not matter as one of the service
policies will always be passing with no posture checks.

# Types
The following Posture Check types are currently defined:

- [OS / OS Version](#os-os-version) - requires a specific operating system and optionally a specific version or versions
- [MAC Address](#mac-address) - requires the client has a specific MAC address associated with its hardware
- [MFA](#mfa) - requires the client currently has MFA TOTP enabled
- [Multi Process](#multi-process) - requires a client be running one or more applications
- [Windows Domain](#windows-domain) - requires the client be a member of a specific domain

## OS/ OS Version

The `OS` Posture Check type is used to verify a client's operating system and optionally version

Supported OS Types
- Windows
- Windows Server
- Linux
- MaxOc
- iOS
- Android

Versions may be validated with any valid [Semver 2.0](https://semver.org/) statement. This includes the ability to
specify ranges by major, minor, and patch levels. Operating systems that do not have an explicit patch level, their
build number will be used instead.

### Semver Examples

- `>=1.2.7 <1.3.0` would match the versions 1.2.7, 1.2.8, and 1.2.99, but not the versions 1.2.6, 1.3.0, or 1.1.0
- `>=1.2.7` would match the versions 1.2.7, 1.2.8, 2.5.3, and 1.3.9, but not the versions 1.2.6 or 1.1.0
- `1.2.7 || >=1.2.9 <2.0.0` would match the versions 1.2.7, 1.2.9, and 1.4.6, but not the versions 1.2.8 or 2.0.0

### Creating

#### Ziti CLI

#### Edge Management API


## MAC Address

The `MAC` Posture Check type is used to verify a client's network interface cards MAC addresses.

### Creating

#### Ziti CLI

#### Edge Management API

## MFA

The `MFA` Posture Check type is used to enforce [MFA TOTP](../authentication/totp.md) configuration on a client. Posture
Checks enforce access authorization. For authentication enforcement, see 
[Authentication Policies](../authentication/authentication-policies.md#secondary).

### Creating

#### Ziti CLI

#### Edge Management API

## Multi Process

The `MULTI_PROCESS` Posture Check is used to verify that one or more programs are running on the client. It can 
optionally check sha256 hash as well as digital signers on Window.

### Creating

#### Ziti CLI

#### Edge Management API

## Windows Domain

The `DOMAIN` Posture CHeck is used to verify that a Windows client has joined a specific Windows Domain.

### Creating

#### Ziti CLI

#### Edge Management API

# Viewing Identity Posture Data

For troubleshooting purposes it is possible to view an identity's current Posture Data.

#### Request
`GET /edge/management/v1/identities/<id>/posture-data`
```
<empty body>
```

#### Response
```json

```

# Viewing Failed Service Requests

For troubleshooting purposes it is possible to view the last fifty failed service requests due to Posture Check failure.

#### Request
`GET /edge/management/v1/identities/<id>/failed-service-requests`
```
<empty body>
```

#### Response
```json

```