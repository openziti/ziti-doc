---
uid: zitiSecurityPostureChecks
---
# Posture Checks

Posture Checks represent environmental state (posture) that an endpoint must be in, in order for a Service Policy to 
grant access to a service as either a client or host. Posture Checks are defined separately from Service Policies and 
assigned to them via attributes on the Posture Checks and attribute selectors on the Service Policy. This allows Posture
Checks to be re-used.

# Posture Data

Environmental state is saved as Posture Data - a set of values describing environmental state. Posture Data is provided 
to the controller via Posture Response sent from the client. Posture Responses are constructed from Posture Queries 
which are reported to the client per service from the controller.

[![](https://mermaid.ink/img/pako:eNptkMtuAjEMRX9l5BWo8ANZsJl210XVkdgQFunkto2aBzgOEkL8e4PIICTwypLPsa98ojFZkKKMfUEc8erMD5ugY1er9w5RlqvVS5-icPIerLp3l2UAH9yIPJs38jav9PLqqW6znbiHfY3oGUZQwY-UpTA-kXcp5ifCXYChfAUns0fpeZg7c228s_VgE6f0U9GCAjgYZ-tHTpeZJvlFgCZVW2v4T5OO58qV3WXPm3WSmNS38RkLMkXScIwjKeGCCWovbdT5H_eEfjA)](https://mermaid.live/edit#pako:eNptkMtuAjEMRX9l5BWo8ANZsJl210XVkdgQFunkto2aBzgOEkL8e4PIICTwypLPsa98ojFZkKKMfUEc8erMD5ugY1er9w5RlqvVS5-icPIerLp3l2UAH9yIPJs38jav9PLqqW6znbiHfY3oGUZQwY-UpTA-kXcp5ifCXYChfAUns0fpeZg7c228s_VgE6f0U9GCAjgYZ-tHTpeZJvlFgCZVW2v4T5OO58qV3WXPm3WSmNS38RkLMkXScIwjKeGCCWovbdT5H_eEfjA)

# Evaluation

Posture Checks are event based and are evaluated as events are encountered. Once evaluated failure states begin
to restrict access as Service Policies being to fail their associated Posture Checks. One exception to this
is the [MFA Posture Check](#mfa) which has grace periods for some scenarios.

# Access

A single Service may be granted to a client through multiple Service Policies. Only one of those policies needs to be
in a passing state for access to be granted. For example creating two Service Policies, one with Posture Checks and
one without, to the same service and client will result in the client always having access. This is because one
Service Policy lacking Posture Checks will always result as passing.

# Associating

Posture Checks are associated to [Service Policies](policies/overview.md) through 
[Roles and Role Attributes](policies/overview.md#roles-and-role-attributes). Attributes on each Posture Check created
will be selected for on Service Policies via the `postureCheckRoles` as an array of selected roles. Service Policies are
associated to Identities in the same fashion via `identityRoles` and the attributes on Identities.



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

` ziti edge create posture-check os windows-and-android -o "WINDOWS:>10.0.0,ANDROID:>6.0.0" -a check-attribute1`

#### Edge Management API

`POST /edge/management/v1/posture-checks`
```json
{
  "typeId": "OS",
  "name": "windows-and-android",
  "operatingSystems": [
    {
      "type": "WINDOWS",
      "versions": [">10.0.0"]
      
    },
    {
      "type": "ANDROID",
      "versions": [">6.0.0"]
    }
  ],
  "attributes": ["check-attribute1"]
}
```

## MAC Address

The `MAC` Posture Check type is used to verify a client's network interface cards MAC addresses. MAC Addresses
that are not specified will fail the check.

### Creating

#### Ziti CLI

`ziti edge create posture-check mac mac-lsit =m "14-B2-2C-E5-F0-61" -m "D5-22-E8-B7-FF-48" -m "..."  -a check-attribute1`

#### Edge Management API

`POST /edge/management/v1/posture-checks`
```json
{
  "typeId": "MAC",
  "name": "mac-list",
  "macAddresses": ["14-B2-2C-E5-F0-61", "D5-22-E8-B7-FF-48", "..."],
  "attributes": ["check-attribute1"]
}
```

## MFA

The `MFA` Posture Check type is used to enforce [MFA TOTP](../authentication/totp.md) configuration on a client. Posture
Checks enforce access authorization. For authentication enforcement, see 
[Authentication Policies](../authentication/authentication-policies.md#secondary).

### Creating

MFA Posture Checks also support forcing a client to re-submit a valid TOTP on timeout, after locking/unlocking a
device, or waking a device from sleep.

Timeouts are set through the `timeoutSeconds` property. Where values `0` and `-1` represent no timeout.

Forcing submission on lock/unlock is set through `promptOnUnlock` as `true` or `false`. After an unlock event the client
is given a five-minute grace period before the posture check begins to fail.

Forcing submission on wake is set through `promptOnWake` as `true` or `false`. After a wake event the client
is given a five-minute grace period before the posture check begins to fail.

#### Ziti CLI

`ziti edge create posture-check mfa my-mfa-check -s 3600 -w -u -a check-attribute1`

#### Edge Management API

`POST /edge/management/v1/posture-checks`
```json
{
  "typeId": "MFA",
  "timeoutSeconds": 3600,
  "promptOnWake": false,
  "promptOnUnlock": false,
  "attributes": ["check-attribute1"]
}
```

## Multi Process

The `MULTI_PROCESS` Posture Check is used to verify that one or more programs are running on the client. It can 
optionally check sha256 hash as well as digital signers on Window.

### Creating

Multi Process Posture Checks allow multiple processes to be defined which either all of must be running or one of must
be running. The `semantic` of the check determines how the processes are evaluated. `AllOf` requires that all
processes define in the check must be running. `OneOf` requires only one of the processes to be valid.

All processes are checked to be running from the binary provided in the `path` setting.

Valid sha256 hashes of a binary may be provided in the `hashes`.

If the file is digital signed (Windows only) the `signerFingerprints` may be provided. Signer fingerprints are the 
sha1 fingerprints (thumbprints) of valid signing certificates.

#### Ziti CLI

`ziti edge create posture-check process-multi my-proc-multi AnyOf "Windows,Linux", "C:\\program1.exe,/usr/local/program1" -a check-attribute1`

#### Edge Management API

`POST /edge/management/v1/posture-checks`
```json
{
  "typeId": "PROCESS_MULTI",
  "name": "my-proc-multi",
  "semantic": "OneOf",
  "processes": [
    {
      "os": "WINDOWS",
      "path": "C:\\program1.exe",
      "hashes": ["421c76d77563afa1914846b010bd164f395bd34c2102e5e99e0cb9cf173c1d87"],
      "signerFingerprints": ["79437f5edda13f9c0669b978dd7a9066dd2059f1"]
    },
    {
      "os": "LINUX",
      "path": "/usr/local/program1",
      "hashes": ["b16d66911a4657945bf1929bc1a9d743168b819d9b19d1519eb29ffb3db140a4"],
      "signerFingerprints": ["882106ca75dc47a5ffd055e640b30c2e01789521"]
    }
  ],
  "attributes": ["check-attribute1"]
}
```

## Windows Domain

The `DOMAIN` Posture CHeck is used to verify that a Windows client has joined a specific Windows Domain.

### Creating

#### Ziti CLI

`ziti edge create posture-check domain domain-list -d domain1 -d "domain2"  -a check-attribute1`

#### Edge Management API

`POST /edge/management/v1/posture-checks`
```json
{
  "typeId": "DOMAIN",
  "name": "domain-list",
  "macAddresses": ["domain1", "domain2"],
  "attributes": ["check-attribute1"]
}
```

# Viewing Identity Posture Data

For troubleshooting purposes it is possible to view an identity's current Posture Data.

#### Request
`GET /edge/management/v1/identities/<id>/posture-data`
```
<empty body>
```

#### Response
```json
{
  "data": {
    "apiSessionPostureData": {},
    "domain": {
      "lastUpdatedAt": "2022-08-03T11:03:29.451Z",
      "postureCheckId": "-GIxFATMg",
      "timedOut": false,
      "domain": "MYDOMAIN"
    },
    "mac": {
      "lastUpdatedAt": null,
      "postureCheckId": "",
      "timedOut": false,
      "addresses": null
    },
    "os": {
      "lastUpdatedAt": "2022-08-03T11:03:29.375Z",
      "postureCheckId": "OZimG0oGR",
      "timedOut": false,
      "build": null,
      "type": "windows",
      "version": "10.0.19044"
    },
    "processes": [
      {
        "lastUpdatedAt": "2022-08-03T11:03:49.803Z",
        "postureCheckId": "62yttIAeJ",
        "timedOut": false,
        "signerFingerprints": []
      },
      {
        "lastUpdatedAt": "2022-08-03T11:03:49.986Z",
        "postureCheckId": "Gh5DOegtE",
        "timedOut": false,
        "signerFingerprints": []
      }
    ]
  },
  "meta": {}
}
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
{
  "meta": {},
  "data": [
    {
      "apiSessionId": "ckytwv9811tqz15mzoyfi1uvb",
      "policyFailures": [
        {
          "policyId": "Nk43EwJKE",
          "policyName": "TestPolicy1",
          "checks": [
            {
              "actualValue": {
                "passedMfa": false,
                "passedOnUnlock": false
              },
              "expectedValue": {
                "passedMfa": true,
                "passedOnWake": true
              },
              "postureCheckId": "5Ucbw.tjo0",
              "postureCheckName": "TestCheck1",
              "postureCheckType": "MFA"
            }
          ]
        }
      ],
      "serviceId": "iGoRLhrx0",
      "serviceName": "TestService1",
      "sessionType": "Dial",
      "when": "2022-01-25T10:18:45.257Z"
    }
  ]
}
```