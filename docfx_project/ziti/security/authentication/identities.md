
# Identities

Ziti Edge defines a top level entity called an Identity. An Identity is a security principal that can bind (host) or
dial (connect) to services over a Ziti Network. An Identity may be a human who uses one or more devices, a device
itself, a single account on a multi-user device, an application, or a set of applications. What determines what an
Identity is only limited by the intent of its use, its security configuration, and where/how it stores its credentials.

If an Identity represents a human that is using an SSO provider that ties into Ziti Edge's
[External JWT Signers](external-jwt-signers.md) the human operator can move from device to device using whichever Ziti
enabled applications that allow them to authenticate. If the Identity can only authenticate via a x509 Client
Certificate where the private key is stored in a hardware back keystore on a device, such that the key can not be moved,
the identity is tied to that hardware. Further if the Identity's credentials are stored in an OS-backed user specific
storage mechanism (e.g. Windows Credential Manager) it is that accounts Identity.


## Identity ER Diagram

Below is a diagram that show the high-level relationships between an Identity and various important entities and within
a Ziti Network. This diagram does not show all entities, simply the ones tied closest to an Identity. For example,
the Role Attributes on an Identity are used by selectors defined on policies to act on the identity. However, the 
policies and selectors are not modeled here.

[![](https://mermaid.ink/img/pako:eNqVkcFuwjAMhl8l8pnwALlVwCQO06rBMZfQuBCtTabEOVQN746rFa3bBNJ8sv98jn_ZIzTBIijAuHXmHE2vveDYW_TkaBClrNdhFFW9lwdMyQUvlLiY9IUt5Zn8FyU3GMm1rjGE6VlLKaIOiXJEuTVklugPq8xVmS6Twn9OE-rQuWZ42MBe7rV8Dx3Kiii6U_7l588-voeE-ITb-Ri6rmfxIVTE60slj2_HWm6Cb915QU6hvfawgh5jb5zlU43TmwY20KMGxak18UOD9lfm8qflZe6sY2OgWtMlXIHJFA6Db0BRzHiH5ovP1PUG3vuwIw)](https://mermaid.live/edit#pako:eNqVkcFuwjAMhl8l8pnwALlVwCQO06rBMZfQuBCtTabEOVQN746rFa3bBNJ8sv98jn_ZIzTBIijAuHXmHE2vveDYW_TkaBClrNdhFFW9lwdMyQUvlLiY9IUt5Zn8FyU3GMm1rjGE6VlLKaIOiXJEuTVklugPq8xVmS6Twn9OE-rQuWZ42MBe7rV8Dx3Kiii6U_7l588-voeE-ITb-Ri6rmfxIVTE60slj2_HWm6Cb915QU6hvfawgh5jb5zlU43TmwY20KMGxak18UOD9lfm8qflZe6sY2OgWtMlXIHJFA6Db0BRzHiH5ovP1PUG3vuwIw)

```mermaid
erDiagram
    Identity ||..o{ API-Session : has
    API-Session ||..o{ Session : has
    API-Session ||..o{ Session-Certificates : has
    API-Session ||..|| Posture-Data : has
    Identity ||..|| Authentication-Policy : has
    Identity ||..o{ Identity-Role-Attributes : has
    Identity ||..o{ Authenticator: has
    Identity ||..o{ Enrollment: has
    Identity ||..o| MFA-TOTP-Config: has
        

erDiagram
    Identity ||..o{ API-Session : has
    API-Session ||..o{ Session : has
    API-Session ||..o{ Session-Certificates : has
    API-Session ||..|| Posture-Data : has
    Identity ||..|| Authentication-Policy : has
    Identity ||..o{ Identity-Role-Attributes : has
    Identity ||..o{ Authenticator: has
    Identity ||..o{ Enrollment: has
    Identity ||..o| MFA-TOTP-Config: has
```

## Deleting

Deleting an Identity removes all directly associated data. This includes:

- API Sessions
  - Sessions
  - Posture Data
  - Session Certificates
- Identity Role Attributes
- Authenticators
- Enrollments
- MFA TOTP Config

It does not remove entities are that re-usable between Identities:

- Authentication Policies
- Service Policies
- Edge Router Policies

Deleting an Identity immediately removes it and all current and future access it would have to a Ziti Network and its
Services.