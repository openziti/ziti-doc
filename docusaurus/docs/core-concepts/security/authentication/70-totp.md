# MFA TOTP

Ziti authentication allows for n-factors of authentication - meaning that it is possible to support 1FA, 2FA, ...nFA
authentication. One common setup for multi-factor authentication (MFA) is time-based one time passwords (TOTP).
TOTP is commonly see in "authenticator" application (e.g. Google Authenticator, Authy, Microsoft Authenticator, etc).
All "authenticator" applications support the same core [TOTP RFC 6238](https://www.rfc-editor.org/rfc/rfc6238) 
specification.

## Enforcement

Ziti allows individual clients to enroll or un-enroll from MFA TOTP. Administrators can enforce TOTP enrollment through
[Authentication Policies](./authentication-policies) and [Posture Checks](../authorization/posture-checks#mfa).

### Authentication Policies
When enforced at authentication via [Authentication Policies](./authentication-policies), clients are unable to 
transition from [partially authenticated to fully authenticated](./auth#full-vs-partial-authentication) 
without enrolling in MFA TOTP - leaving them unable to list services or connect to them. 

### MFA Posture Check
When enforced through the [MFA Posture Check](../authorization/posture-checks#mfa), clients still must become fully 
authenticated according to their authentication policy, however, access to services is determined by their policy and 
posture check access. If a service is granted only through a service policy that has an MFA posture check, they will 
not be able to connect to that service without enrolling in MFA TOTP.

## Enrollment

High level flow:

- A client initiates enrollment via `POST /edge/client/v1/current-identity/mfa`
- The controller returns recovery codes and a TOTP secret
- A client uses the TOTP secret to generate a TOTP code
- A client submits the TOTP code via `POST /edge/client/v1/current-identity/mfa/verify`
- The controller saves the MFA TOTP configuration, subsequent authentication attempts will require an MFA TOTP code

### Enrollment Status

Enrollment status can be checked by the client themselves through the following requests:

#### Request: 
`GET /edge/client/v1/current-identity/mfa`
```
<empty body>
```

#### Responses:
If enrolled:
`HTTP 200 ok`
```json
{
  "isVerified": true
}
```

If enrollment started:
`HTTP 200 ok`
```json
{
  "isVerified": true,
  "recoveryCodes": ["code1", "..."],
  "provisioningUrl": "otpauth://totp/<identity-name>?issuer=ziti.dev&secret=<secret>"
}
```

If enrollment has not been started:
`HTTP 404 Not Found`

Fields:

- `isVerified` - true/false status for enrollment. If `true` only this value is returned. If `false` the current enrollment information is provided
- `recoveryCodes` - an array of one-time use recovery codes that may be used in place of a TOTP code during authentication, only shown while enrollment has not been completed
- `provisioningUrl` - an `otpauth` url used by authenticator applications, normally shown as a QR code


### Restart Enrollment

If enrollment has been started but not completed a `DELETE /edge/client/v1/current-identity/mfa` should be used to
abandon the unfinished enrollment and a new enrollment started.

### Start Enrollment

Enrollment may be started by performing a `POST /edge/client/v1/current-identity/mfa` with `{}` as the body.

### Verify & Complete Enrollment

Enrolment is completed by verifying the secret has been received by providing a currently valid TOTP code. A recovery
codes are not treated as a valid value.

`POST /edge/client/v1/current-identity/mfa/verify`
```json
{
  "code": "<totp-code>"
}
```

### QR Code

To aid in enrollment, the current enrollment's `provisioningUrl` may be retrieved as a QR code. As long as an outstanding
MFA TOTP enrollment is active an image is available at: `GET /edge/client/v1/current-identity/mfa/qr-code`

### Removing/Unenrolling

MFA TOTP can be removed by an administrator at any time on behalf of a client. Clients may remove MFA TOTP enrollment
from their account as long as they have access to a recovery code or TOPT code.

#### Client Removal
`DELETE /edge/client/v1/current-identity/mfa`
```json
{
  "code": "<totp-or-recovery-code>"
}
```

#### Administrative Removal
`DELETE /edge/management/v1/identities/<id>/mfa`
```
<empty body>>
```

### Viewing Recovery Codes
At any time the current valid list of recovery codes may be viewed by the client by issuing the following request:

`GET /edge/client/v1/current-identity/mfa/recovery-codes`
```json
{
  "code": "<totp-or-recovery-code>"
}
```

### Regenerating Recovery Codes

At any time the current valid list of recovery codes may be replaced by the client by issuing the following request:


`POST /edge/client/v1/current-identity/mfa/recovery-codes`
```json
{
  "code": "<totp-or-recovery-code>"
}
```