- `enrollToCertEnabled` - Allows clients with valid JWTs to request a certificate from the controller by providing a
  [Certificate Signing Request (CSR)](https://en.wikipedia.org/wiki/Certificate_signing_request). The resulting certificate will be used for authentication. The target `enrollAuthPolicyId` must be set
  to a policy that allows certificate authentication. If `enrollAuthPolicyId` is not set, the default policy
  will be used and must allow certificate authentication.
- `enrollToTokenEnabled`- Allows clients with valid JWTs to continue to use JWTs for authentication. The target
  policy must be set to a policy that allows External JWT Signer authentication. If `enrollAuthPolicyId` is not
  set, the default policy will be used and must allow External JWT Signer authentication.


Additionally, there are optional values that can be used to control which claims within the JWT are significant:

- `enrollAttributeClaimsSelector` - a root level property name (e.g. `claims`) or a JSON pointer (e.g. `/claims`) that
  points to a string or array of strings that will be used to populate the `attributes` field of the enrolling
  identity. Defaults to no value set and identities will enroll without attributes.
- `enrollAuthPolicyId` - the id of the authentication policy to use for the enrolling identity. Defaults to no value set
  and the identity will enroll with the default authentication policy.
- `enrollNameClaimsSelector` - the root level property name (e.g. `claims`) or a JSON pointer (e.g. `/claims`) that
  points to a string that will be used to populate the `name` field of the enrolling identity.
  Defaults to the subject property of the JWT (e.g. `/sub`)