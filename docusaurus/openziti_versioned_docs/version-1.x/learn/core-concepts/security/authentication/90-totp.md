---
sidebar_position: 90
---

# MFA TOTP

OpenZiti authentication allows for n-factors of authentication - meaning that it is possible to support 1FA, 2FA, ...nFA
authentication. One common setup for multi-factor authentication (MFA) is time-based one time passwords (TOTP).
TOTP is commonly seen in "authenticator" applications (e.g. Google Authenticator, Authy, Microsoft Authenticator, etc).
All "authenticator" applications support the same core [TOTP RFC 6238](https://www.rfc-editor.org/rfc/rfc6238)
specification.

## Enforcement

OpenZiti allows individual clients to enroll or un-enroll from MFA TOTP. Administrators can enforce TOTP enrollment
through [Authentication Policies](50-authentication-policies.md) and
[Posture Checks](../authorization/posture-checks/00-overview.md).

### Authentication Policies

When enforced at authentication via an [Authentication Policy](50-authentication-policies.md), clients are unable to
transition from [partially authenticated to fully
authenticated](../sessions.md#full-vs-partial-authentication)
without enrolling in MFA TOTP - leaving them unable to list services or connect to them.

### MFA Posture Check

When enforced through the
[MFA Posture Check](../authorization/posture-checks/00-overview.md), clients still must
become fully authenticated according to their [Authentication Policy](50-authentication-policies.md), however, access
to services is determined by their policy and posture check access. If a service is granted only through a service
policy that has an MFA posture check, they will not be able to connect to that service without enrolling in MFA TOTP.

## Submitting TOTP during Authentication

When TOTP is required during authentication, how the code is submitted depends on the authentication system in use:

- **OIDC Authentication** - see [OIDC Authentication - TOTP](10-oidc.md#totp-time-based-one-time-password)
- **Legacy Authentication** - see [Legacy Authentication - TOTP](./20-legacy-auth.md#totp)

## Enrollment

Enrollment associates a TOTP secret with an [Identity](80-identities.md). The controller generates a secret and
20 single-use recovery codes. Recovery codes can be used in place of a TOTP code during authentication and are
consumed when used.

Enrollment can be performed at different points depending on the authentication system in use:

- **During an OIDC authentication flow** - if the [Authentication Policy](50-authentication-policies.md) requires TOTP
  but the [Identity](80-identities.md) is not yet enrolled, enrollment can be completed mid-flow before the
  authorization code is issued. See
  [OIDC Authentication - TOTP Enrollment](10-oidc.md#totp-enrollment-during-an-oidc-flow) for the OIDC-specific
  endpoints and flow.
- **Before or during legacy authentication** - enrollment can be started and completed while partially authenticated
  during a legacy auth session (see
  [Legacy Authentication - Partial Authentication](./20-legacy-auth.md#partial-authentication)).
  It can also be performed any time after becoming fully authenticated.
- **Any time when fully authenticated** - available to both OIDC and legacy authenticated clients via the
  [Edge Client API](/api/edge-client) endpoints below.

### Enrollment status

Enrollment status can be checked by the client at any time when fully authenticated, or while enrollment is in progress
during a legacy partial-auth session:

`GET /edge/client/v1/current-identity/mfa`

```text
<empty body>
```

If enrolled:
```json
{
  "isVerified": true
}
```

If enrollment is in progress (started but not yet verified):
```json
{
  "isVerified": false,
  "recoveryCodes": ["code1", "..."],
  "provisioningUrl": "otpauth://totp/<identity-name>?issuer=ziti.dev&secret=<secret>"
}
```

If enrollment has not been started:
`HTTP 404 Not Found`

Fields:

- `isVerified` - true/false status for enrollment. If `true` only this value is returned. If `false` the current
  enrollment information is provided
- `recoveryCodes` - an array of 20 single-use recovery codes that may be used in place of a TOTP code during
  Authentication. Each code is consumed when used and is then invalid. Only shown while enrollment has not been
  completed.
- `provisioningUrl` - an `otpauth` url used by authenticator applications, normally shown as a QR code

### Start Enrollment

Enrollment is started by the client. This endpoint is available when fully authenticated and also during a legacy
partial-auth session (when the [Authentication Policy](50-authentication-policies.md) requires TOTP but the
[Identity](80-identities.md) has not yet enrolled):

`POST /edge/client/v1/current-identity/mfa`

```json
{}
```

The response contains a provisioning URL, QR code URL, and 20 single-use recovery codes.

### Verify and complete Enrollment

Enrollment is completed by verifying the secret has been received by providing a currently valid TOTP code. Recovery
codes are not treated as a valid value here. A live TOTP code is required.

`POST /edge/client/v1/current-identity/mfa/verify`

```json
{
  "code": "<totp-code>"
}
```

### Restart Enrollment

If enrollment has been started but not completed, the in-progress enrollment must be cancelled before starting a new
one. To cancel an in-progress enrollment:

`DELETE /edge/client/v1/current-identity/mfa`

```json
{
  "code": ""
}
```

A new enrollment can then be started with `POST /edge/client/v1/current-identity/mfa`.

### QR code

To aid in enrollment, the current enrollment's `provisioningUrl` may be retrieved as a QR code. As long as an
outstanding MFA TOTP enrollment is active an image is available at:

`GET /edge/client/v1/current-identity/mfa/qr-code`

### Removing or unenrolling

MFA TOTP can be removed by an administrator at any time on behalf of a client. Clients may remove MFA TOTP enrollment
from their account as long as they have access to a recovery code or TOTP code.

#### Client removal

`DELETE /edge/client/v1/current-identity/mfa`

```json
{
  "code": "<totp-or-recovery-code>"
}
```

#### Administrative removal

`DELETE /edge/management/v1/identities/<id>/mfa`

```text
<empty body>
```

### Viewing recovery codes

At any time the current valid list of recovery codes may be viewed by the client by issuing the following request:

`GET /edge/client/v1/current-identity/mfa/recovery-codes`

```json
{
  "code": "<totp-or-recovery-code>"
}
```

### Regenerating recovery codes

At any time the current valid list of recovery codes may be replaced by the client by issuing the following request:

`POST /edge/client/v1/current-identity/mfa/recovery-codes`

```json
{
  "code": "<totp-or-recovery-code>"
}
```
