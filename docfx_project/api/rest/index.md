
# Ziti controlller REST API

The API version and Swagger definition for a particular controller may be fetched.

## Examples

### Find the controller version

`GET /`

<!-- there might be a way to transclude this YAML hunk instead of pasting it in-line, and then we could offer a download of the raw file too -->

```json
{
    "data": {
        "apiVersions": {
            "edge": {
                "v1": {
                    "path": "/edge/v1"
                }
            }
        },
        "buildDate": "2021-04-23 18:09:47",
        "revision": "fe826ed2ec0c",
        "runtimeVersion": "go1.16.3",
        "version": "v0.19.12"
    },
    "meta": {}
}
```

### Download the Swagger definition

You may wish to import the definition in Postman to create a collection of requests or generate boilerplate client code for your preferred programming language.

`GET /edge/v1/specs/swagger/spec`

```yaml
# v0.19.12 Swagger definition
basePath: /edge/v1
consumes:
    - application/json
definitions:
    CurrentApiSessionServiceUpdateList:
        properties:
            lastChangeAt:
                format: date-time
                type: string
        required:
            - lastChangeAt
        type: object
    PostureCheckCreate:
        discriminator: typeId
        properties:
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
            typeId:
                $ref: '#/definitions/postureCheckType'
        required:
            - name
            - typeId
        type: object
    PostureCheckDetail:
        discriminator: typeId
        properties:
            _links:
                $ref: '#/definitions/links'
            createdAt:
                format: date-time
                type: string
            id:
                type: string
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
            typeId:
                type: string
            updatedAt:
                format: date-time
                type: string
            version:
                type: integer
        required:
            - name
            - typeId
            - version
            - roleAttributes
            - id
            - createdAt
            - updatedAt
            - _links
            - tags
        type: object
    PostureCheckDomainCreate:
        allOf:
            - $ref: '#/definitions/PostureCheckCreate'
            - properties:
                domains:
                    items:
                        type: string
                    minItems: 1
                    type: array
              required:
                - domains
              type: object
        x-class: DOMAIN
    PostureCheckDomainDetail:
        allOf:
            - $ref: '#/definitions/PostureCheckDetail'
            - properties:
                domains:
                    items:
                        type: string
                    minItems: 1
                    type: array
              required:
                - domains
              type: object
        x-class: DOMAIN
    PostureCheckDomainPatch:
        allOf:
            - $ref: '#/definitions/PostureCheckPatch'
            - properties:
                domains:
                    items:
                        type: string
                    minItems: 1
                    type: array
              type: object
        x-class: DOMAIN
    PostureCheckDomainUpdate:
        allOf:
            - $ref: '#/definitions/PostureCheckUpdate'
            - properties:
                domains:
                    items:
                        type: string
                    minItems: 1
                    type: array
              required:
                - domains
              type: object
        x-class: DOMAIN
    PostureCheckMacAddressCreate:
        allOf:
            - $ref: '#/definitions/PostureCheckCreate'
            - properties:
                macAddresses:
                    items:
                        type: string
                    minItems: 1
                    type: array
              required:
                - macAddresses
              type: object
        x-class: MAC
    PostureCheckMacAddressDetail:
        allOf:
            - $ref: '#/definitions/PostureCheckDetail'
            - properties:
                macAddresses:
                    items:
                        type: string
                    minItems: 1
                    type: array
              required:
                - macAddresses
              type: object
        x-class: MAC
    PostureCheckMacAddressPatch:
        allOf:
            - $ref: '#/definitions/PostureCheckPatch'
            - properties:
                macAddresses:
                    items:
                        type: string
                    minItems: 1
                    type: array
              type: object
        x-class: MAC
    PostureCheckMacAddressUpdate:
        allOf:
            - $ref: '#/definitions/PostureCheckUpdate'
            - properties:
                macAddresses:
                    items:
                        type: string
                    minItems: 1
                    type: array
              required:
                - macAddresses
              type: object
        x-class: MAC
    PostureCheckMfaCreate:
        allOf:
            - $ref: '#/definitions/PostureCheckCreate'
        x-class: MFA
    PostureCheckMfaDetail:
        allOf:
            - $ref: '#/definitions/PostureCheckDetail'
        x-class: MFA
    PostureCheckMfaPatch:
        allOf:
            - $ref: '#/definitions/PostureCheckPatch'
        x-class: MFA
    PostureCheckMfaUpdate:
        allOf:
            - $ref: '#/definitions/PostureCheckUpdate'
        x-class: MFA
    PostureCheckOperatingSystemCreate:
        allOf:
            - $ref: '#/definitions/PostureCheckCreate'
            - properties:
                operatingSystems:
                    items:
                        $ref: '#/definitions/operatingSystem'
                    minItems: 1
                    type: array
              required:
                - operatingSystems
              type: object
        x-class: OS
    PostureCheckOperatingSystemDetail:
        allOf:
            - $ref: '#/definitions/PostureCheckDetail'
            - properties:
                operatingSystems:
                    items:
                        $ref: '#/definitions/operatingSystem'
                    type: array
              required:
                - operatingSystems
              type: object
        x-class: OS
    PostureCheckOperatingSystemPatch:
        allOf:
            - $ref: '#/definitions/PostureCheckPatch'
            - properties:
                operatingSystems:
                    items:
                        $ref: '#/definitions/operatingSystem'
                    minItems: 1
                    type: array
              type: object
        x-class: OS
    PostureCheckOperatingSystemUpdate:
        allOf:
            - $ref: '#/definitions/PostureCheckUpdate'
            - properties:
                operatingSystems:
                    items:
                        $ref: '#/definitions/operatingSystem'
                    minItems: 1
                    type: array
              required:
                - operatingSystems
              type: object
        x-class: OS
    PostureCheckPatch:
        discriminator: typeId
        properties:
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
        type: object
    PostureCheckProcessCreate:
        allOf:
            - $ref: '#/definitions/PostureCheckCreate'
            - properties:
                process:
                    $ref: '#/definitions/process'
              required:
                - process
              type: object
        x-class: PROCESS
    PostureCheckProcessDetail:
        allOf:
            - $ref: '#/definitions/PostureCheckDetail'
            - properties:
                process:
                    $ref: '#/definitions/process'
              required:
                - process
              type: object
        x-class: PROCESS
    PostureCheckProcessPatch:
        allOf:
            - $ref: '#/definitions/PostureCheckPatch'
            - properties:
                process:
                    $ref: '#/definitions/process'
              type: object
        x-class: PROCESS
    PostureCheckProcessUpdate:
        allOf:
            - $ref: '#/definitions/PostureCheckUpdate'
            - properties:
                process:
                    $ref: '#/definitions/process'
              required:
                - process
              type: object
        x-class: PROCESS
    PostureCheckTypeDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                name:
                    type: string
                operatingSystems:
                    items:
                        $ref: '#/definitions/operatingSystem'
                    type: array
                version:
                    type: string
              required:
                - name
                - operatingSystems
                - version
              type: object
    PostureCheckTypeList:
        items:
            $ref: '#/definitions/PostureCheckTypeDetail'
        type: array
    PostureCheckUpdate:
        discriminator: typeId
        properties:
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
            typeId:
                $ref: '#/definitions/postureCheckType'
        required:
            - name
        type: object
    PostureResponseCreate:
        discriminator: typeId
        properties:
            id:
                type: string
            typeId:
                $ref: '#/definitions/postureCheckType'
        required:
            - id
            - typeId
        type: object
    PostureResponseDomainCreate:
        allOf:
            - $ref: '#/definitions/PostureResponseCreate'
            - properties:
                domain:
                    type: string
              required:
                - domain
              type: object
        x-class: DOMAIN
    PostureResponseMacAddressCreate:
        allOf:
            - $ref: '#/definitions/PostureResponseCreate'
            - properties:
                macAddresses:
                    items:
                        type: string
                    type: array
              required:
                - macAddresses
              type: object
        x-class: MAC
    PostureResponseOperatingSystemCreate:
        allOf:
            - $ref: '#/definitions/PostureResponseCreate'
            - properties:
                build:
                    type: string
                type:
                    type: string
                version:
                    type: string
              required:
                - type
                - version
              type: object
        x-class: OS
    PostureResponseProcessCreate:
        allOf:
            - $ref: '#/definitions/PostureResponseCreate'
            - properties:
                hash:
                    type: string
                isRunning:
                    type: boolean
                signerFingerprints:
                    items:
                        type: string
                    type: array
              required:
                - process
              type: object
        x-class: PROCESS
    apiError:
        properties:
            args:
                $ref: '#/definitions/apiErrorArgs'
            cause:
                $ref: '#/definitions/apiErrorCause'
            causeMessage:
                type: string
            code:
                type: string
            data:
                additionalProperties: true
                type: object
            message:
                type: string
            requestId:
                type: string
        type: object
    apiErrorArgs:
        properties:
            urlVars:
                additionalProperties:
                    type: string
                type: object
        type: object
    apiErrorCause:
        allOf:
            - $ref: '#/definitions/apiFieldError'
            - $ref: '#/definitions/apiError'
    apiErrorEnvelope:
        properties:
            error:
                $ref: '#/definitions/apiError'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - error
        type: object
    apiFieldError:
        properties:
            field:
                type: string
            reason:
                type: string
            value:
                type: string
        type: object
    apiSessionDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                authQueries:
                    $ref: '#/definitions/authQueryList'
                cachedLastActivityAt:
                    format: date-time
                    type: string
                configTypes:
                    items:
                        type: string
                    type: array
                identity:
                    $ref: '#/definitions/entityRef'
                identityId:
                    type: string
                ipAddress:
                    type: string
                isMfaComplete:
                    type: boolean
                isMfaRequired:
                    type: boolean
                lastActivityAt:
                    format: date-time
                    type: string
                token:
                    type: string
              required:
                - token
                - identity
                - identityId
                - configTypes
                - ipAddress
                - authQueries
                - cachedUpdatedAt
                - isMfaRequired
                - isMfaComplete
              type: object
        description: An API Session object
        type: object
    apiSessionList:
        items:
            $ref: '#/definitions/apiSessionDetail'
        type: array
    apiSessionPostureData:
        properties:
            mfa:
                $ref: '#/definitions/postureDataMfa'
        required:
            - mfa
        type: object
    apiVersion:
        properties:
            path:
                type: string
            version:
                type: string
        required:
            - path
        type: object
    attributes:
        description: A set of strings used to loosly couple this resource to policies
        items:
            type: string
        type: array
        x-omitempty: false
    authQueryDetail:
        properties:
            format:
                $ref: '#/definitions/mfaFormats'
            httpMethod:
                type: string
            httpUrl:
                type: string
            maxLength:
                type: integer
            minLength:
                type: integer
            provider:
                $ref: '#/definitions/mfaProviders'
            typeId:
                type: string
        required:
            - provider
        type: object
    authQueryList:
        items:
            $ref: '#/definitions/authQueryDetail'
        type: array
    authenticate:
        description: A generic authenticate object meant for use with the /authenticate path. Required fields depend on authentication method.
        properties:
            configTypes:
                $ref: '#/definitions/configTypes'
            envInfo:
                $ref: '#/definitions/envInfo'
            password:
                $ref: '#/definitions/password'
            sdkInfo:
                $ref: '#/definitions/sdkInfo'
            username:
                $ref: '#/definitions/username'
        type: object
    authenticatorCreate:
        description: Creates an authenticator for a specific identity which can be used for API authentication
        properties:
            identityId:
                description: The id of an existing identity that will be assigned this authenticator
                type: string
            method:
                description: The type of authenticator to create; which will dictate which properties on this object are required.
                type: string
            password:
                description: The password the identity will login with, Used only for method='updb'
                type: string
            tags:
                $ref: '#/definitions/tags'
            username:
                description: The username that the identity will login with. Used only for method='updb'
                type: string
        required:
            - username
            - password
            - method
            - identityId
        type: object
    authenticatorDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                certPem:
                    type: string
                fingerprint:
                    type: string
                identity:
                    $ref: '#/definitions/entityRef'
                identityId:
                    type: string
                method:
                    type: string
                username:
                    type: string
              required:
                - method
                - identityId
                - identity
              type: object
        description: A singular authenticator resource
        type: object
    authenticatorList:
        description: An array of authenticator resources
        items:
            $ref: '#/definitions/authenticatorDetail'
        type: array
    authenticatorPatch:
        description: All of the fields on an authenticator that may be updated
        properties:
            password:
                $ref: '#/definitions/password-nullable'
            tags:
                $ref: '#/definitions/tags'
            username:
                $ref: '#/definitions/username-nullable'
        type: object
    authenticatorPatchWithCurrent:
        allOf:
            - $ref: '#/definitions/authenticatorPatch'
            - properties:
                currentPassword:
                    $ref: '#/definitions/password'
              required:
                - currentPassword
              type: object
        description: All of the fields on an authenticator that may be updated
        type: object
    authenticatorUpdate:
        description: All of the fields on an authenticator that will be updated
        properties:
            password:
                $ref: '#/definitions/password'
            tags:
                $ref: '#/definitions/tags'
            username:
                $ref: '#/definitions/username'
        required:
            - username
            - password
        type: object
    authenticatorUpdateWithCurrent:
        allOf:
            - $ref: '#/definitions/authenticatorUpdate'
            - properties:
                currentPassword:
                    $ref: '#/definitions/password'
              required:
                - currentPassword
              type: object
        description: All of the fields on an authenticator that will be updated
        type: object
    baseEntity:
        description: Fields shared by all Edge API entities
        properties:
            _links:
                $ref: '#/definitions/links'
            createdAt:
                format: date-time
                type: string
            id:
                type: string
            tags:
                $ref: '#/definitions/tags'
            updatedAt:
                format: date-time
                type: string
        required:
            - id
            - createdAt
            - updatedAt
            - _links
            - tags
        type: object
    caCreate:
        description: A create Certificate Authority (CA) object
        properties:
            certPem:
                example: '-----BEGIN CERTIFICATE-----\nMIICUjCCAdmgAwIBAgIJANooo7NB+dZZMAoGCCqGSM49BAMCMF4xCzAJBgNVBAYT\nAlVTMQswCQYDVQQIDAJOQzETMBEGA1UECgwKTmV0Rm91bmRyeTEtMCsGA1UEAwwk\nTmV0Rm91bmRyeSBaaXRpIEV4dGVybmFsIEFQSSBSb290IENBMB4XDTE4MTExNTEy\nNTcwOVoXDTM4MTExMDEyNTcwOVowXjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5D\nMRMwEQYDVQQKDApOZXRGb3VuZHJ5MS0wKwYDVQQDDCROZXRGb3VuZHJ5IFppdGkg\nRXh0ZXJuYWwgQVBJIFJvb3QgQ0EwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAARwq61Z\nIaqbaw0PDt3frJZaHjkxfZhwYrykI1GlbRNd/jix03lVG9qvpN5Og9fQfFFcFmD/\n3vCE9S6O0npm0mADQxcBcxbMRAH5dtBuCuiJW6qAAbPgiM32vqSxBiFt0KejYzBh\nMB0GA1UdDgQWBBRx1OVGuc/jdltDc8YBtkw8Tbr4fjAfBgNVHSMEGDAWgBRx1OVG\nuc/jdltDc8YBtkw8Tbr4fjAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIB\nhjAKBggqhkjOPQQDAgNnADBkAjBDRxNZUaIVpkQKnAgJukl3ysd3/i7Z6hDyIEms\nkllz/+ZvmdBp9iedV5o5BvJUggACMCv+UBFlJH7pmsOCo/F45Kk178YsCC7gaMxE\n1ZG1zveyMvsYsH04C9FndE6w2MLvlA==\n-----END CERTIFICATE-----'
                type: string
            identityNameFormat:
                type: string
            identityRoles:
                $ref: '#/definitions/roles'
            isAuthEnabled:
                example: true
                type: boolean
            isAutoCaEnrollmentEnabled:
                example: true
                type: boolean
            isOttCaEnrollmentEnabled:
                example: true
                type: boolean
            name:
                example: Test 3rd Party External CA
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
            - certPem
            - isAutoCaEnrollmentEnabled
            - isOttCaEnrollmentEnabled
            - isAuthEnabled
            - identityRoles
        type: object
    caDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                certPem:
                    type: string
                fingerprint:
                    type: string
                identityNameFormat:
                    type: string
                identityRoles:
                    $ref: '#/definitions/roles'
                isAuthEnabled:
                    example: true
                    type: boolean
                isAutoCaEnrollmentEnabled:
                    example: true
                    type: boolean
                isOttCaEnrollmentEnabled:
                    example: true
                    type: boolean
                isVerified:
                    example: false
                    type: boolean
                name:
                    type: string
                verificationToken:
                    format: uuid
                    type: string
              required:
                - name
                - fingerprint
                - certPem
                - isVerified
                - isAutoCaEnrollmentEnabled
                - isOttCaEnrollmentEnabled
                - isAuthEnabled
                - identityRoles
                - identityNameFormat
              type: object
        description: A Certificate Authority (CA) resource
        type: object
    caList:
        description: An array of Certificate Authority (CA) resources
        items:
            $ref: '#/definitions/caDetail'
        type: array
    caPatch:
        properties:
            identityNameFormat:
                type: string
            identityRoles:
                $ref: '#/definitions/roles'
            isAuthEnabled:
                example: true
                type: boolean
            isAutoCaEnrollmentEnabled:
                example: true
                type: boolean
            isOttCaEnrollmentEnabled:
                example: true
                type: boolean
            name:
                example: My CA
                type: string
            tags:
                $ref: '#/definitions/tags'
        type: object
    caUpdate:
        properties:
            identityNameFormat:
                type: string
            identityRoles:
                $ref: '#/definitions/roles'
            isAuthEnabled:
                example: true
                type: boolean
            isAutoCaEnrollmentEnabled:
                example: true
                type: boolean
            isOttCaEnrollmentEnabled:
                example: true
                type: boolean
            name:
                example: My CA
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
            - isAutoCaEnrollmentEnabled
            - isOttCaEnrollmentEnabled
            - isAuthEnabled
            - identityRoles
        type: object
    commonEdgeRouterProperties:
        properties:
            appData:
                $ref: '#/definitions/tags'
            hostname:
                type: string
            isOnline:
                type: boolean
            name:
                type: string
            supportedProtocols:
                additionalProperties:
                    type: string
                type: object
            syncStatus:
                type: string
        required:
            - hostname
            - name
            - supportedProtocols
            - syncStatus
            - isOnline
        type: object
    configCreate:
        description: A config create object
        example:
            configTypeId: cea49285-6c07-42cf-9f52-09a9b115c783
            data:
                hostname: example.com
                port: 80
            name: test-config
        properties:
            configTypeId:
                description: The id of a config-type that the data section will match
                type: string
            data:
                additionalProperties: true
                description: Data payload is defined by the schema of the config-type defined in the type parameter
                type: object
                x-nullable: false
            name:
                example: default.ziti-tunneler-server.v1
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
            - configTypeId
            - data
        type: object
    configDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                configType:
                    $ref: '#/definitions/entityRef'
                configTypeId:
                    type: string
                data:
                    description: The data section of a config is based on the schema of its type
                    type: object
                name:
                    type: string
              required:
                - name
                - configTypeId
                - configType
                - data
              type: object
        description: A config resource
        type: object
    configList:
        description: An array of config resources
        items:
            $ref: '#/definitions/configDetail'
        type: array
    configPatch:
        description: A config patch object
        example:
            data:
                hostname: example.com
                port: 80
            name: example-config-name
        properties:
            data:
                additionalProperties: true
                description: Data payload is defined by the schema of the config-type defined in the type parameter
                type: object
            name:
                example: default.ziti-tunneler-server.v1
                type: string
            tags:
                $ref: '#/definitions/tags'
        type: object
    configTypeCreate:
        description: A config-type create object
        properties:
            name:
                example: ziti-tunneler-server.v1
                type: string
            schema:
                additionalProperties: true
                description: A JSON schema to enforce configuration against
                type: object
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    configTypeDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                name:
                    example: ziti-tunneler-server.v1
                    type: string
                schema:
                    additionalProperties: true
                    description: A JSON schema to enforce configuration against
                    type: object
              required:
                - name
                - schema
              type: object
        description: A config-type resource
        type: object
    configTypeList:
        description: An array of config-type resources
        items:
            $ref: '#/definitions/configTypeDetail'
        type: array
    configTypePatch:
        description: A config-type patch object
        properties:
            name:
                example: ziti-tunneler-server.v1
                type: string
            schema:
                additionalProperties: true
                description: A JSON schema to enforce configuration against
                type: object
            tags:
                $ref: '#/definitions/tags'
        type: object
    configTypeUpdate:
        description: A config-type update object
        properties:
            name:
                example: ziti-tunneler-server.v1
                type: string
            schema:
                additionalProperties: true
                description: A JSON schema to enforce configuration against
                type: object
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    configTypes:
        description: Specific configuration types that should be returned
        items:
            type: string
        type: array
    configUpdate:
        description: A config update object
        example:
            data:
                hostname: example.com
                port: 80
            name: example-config-name
        properties:
            data:
                additionalProperties: true
                description: Data payload is defined by the schema of the config-type defined in the type parameter
                type: object
                x-nullable: false
            name:
                example: default.ziti-tunneler-server.v1
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
            - data
        type: object
    createCurrentApiSessionCertificateEnvelope:
        properties:
            data:
                $ref: '#/definitions/currentApiSessionCertificateCreateResponse'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
    createEnvelope:
        properties:
            data:
                $ref: '#/definitions/createLocation'
            meta:
                $ref: '#/definitions/meta'
        type: object
    createLocation:
        properties:
            _links:
                $ref: '#/definitions/links'
            id:
                type: string
        type: object
    currentAPISessionDetailEnvelope:
        properties:
            data:
                $ref: '#/definitions/currentApiSessionDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    currentApiSessionCertificateCreate:
        properties:
            csr:
                type: string
        required:
            - csr
        type: object
    currentApiSessionCertificateCreateResponse:
        allOf:
            - $ref: '#/definitions/createLocation'
            - properties:
                cas:
                    type: string
                certificate:
                    type: string
              required:
                - certificate
              type: object
    currentApiSessionCertificateDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                certificate:
                    type: string
                fingerprint:
                    type: string
                subject:
                    type: string
                validFrom:
                    format: date-time
                    type: string
                validTo:
                    format: date-time
                    type: string
              required:
                - subject
                - fingerprint
                - validFrom
                - validTo
                - certificate
              type: object
        type: object
    currentApiSessionCertificateList:
        items:
            $ref: '#/definitions/currentApiSessionCertificateDetail'
        type: array
    currentApiSessionDetail:
        allOf:
            - $ref: '#/definitions/apiSessionDetail'
            - properties:
                expirationSeconds:
                    type: integer
                expiresAt:
                    format: date-time
                    type: string
              required:
                - expiresAt
                - expirationSeconds
              type: object
        description: An API Session object for the current API session
        type: object
    currentIdentityDetailEnvelope:
        properties:
            data:
                $ref: '#/definitions/identityDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    currentIdentityEdgeRouterDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - $ref: '#/definitions/commonEdgeRouterProperties'
        description: A detail edge router resource
        type: object
    currentIdentityEdgeRouterList:
        description: A list of edge router resources
        items:
            $ref: '#/definitions/currentIdentityEdgeRouterDetail'
        type: array
    dataIntegrityCheckDetail:
        properties:
            description:
                type: string
            fixed:
                type: boolean
        required:
            - description
            - fixed
        type: object
    dataIntegrityCheckDetailList:
        items:
            $ref: '#/definitions/dataIntegrityCheckDetail'
        type: array
    dataIntegrityCheckDetails:
        properties:
            endTime:
                format: date-time
                type: string
            error:
                type: string
            fixingErrors:
                type: boolean
            inProgress:
                type: boolean
            results:
                $ref: '#/definitions/dataIntegrityCheckDetailList'
            startTime:
                format: date-time
                type: string
            tooManyErrors:
                type: boolean
        required:
            - inProgress
            - fixingErrors
            - tooManyErrors
            - startTime
            - endTime
            - error
            - results
        type: object
    dataIntegrityCheckResultEnvelope:
        properties:
            data:
                $ref: '#/definitions/dataIntegrityCheckDetails'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailAPISessionEnvelope:
        properties:
            data:
                $ref: '#/definitions/apiSessionDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailAuthenticatorEnvelope:
        properties:
            data:
                $ref: '#/definitions/authenticatorDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailCaEnvelope:
        properties:
            data:
                $ref: '#/definitions/caDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailConfigEnvelope:
        properties:
            data:
                $ref: '#/definitions/configDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailConfigTypeEnvelope:
        properties:
            data:
                $ref: '#/definitions/configTypeDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailCurrentApiSessionCertificateEnvelope:
        properties:
            data:
                $ref: '#/definitions/currentApiSessionCertificateDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
    detailEdgeRouterPolicyEnvelope:
        properties:
            data:
                $ref: '#/definitions/edgeRouterPolicyDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailEnrollmentEnvelope:
        properties:
            data:
                $ref: '#/definitions/enrollmentDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailGeoRegionEnvelope:
        properties:
            data:
                $ref: '#/definitions/geoRegionDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailIdentityEnvelope:
        properties:
            data:
                $ref: '#/definitions/identityDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailIdentityTypeEnvelope:
        properties:
            data:
                $ref: '#/definitions/identityTypeDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailMfa:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                isVerified:
                    type: boolean
                provisioningUrl:
                    description: Not provided if MFA verification has been completed
                    type: string
                recoveryCodes:
                    description: Not provided if MFA verification has been completed
                    items:
                        type: string
                    type: array
              required:
                - isVerified
        type: object
    detailMfaEnvelope:
        properties:
            error:
                $ref: '#/definitions/detailMfa'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - error
        type: object
    detailMfaRecoveryCodes:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                recoveryCodes:
                    items:
                        type: string
                    type: array
              required:
                - recoveryCodes
        type: object
    detailMfaRecoveryCodesEnvelope:
        properties:
            error:
                $ref: '#/definitions/detailMfaRecoveryCodes'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - error
        type: object
    detailPostureCheckEnvelope:
        properties:
            data:
                $ref: '#/definitions/PostureCheckDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailPostureCheckTypeEnvelope:
        properties:
            data:
                $ref: '#/definitions/PostureCheckTypeDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailServiceEdgePolicyEnvelope:
        properties:
            data:
                $ref: '#/definitions/serviceEdgeRouterPolicyDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailServiceEnvelope:
        properties:
            data:
                $ref: '#/definitions/serviceDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailServicePolicyEnvelop:
        properties:
            data:
                $ref: '#/definitions/servicePolicyDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailSessionEnvelope:
        properties:
            data:
                $ref: '#/definitions/sessionDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailSessionRoutePathEnvelope:
        properties:
            data:
                $ref: '#/definitions/sessionRoutePathDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailSpecBodyEnvelope:
        properties:
            data:
                $ref: '#/definitions/specBodyDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailSpecEnvelope:
        properties:
            data:
                $ref: '#/definitions/specDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailTerminatorEnvelope:
        properties:
            data:
                $ref: '#/definitions/terminatorDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailTransitRouterEnvelope:
        properties:
            data:
                $ref: '#/definitions/transitRouterDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    detailedEdgeRouterEnvelope:
        properties:
            data:
                $ref: '#/definitions/edgeRouterDetail'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    dialBind:
        enum:
            - Dial
            - Bind
        type: string
    dialBindArray:
        items:
            $ref: '#/definitions/dialBind'
        type: array
    edgeRouterCreate:
        description: An edge router create object
        properties:
            appData:
                $ref: '#/definitions/tags'
            isTunnelerEnabled:
                type: boolean
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    edgeRouterDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - $ref: '#/definitions/commonEdgeRouterProperties'
            - properties:
                enrollmentCreatedAt:
                    format: date-time
                    type: string
                    x-nullable: true
                enrollmentExpiresAt:
                    format: date-time
                    type: string
                    x-nullable: true
                enrollmentJwt:
                    type: string
                    x-nullable: true
                enrollmentToken:
                    type: string
                    x-nullable: true
                fingerprint:
                    type: string
                isTunnelerEnabled:
                    type: boolean
                isVerified:
                    type: boolean
                roleAttributes:
                    $ref: '#/definitions/attributes'
                versionInfo:
                    $ref: '#/definitions/versionInfo'
              required:
                - isVerified
                - roleAttributes
                - os
                - version
                - arch
                - buildDate
                - revision
                - isTunnelerEnabled
              type: object
        description: A detail edge router resource
        example:
            _links:
                edge-router-policies:
                    href: ./edge-routers/b0766b8d-bd1a-4d28-8415-639b29d3c83d/edge-routers
                self:
                    href: ./edge-routers/b0766b8d-bd1a-4d28-8415-639b29d3c83d
            createdAt: "2020-03-16T17:13:31.5807454Z"
            enrollmentCreatedAt: "2020-03-16T17:13:31.5777637Z"
            enrollmentExpiresAt: "2020-03-16T17:18:31.5777637Z"
            enrollmentJwt: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbSI6ImVyb3R0IiwiZXhwIjoxNTg0Mzc5MTExLCJpc3MiOiJodHRwczovL 2xvY2FsaG9zdDoxMjgwIiwianRpIjoiMzBhMWYwZWEtZDM5Yi00YWFlLWI4NTItMzA0Y2YxYzMwZDFmIiwic3ViIjoiYjA3NjZiOGQtYmQxYS00ZDI 4LTg0MTUtNjM5YjI5ZDNjODNkIn0.UsyQhCPORQ5tQnYWY7S88LNvV9iFS5Hy-P4aJaClZzEICobKgnQoyQblJcdMvk3cGKwyFqAnQtt0tDZkb8tHz Vqyv6bilHcAFuMRrdwXRqdXquabSN5geu2qBUnyzL7Mf2X85if8sbMida6snB4oLZsVRF3CRn4ODBJdeiVJ_Z4rgD-zW2IwtXPApT7ALyiiw2cN4EH 8pqQ7tpZKqztE0PGEbBQFPGKUFnm7oXyvSUo17EsFJUv5gUlBzfKKGolh5io4ptp22HZrqsqSnqDSOnYEZHonr5Yljuwiktrlh-JKiK6GGns5OAJMP dO9lgM4yHSpF2ILbqhWMV93Y3zMOg
            enrollmentToken: 30a1f0ea-d39b-4aae-b852-304cf1c30d1f
            fingerprint: null
            hostname: ""
            id: b0766b8d-bd1a-4d28-8415-639b29d3c83d
            isOnline: false
            isTunnelerEnabled: false
            isVerified: false
            name: TestRouter-e33c837f-3222-4b40-bcd6-b3458fd5156e
            roleAttributes:
                - eastCoast
                - sales
                - test
            supportedProtocols: {}
            tags: {}
            updatedAt: "2020-03-16T17:13:31.5807454Z"
        type: object
    edgeRouterList:
        description: A list of edge router resources
        items:
            $ref: '#/definitions/edgeRouterDetail'
        type: array
    edgeRouterPatch:
        description: An edge router patch object
        properties:
            appData:
                $ref: '#/definitions/tags'
            isTunnelerEnabled:
                type: boolean
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
        type: object
    edgeRouterPolicyCreate:
        properties:
            edgeRouterRoles:
                $ref: '#/definitions/roles'
            identityRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            semantic:
                $ref: '#/definitions/semantic'
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
    edgeRouterPolicyDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                edgeRouterRoles:
                    $ref: '#/definitions/roles'
                edgeRouterRolesDisplay:
                    $ref: '#/definitions/namedRoles'
                identityRoles:
                    $ref: '#/definitions/roles'
                identityRolesDisplay:
                    $ref: '#/definitions/namedRoles'
                isSystem:
                    type: boolean
                name:
                    type: string
                semantic:
                    $ref: '#/definitions/semantic'
              required:
                - name
                - semantic
                - edgeRouterRoles
                - edgeRouterRolesDisplay
                - identityRoles
                - identityRolesDisplay
                - isSystem
              type: object
        type: object
    edgeRouterPolicyList:
        items:
            $ref: '#/definitions/edgeRouterPolicyDetail'
        type: array
    edgeRouterPolicyPatch:
        properties:
            edgeRouterRoles:
                $ref: '#/definitions/roles'
            identityRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            semantic:
                $ref: '#/definitions/semantic'
            tags:
                $ref: '#/definitions/tags'
    edgeRouterPolicyUpdate:
        properties:
            edgeRouterRoles:
                $ref: '#/definitions/roles'
            identityRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            semantic:
                $ref: '#/definitions/semantic'
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
    edgeRouterUpdate:
        description: An edge router update object
        properties:
            appData:
                $ref: '#/definitions/tags'
            isTunnelerEnabled:
                type: boolean
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    empty:
        properties:
            data:
                example: {}
                type: object
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    enrollmentCerts:
        properties:
            ca:
                description: A PEM encoded set of CA certificates to trust
                type: string
            cert:
                description: A PEM encoded cert for the server
                type: string
            serverCert:
                description: A PEM encoded set of certificates to use as the servers chain
                type: string
        type: object
    enrollmentCertsEnvelope:
        properties:
            data:
                $ref: '#/definitions/enrollmentCerts'
            meta:
                $ref: '#/definitions/meta'
        type: object
    enrollmentDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                details:
                    additionalProperties:
                        type: string
                    type: object
                edgeRouter:
                    $ref: '#/definitions/entityRef'
                edgeRouterId:
                    type: string
                expiresAt:
                    format: date-time
                    type: string
                identity:
                    $ref: '#/definitions/entityRef'
                identityId:
                    type: string
                method:
                    type: string
                token:
                    type: string
                transitRouter:
                    $ref: '#/definitions/entityRef'
                transitRouterId:
                    type: string
                username:
                    type: string
              required:
                - token
                - method
                - expiresAt
                - details
              type: object
        description: |
            An enrollment object. Enrolments are tied to identities and portentially a CA. Depending on the
            method, different fields are utilized. For example ottca enrollments use the `ca` field and updb enrollments
            use the username field, but not vice versa.
        example:
            _links:
                self:
                    href: ./enrollments/624fa53f-7629-4a7a-9e38-c1f4ce322c1d
            ca: null
            createdAt: "0001-01-01T00:00:00Z"
            expiresAt: "2020-03-11T20:20:24.0055543Z"
            id: 624fa53f-7629-4a7a-9e38-c1f4ce322c1d
            identity:
                _links:
                    self:
                        href: ./identities/f047ac96-dc3a-408a-a6f2-0ba487c08ef9
                id: f047ac96-dc3a-408a-a6f2-0ba487c08ef9
                name: updb--0f245140-7f2e-4326-badf-6aba55e52475
                urlName: identities
            method: updb
            tags: null
            token: 1e727c8f-07e4-4a1d-a8b0-da0c7a01c6e1
            updatedAt: "0001-01-01T00:00:00Z"
            username: example-username
        type: object
    enrollmentList:
        description: An array of enrollment resources
        items:
            $ref: '#/definitions/enrollmentDetail'
        type: array
    entityRef:
        description: A reference to another resource and links to interact with it
        properties:
            _links:
                $ref: '#/definitions/links'
            entity:
                type: string
            id:
                type: string
            name:
                type: string
        type: object
    envInfo:
        description: Environment information an authenticating client may provide
        properties:
            arch:
                type: string
            os:
                type: string
            osRelease:
                type: string
            osVersion:
                type: string
        type: object
    failedServiceRequestList:
        items:
            $ref: '#/definitions/failedSessionRequest'
        type: array
    failedSessionRequest:
        properties:
            apiSessionId:
                type: string
            policyFailures:
                items:
                    $ref: '#/definitions/policyFailure'
                type: array
            serviceId:
                type: string
            serviceName:
                type: string
            sessionType:
                $ref: '#/definitions/dialBind'
            when:
                format: date-time
                type: string
        type: object
    geoRegionDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                name:
                    type: string
              required:
                - name
              type: object
        type: object
    geoRegionList:
        items:
            $ref: '#/definitions/geoRegionDetail'
        type: array
    getIdentityFailedServiceRequestEnvelope:
        properties:
            data:
                $ref: '#/definitions/failedServiceRequestList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    getIdentityPolicyAdviceEnvelope:
        properties:
            data:
                $ref: '#/definitions/policyAdvice'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    getIdentityPostureDataEnvelope:
        properties:
            data:
                $ref: '#/definitions/postureData'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    identityAuthenticators:
        properties:
            cert:
                properties:
                    fingerprint:
                        type: string
                type: object
            updb:
                properties:
                    username:
                        type: string
                type: object
        type: object
    identityCreate:
        description: An identity to create
        properties:
            appData:
                $ref: '#/definitions/tags'
            defaultHostingCost:
                $ref: '#/definitions/terminatorCost'
            defaultHostingPrecedence:
                $ref: '#/definitions/terminatorPrecedence'
            enrollment:
                properties:
                    ott:
                        type: boolean
                    ottca:
                        type: string
                    updb:
                        type: string
                type: object
            isAdmin:
                type: boolean
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            serviceHostingCosts:
                $ref: '#/definitions/terminatorCostMap'
            serviceHostingPrecedences:
                $ref: '#/definitions/terminatorPrecedenceMap'
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/identityType'
        required:
            - name
            - type
            - isAdmin
        type: object
    identityDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                appData:
                    $ref: '#/definitions/tags'
                authenticators:
                    $ref: '#/definitions/identityAuthenticators'
                defaultHostingCost:
                    $ref: '#/definitions/terminatorCost'
                defaultHostingPrecedence:
                    $ref: '#/definitions/terminatorPrecedence'
                enrollment:
                    $ref: '#/definitions/identityEnrollments'
                envInfo:
                    $ref: '#/definitions/envInfo'
                hasApiSession:
                    type: boolean
                hasEdgeRouterConnection:
                    type: boolean
                isAdmin:
                    type: boolean
                isDefaultAdmin:
                    type: boolean
                isMfaEnabled:
                    type: boolean
                name:
                    type: string
                roleAttributes:
                    $ref: '#/definitions/attributes'
                sdkInfo:
                    $ref: '#/definitions/sdkInfo'
                serviceHostingCosts:
                    $ref: '#/definitions/terminatorCostMap'
                serviceHostingPrecedences:
                    $ref: '#/definitions/terminatorPrecedenceMap'
                type:
                    $ref: '#/definitions/entityRef'
                typeId:
                    type: string
              required:
                - name
                - type
                - typeId
                - isDefaultAdmin
                - isAdmin
                - authenticators
                - enrollment
                - envInfo
                - sdkInfo
                - roleAttributes
                - hasEdgeRouterConnection
                - hasApiSession
                - isMfaEnabled
                - serviceHostingPrecedences
                - serviceHostingCosts
              type: object
        description: Detail of a specific identity
        type: object
    identityEnrollments:
        properties:
            ott:
                properties:
                    expiresAt:
                        format: date-time
                        type: string
                    id:
                        type: string
                    jwt:
                        type: string
                    token:
                        type: string
                type: object
            ottca:
                properties:
                    ca:
                        $ref: '#/definitions/entityRef'
                    caId:
                        type: string
                    expiresAt:
                        format: date-time
                        type: string
                    id:
                        type: string
                    jwt:
                        type: string
                    token:
                        type: string
                type: object
            updb:
                properties:
                    expiresAt:
                        format: date-time
                        type: string
                    id:
                        type: string
                    jwt:
                        type: string
                    token:
                        type: string
                type: object
        type: object
    identityList:
        description: A list of identities
        items:
            $ref: '#/definitions/identityDetail'
        type: array
    identityPatch:
        properties:
            appData:
                $ref: '#/definitions/tags'
            defaultHostingCost:
                $ref: '#/definitions/terminatorCost'
            defaultHostingPrecedence:
                $ref: '#/definitions/terminatorPrecedence'
            isAdmin:
                type: boolean
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            serviceHostingCosts:
                $ref: '#/definitions/terminatorCostMap'
            serviceHostingPrecedences:
                $ref: '#/definitions/terminatorPrecedenceMap'
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/identityType'
        type: object
    identityType:
        enum:
            - User
            - Device
            - Service
            - Router
        type: string
    identityTypeDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                name:
                    type: string
              type: object
        type: object
    identityTypeList:
        items:
            $ref: '#/definitions/identityDetail'
        type: array
    identityUpdate:
        properties:
            appData:
                $ref: '#/definitions/tags'
            defaultHostingCost:
                $ref: '#/definitions/terminatorCost'
            defaultHostingPrecedence:
                $ref: '#/definitions/terminatorPrecedence'
            isAdmin:
                type: boolean
            name:
                type: string
            roleAttributes:
                $ref: '#/definitions/attributes'
            serviceHostingCosts:
                $ref: '#/definitions/terminatorCostMap'
            serviceHostingPrecedences:
                $ref: '#/definitions/terminatorPrecedenceMap'
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/identityType'
        required:
            - type
            - name
            - isAdmin
        type: object
    link:
        description: A link to another resource
        properties:
            comment:
                type: string
            href:
                format: uri
                type: string
            method:
                type: string
        required:
            - href
        type: object
    links:
        additionalProperties:
            $ref: '#/definitions/link'
        description: A map of named links
        type: object
        x-omitempty: false
    listAPISessionsEnvelope:
        properties:
            data:
                $ref: '#/definitions/apiSessionList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
    listAuthenticatorsEnvelope:
        properties:
            data:
                $ref: '#/definitions/authenticatorList'
            meta:
                $ref: '#/definitions/meta'
        type: object
    listCasEnvelope:
        properties:
            data:
                $ref: '#/definitions/caList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listConfigTypesEnvelope:
        properties:
            data:
                $ref: '#/definitions/configTypeList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listConfigsEnvelope:
        properties:
            data:
                $ref: '#/definitions/configList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listCurrentAPISessionCertificatesEnvelope:
        properties:
            data:
                $ref: '#/definitions/currentApiSessionCertificateList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
    listCurrentApiSessionServiceUpdatesEnvelope:
        properties:
            data:
                $ref: '#/definitions/CurrentApiSessionServiceUpdateList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listCurrentIdentityEdgeRoutersEnvelope:
        properties:
            data:
                $ref: '#/definitions/currentIdentityEdgeRouterList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listEdgeRouterPoliciesEnvelope:
        properties:
            data:
                $ref: '#/definitions/edgeRouterPolicyList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listEdgeRoutersEnvelope:
        properties:
            data:
                $ref: '#/definitions/edgeRouterList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listEnrollmentsEnvelope:
        properties:
            data:
                $ref: '#/definitions/enrollmentList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listGeoRegionsEnvelope:
        properties:
            data:
                $ref: '#/definitions/geoRegionList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listIdentitiesEnvelope:
        properties:
            data:
                $ref: '#/definitions/identityList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listIdentityTypesEnvelope:
        properties:
            data:
                $ref: '#/definitions/identityTypeList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listPostureCheckEnvelope:
        properties:
            data:
                items:
                    $ref: '#/definitions/PostureCheckDetail'
                type: array
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listPostureCheckTypesEnvelope:
        properties:
            data:
                $ref: '#/definitions/PostureCheckTypeList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listProtocols:
        additionalProperties:
            $ref: '#/definitions/protocol'
        type: object
    listProtocolsEnvelope:
        properties:
            data:
                $ref: '#/definitions/listProtocols'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listRoleAttributesEnvelope:
        properties:
            data:
                $ref: '#/definitions/roleAttributesList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listServiceConfigsEnvelope:
        properties:
            data:
                $ref: '#/definitions/serviceConfigList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listServiceEdgeRouterPoliciesEnvelope:
        properties:
            data:
                $ref: '#/definitions/serviceEdgeRouterPolicyList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listServicePoliciesEnvelope:
        properties:
            data:
                $ref: '#/definitions/servicePolicyList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listServicesEnvelope:
        properties:
            data:
                $ref: '#/definitions/serviceList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listSessionsEnvelope:
        properties:
            data:
                $ref: '#/definitions/sessionList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listSpecsEnvelope:
        properties:
            data:
                $ref: '#/definitions/specList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listSummaryCounts:
        additionalProperties:
            type: integer
        type: object
    listSummaryCountsEnvelope:
        properties:
            data:
                $ref: '#/definitions/listSummaryCounts'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listTerminatorsEnvelope:
        properties:
            data:
                $ref: '#/definitions/terminatorList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listTransitRoutersEnvelope:
        properties:
            data:
                $ref: '#/definitions/transitRouterList'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    listVersionEnvelope:
        properties:
            data:
                $ref: '#/definitions/version'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - data
        type: object
    meta:
        properties:
            apiEnrolmentVersion:
                type: string
            apiVersion:
                type: string
            filterableFields:
                items:
                    type: string
                type: array
                x-omitempty: true
            pagination:
                $ref: '#/definitions/pagination'
        type: object
    mfaCode:
        properties:
            code:
                type: string
        required:
            - code
        type: object
    mfaCreatedEnvelope:
        properties:
            error:
                $ref: '#/definitions/apiError'
            meta:
                $ref: '#/definitions/meta'
        required:
            - meta
            - error
        type: object
    mfaFormats:
        enum:
            - numeric
            - alpha
            - alphaNumeric
        type: string
    mfaProviders:
        enum:
            - ziti
        type: string
    namedRole:
        properties:
            name:
                type: string
            role:
                type: string
        type: object
    namedRoles:
        items:
            $ref: '#/definitions/namedRole'
        type: array
        x-omitempty: false
    operatingSystem:
        properties:
            type:
                $ref: '#/definitions/osType'
            versions:
                items:
                    type: string
                type: array
        required:
            - type
            - versions
        type: object
    osType:
        enum:
            - Windows
            - WindowsServer
            - Android
            - iOS
            - Linux
            - macOS
        type: string
    pagination:
        properties:
            limit:
                format: int64
                type: number
            offset:
                format: int64
                type: number
            totalCount:
                format: int64
                type: number
        required:
            - limit
            - offset
            - totalCount
        type: object
    password:
        maxLength: 100
        minLength: 5
        type: string
    password-nullable:
        maxLength: 100
        minLength: 5
        type: string
        x-nullable: true
    policyAdvice:
        properties:
            commonRouters:
                items:
                    $ref: '#/definitions/routerEntityRef'
                type: array
            identity:
                $ref: '#/definitions/entityRef'
            identityId:
                type: string
            identityRouterCount:
                format: int32
                type: number
            isBindAllowed:
                type: boolean
            isDialAllowed:
                type: boolean
            service:
                $ref: '#/definitions/entityRef'
            serviceId:
                type: string
            serviceRouterCount:
                format: int32
                type: number
        type: object
    policyFailure:
        properties:
            checks:
                items:
                    $ref: '#/definitions/postureCheckFailure'
                type: array
            policyId:
                type: string
            policyName:
                type: string
        type: object
    postureCheckFailure:
        discriminator: postureCheckType
        properties:
            postureCheckId:
                type: string
            postureCheckName:
                type: string
            postureCheckType:
                type: string
        required:
            - postureCheckId
            - postureCheckName
            - postureCheckType
        type: object
    postureCheckFailureDomain:
        allOf:
            - $ref: '#/definitions/postureCheckFailure'
            - properties:
                actualValue:
                    type: string
                expectedValue:
                    items:
                        type: string
                    type: array
              required:
                - actualValue
                - expectedValue
              type: object
        x-class: DOMAIN
    postureCheckFailureMacAddress:
        allOf:
            - $ref: '#/definitions/postureCheckFailure'
            - properties:
                actualValue:
                    items:
                        type: string
                    type: array
                expectedValue:
                    items:
                        type: string
                    type: array
              required:
                - actualValue
                - expectedValue
              type: object
        x-class: MAC
    postureCheckFailureMfa:
        allOf:
            - $ref: '#/definitions/postureCheckFailure'
            - properties:
                actualValue:
                    type: boolean
                expectedValue:
                    type: boolean
              required:
                - actualValue
                - expectedValue
              type: object
        x-class: MFA
    postureCheckFailureOperatingSystem:
        allOf:
            - $ref: '#/definitions/postureCheckFailure'
            - properties:
                actualValue:
                    $ref: '#/definitions/postureCheckFailureOperatingSystemActual'
                expectedValue:
                    items:
                        $ref: '#/definitions/operatingSystem'
                    minItems: 1
                    type: array
              required:
                - actualValue
                - expectedValue
              type: object
        x-class: OS
    postureCheckFailureOperatingSystemActual:
        properties:
            type:
                type: string
            version:
                type: string
        required:
            - type
            - version
        type: object
    postureCheckFailureProcess:
        allOf:
            - $ref: '#/definitions/postureCheckFailure'
            - properties:
                actualValue:
                    $ref: '#/definitions/postureCheckFailureProcessActual'
                expectedValue:
                    $ref: '#/definitions/process'
              required:
                - actualValue
                - expectedValue
              type: object
        x-class: PROCESS
    postureCheckFailureProcessActual:
        properties:
            hash:
                type: string
            isRunning:
                type: boolean
            osType:
                $ref: '#/definitions/osType'
            signerFingerprints:
                items:
                    type: string
                type: array
        required:
            - isRunning
            - hash
            - signerFingerprints
        type: object
    postureCheckType:
        enum:
            - OS
            - PROCESS
            - DOMAIN
            - MAC
            - MFA
        type: string
    postureData:
        properties:
            apiSessionPostureData:
                additionalProperties:
                    $ref: '#/definitions/apiSessionPostureData'
                type: object
            domain:
                $ref: '#/definitions/postureDataDomain'
            mac:
                $ref: '#/definitions/postureDataMac'
            os:
                $ref: '#/definitions/postureDataOs'
            processes:
                items:
                    $ref: '#/definitions/postureDataProcess'
                type: array
        required:
            - mac
            - domain
            - os
            - processes
            - apiSessionPostureData
        type: object
    postureDataBase:
        properties:
            lastUpdatedAt:
                format: date-time
                type: string
            postureCheckId:
                type: string
            timedOut:
                type: boolean
        required:
            - postureCheckId
            - timedOut
            - lastUpdatedAt
        type: object
    postureDataDomain:
        allOf:
            - $ref: '#/definitions/postureDataBase'
            - properties:
                domain:
                    type: string
              required:
                - domain
              type: object
        type: object
    postureDataMac:
        allOf:
            - $ref: '#/definitions/postureDataBase'
            - properties:
                addresses:
                    items:
                        type: string
                    type: array
              required:
                - addresses
              type: object
        type: object
    postureDataMfa:
        properties:
            apiSessionId:
                type: string
            passedMfa:
                type: boolean
        required:
            - apiSessionId
            - passedMfa
        type: object
    postureDataOs:
        allOf:
            - $ref: '#/definitions/postureDataBase'
            - properties:
                build:
                    type: string
                type:
                    type: string
                version:
                    type: string
              required:
                - type
                - version
                - build
              type: object
        type: object
    postureDataProcess:
        allOf:
            - $ref: '#/definitions/postureDataBase'
            - properties:
                binaryHash:
                    type: string
                isRunning:
                    type: boolean
                signerFingerprints:
                    items:
                        type: string
                    type: array
              type: object
        type: object
    postureQueries:
        properties:
            isPassing:
                type: boolean
            policyId:
                type: string
            policyType:
                $ref: '#/definitions/dialBind'
            postureQueries:
                items:
                    $ref: '#/definitions/postureQuery'
                type: array
        required:
            - policyId
            - isPassing
            - postureQueries
        type: object
    postureQuery:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                isPassing:
                    type: boolean
                process:
                    $ref: '#/definitions/postureQueryProcess'
                queryType:
                    $ref: '#/definitions/postureCheckType'
                timeout:
                    type: integer
              required:
                - queryType
                - isPassing
                - timeout
              type: object
        type: object
    postureQueryProcess:
        properties:
            osType:
                $ref: '#/definitions/osType'
            path:
                type: string
        type: object
    process:
        properties:
            hashes:
                items:
                    type: string
                type: array
            osType:
                $ref: '#/definitions/osType'
            path:
                type: string
            signerFingerprint:
                type: string
        required:
            - osType
            - path
        type: object
    protocol:
        properties:
            address:
                type: string
        required:
            - address
        type: object
    roleAttributesList:
        description: An array of role attributes
        items:
            type: string
        type: array
    roles:
        items:
            type: string
        type: array
        x-omitempty: false
    routerEntityRef:
        allOf:
            - $ref: '#/definitions/entityRef'
            - properties:
                isOnline:
                    type: boolean
              required:
                - isOnline
              type: object
        type: object
    routerExtendEnrollmentRequest:
        properties:
            certCsr:
                type: string
            serverCertCsr:
                type: string
        required:
            - serverCertCsr
            - certCsr
        type: object
    sdkInfo:
        description: SDK information an authenticating client may provide
        properties:
            appId:
                type: string
            appVersion:
                type: string
            branch:
                type: string
            revision:
                type: string
            type:
                type: string
            version:
                type: string
        type: object
    semantic:
        enum:
            - AllOf
            - AnyOf
        type: string
    serviceConfigAssign:
        properties:
            configId:
                type: string
            serviceId:
                type: string
        required:
            - serviceId
            - configId
        type: object
    serviceConfigDetail:
        example:
            config:
                _links:
                    self:
                        href: ./identities/13347602-ba34-4ff7-8082-e533ba945744
                id: 13347602-ba34-4ff7-8082-e533ba945744
                name: test-config-02fade09-fcc3-426c-854e-18539726bdc6
                urlName: configs
            service:
                _links:
                    self:
                        href: ./services/913a8c63-17a6-44d7-82b3-9f6eb997cf8e
                id: 913a8c63-17a6-44d7-82b3-9f6eb997cf8e
                name: netcat4545-egress-r2
                urlName: services
        properties:
            config:
                $ref: '#/definitions/entityRef'
            configId:
                type: string
            service:
                $ref: '#/definitions/entityRef'
            serviceId:
                type: string
        required:
            - serviceId
            - service
            - configId
            - config
        type: object
    serviceConfigList:
        items:
            $ref: '#/definitions/serviceConfigDetail'
        type: array
    serviceConfigsAssignList:
        items:
            $ref: '#/definitions/serviceConfigAssign'
        type: array
    serviceCreate:
        properties:
            configs:
                items:
                    type: string
                type: array
            encryptionRequired:
                type: boolean
            name:
                type: string
            roleAttributes:
                items:
                    type: string
                type: array
            tags:
                $ref: '#/definitions/tags'
            terminatorStrategy:
                type: string
        required:
            - name
            - encryptionRequired
        type: object
    serviceDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                config:
                    additionalProperties:
                        additionalProperties:
                            type: object
                        type: object
                    description: map of config data for this service keyed by the config type name. Only configs of the types requested will be returned.
                    type: object
                configs:
                    items:
                        type: string
                    type: array
                encryptionRequired:
                    type: boolean
                name:
                    type: string
                permissions:
                    $ref: '#/definitions/dialBindArray'
                postureQueries:
                    items:
                        $ref: '#/definitions/postureQueries'
                    type: array
                roleAttributes:
                    $ref: '#/definitions/attributes'
                terminatorStrategy:
                    type: string
              required:
                - name
                - terminatorStrategy
                - roleAttributes
                - permissions
                - configs
                - config
                - encryptionRequired
                - postureQueries
              type: object
        type: object
    serviceEdgeRouterPolicyCreate:
        properties:
            edgeRouterRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            semantic:
                $ref: '#/definitions/semantic'
            serviceRoles:
                $ref: '#/definitions/roles'
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    serviceEdgeRouterPolicyDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                edgeRouterRoles:
                    $ref: '#/definitions/roles'
                edgeRouterRolesDisplay:
                    $ref: '#/definitions/namedRoles'
                name:
                    type: string
                semantic:
                    $ref: '#/definitions/semantic'
                serviceRoles:
                    $ref: '#/definitions/roles'
                serviceRolesDisplay:
                    $ref: '#/definitions/namedRoles'
              required:
                - name
                - semantic
                - edgeRouterRoles
                - edgeRouterRolesDisplay
                - serviceRoles
                - serviceRolesDisplay
              type: object
        type: object
    serviceEdgeRouterPolicyList:
        items:
            $ref: '#/definitions/serviceEdgeRouterPolicyDetail'
        type: array
    serviceEdgeRouterPolicyPatch:
        properties:
            edgeRouterRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            semantic:
                $ref: '#/definitions/semantic'
            serviceRoles:
                $ref: '#/definitions/roles'
            tags:
                $ref: '#/definitions/tags'
        type: object
    serviceEdgeRouterPolicyUpdate:
        properties:
            edgeRouterRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            semantic:
                $ref: '#/definitions/semantic'
            serviceRoles:
                $ref: '#/definitions/roles'
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    serviceList:
        items:
            $ref: '#/definitions/serviceDetail'
        type: array
    servicePatch:
        properties:
            configs:
                items:
                    type: string
                type: array
            encryptionRequired:
                type: boolean
            name:
                type: string
            roleAttributes:
                items:
                    type: string
                type: array
            tags:
                $ref: '#/definitions/tags'
            terminatorStrategy:
                type: string
        type: object
    servicePolicyCreate:
        properties:
            identityRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            postureCheckRoles:
                $ref: '#/definitions/roles'
            semantic:
                $ref: '#/definitions/semantic'
            serviceRoles:
                $ref: '#/definitions/roles'
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/dialBind'
        required:
            - name
            - type
        type: object
    servicePolicyDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                identityRoles:
                    $ref: '#/definitions/roles'
                identityRolesDisplay:
                    $ref: '#/definitions/namedRoles'
                name:
                    type: string
                postureCheckRoles:
                    $ref: '#/definitions/roles'
                postureCheckRolesDisplay:
                    $ref: '#/definitions/namedRoles'
                semantic:
                    $ref: '#/definitions/semantic'
                serviceRoles:
                    $ref: '#/definitions/roles'
                serviceRolesDisplay:
                    $ref: '#/definitions/namedRoles'
                type:
                    $ref: '#/definitions/dialBind'
              required:
                - name
                - type
                - semantic
                - serviceRoles
                - serviceRolesDisplay
                - identityRoles
                - identityRolesDisplay
                - postureCheckRoles
                - postureCheckRolesDisplay
              type: object
        type: object
    servicePolicyList:
        items:
            $ref: '#/definitions/servicePolicyDetail'
        type: array
    servicePolicyPatch:
        properties:
            identityRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            postureCheckRoles:
                $ref: '#/definitions/roles'
            semantic:
                $ref: '#/definitions/semantic'
            serviceRoles:
                $ref: '#/definitions/roles'
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/dialBind'
        type: object
    servicePolicyUpdate:
        properties:
            identityRoles:
                $ref: '#/definitions/roles'
            name:
                type: string
            postureCheckRoles:
                $ref: '#/definitions/roles'
            semantic:
                $ref: '#/definitions/semantic'
            serviceRoles:
                $ref: '#/definitions/roles'
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/dialBind'
        required:
            - name
            - type
        type: object
    serviceUpdate:
        properties:
            configs:
                items:
                    type: string
                type: array
            encryptionRequired:
                type: boolean
            name:
                type: string
            roleAttributes:
                items:
                    type: string
                type: array
            tags:
                $ref: '#/definitions/tags'
            terminatorStrategy:
                type: string
        required:
            - name
        type: object
    sessionCreate:
        properties:
            serviceId:
                type: string
            tags:
                $ref: '#/definitions/tags'
            type:
                $ref: '#/definitions/dialBind'
        type: object
    sessionCreateEnvelope:
        properties:
            data:
                $ref: '#/definitions/sessionDetail'
            meta:
                $ref: '#/definitions/meta'
        type: object
    sessionDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                apiSession:
                    $ref: '#/definitions/entityRef'
                apiSessionId:
                    type: string
                edgeRouters:
                    items:
                        $ref: '#/definitions/sessionEdgeRouter'
                    type: array
                service:
                    $ref: '#/definitions/entityRef'
                serviceId:
                    type: string
                token:
                    type: string
                type:
                    $ref: '#/definitions/dialBind'
              required:
                - type
                - apiSessionId
                - apiSession
                - serviceId
                - service
                - token
                - edgeRouters
              type: object
        type: object
    sessionEdgeRouter:
        allOf:
            - $ref: '#/definitions/commonEdgeRouterProperties'
            - properties:
                urls:
                    additionalProperties:
                        type: string
                    type: object
              required:
                - urls
              type: object
    sessionList:
        items:
            $ref: '#/definitions/sessionDetail'
        type: array
    sessionRoutePathDetail:
        properties:
            routePath:
                items:
                    type: string
                type: array
        type: object
    specBodyDetail:
        type: string
    specDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                name:
                    type: string
              required:
                - name
              type: object
        type: object
    specList:
        items:
            $ref: '#/definitions/specDetail'
        type: array
    tags:
        additionalProperties:
            type: object
        description: 'A map of user defined fields and values. The values are limited to the following types/values: null, string, boolean'
        type: object
        x-omitempty: false
    terminatorCost:
        maximum: 65535
        type: integer
    terminatorCostMap:
        additionalProperties:
            $ref: '#/definitions/terminatorCost'
        type: object
    terminatorCreate:
        properties:
            address:
                type: string
            binding:
                type: string
            cost:
                $ref: '#/definitions/terminatorCost'
            identity:
                type: string
            identitySecret:
                format: byte
                type: string
            precedence:
                $ref: '#/definitions/terminatorPrecedence'
            router:
                type: string
            service:
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - service
            - router
            - address
            - binding
        type: object
    terminatorDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                address:
                    type: string
                binding:
                    type: string
                cost:
                    $ref: '#/definitions/terminatorCost'
                dynamicCost:
                    $ref: '#/definitions/terminatorCost'
                identity:
                    type: string
                precedence:
                    $ref: '#/definitions/terminatorPrecedence'
                router:
                    $ref: '#/definitions/entityRef'
                routerId:
                    type: string
                service:
                    $ref: '#/definitions/entityRef'
                serviceId:
                    type: string
              required:
                - serviceId
                - service
                - routerId
                - router
                - binding
                - address
                - identity
                - cost
                - precedence
                - dynamicCost
              type: object
        type: object
    terminatorDetailLimited:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                identity:
                    type: string
                routerId:
                    type: string
                service:
                    $ref: '#/definitions/entityRef'
                serviceId:
                    type: string
              required:
                - serviceId
                - service
                - routerId
                - identity
              type: object
        type: object
    terminatorList:
        items:
            $ref: '#/definitions/terminatorDetail'
        type: array
    terminatorPatch:
        properties:
            address:
                type: string
            binding:
                type: string
            cost:
                $ref: '#/definitions/terminatorCost'
            precedence:
                $ref: '#/definitions/terminatorPrecedence'
            router:
                type: string
            service:
                type: string
            tags:
                $ref: '#/definitions/tags'
        type: object
    terminatorPrecedence:
        enum:
            - default
            - required
            - failed
        type: string
    terminatorPrecedenceMap:
        additionalProperties:
            $ref: '#/definitions/terminatorPrecedence'
        type: object
    terminatorUpdate:
        properties:
            address:
                type: string
            binding:
                type: string
            cost:
                $ref: '#/definitions/terminatorCost'
            precedence:
                $ref: '#/definitions/terminatorPrecedence'
            router:
                type: string
            service:
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - service
            - router
            - address
            - binding
        type: object
    transitRouterCreate:
        properties:
            name:
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    transitRouterDetail:
        allOf:
            - $ref: '#/definitions/baseEntity'
            - properties:
                enrollmentCreatedAt:
                    format: date-time
                    type: string
                    x-nullable: true
                enrollmentExpiresAt:
                    format: date-time
                    type: string
                    x-nullable: true
                enrollmentJwt:
                    type: string
                    x-nullable: true
                enrollmentToken:
                    type: string
                    x-nullable: true
                fingerprint:
                    type: string
                isOnline:
                    type: boolean
                isVerified:
                    type: boolean
                name:
                    type: string
              required:
                - name
                - isVerified
                - isOnline
                - fingerprint
              type: object
        type: object
    transitRouterList:
        items:
            $ref: '#/definitions/transitRouterDetail'
        type: array
    transitRouterPatch:
        properties:
            name:
                type: string
            tags:
                $ref: '#/definitions/tags'
        type: object
    transitRouterUpdate:
        properties:
            name:
                type: string
            tags:
                $ref: '#/definitions/tags'
        required:
            - name
        type: object
    username:
        maxLength: 100
        minLength: 4
        type: string
    username-nullable:
        maxLength: 100
        minLength: 4
        type: string
        x-nullable: true
    version:
        properties:
            apiVersions:
                additionalProperties:
                    additionalProperties:
                        $ref: '#/definitions/apiVersion'
                    type: object
                type: object
            buildDate:
                example: "2020-02-11 16:09:08"
                type: string
            revision:
                example: ea556fc18740
                type: string
            runtimeVersion:
                example: go1.13.5
                type: string
            version:
                example: v0.9.0
                type: string
        type: object
    versionInfo:
        properties:
            arch:
                type: string
            buildDate:
                type: string
            os:
                type: string
            revision:
                type: string
            version:
                type: string
        required:
            - os
            - version
            - arch
            - buildDate
            - revision
        type: object
host: demo.ziti.dev
info:
    contact: {}
    title: Ziti Edge
    version: 0.16.3
parameters:
    authMethod:
        enum:
            - password
            - cert
        in: query
        name: method
        required: true
        type: string
    filter:
        in: query
        name: filter
        type: string
    id:
        description: The id of the requested resource
        in: path
        name: id
        required: true
        type: string
    limit:
        in: query
        name: limit
        type: integer
    offset:
        in: query
        name: offset
        type: integer
    roleFilter:
        collectionFormat: multi
        in: query
        items:
            type: string
        name: roleFilter
        type: array
    roleSemantic:
        in: query
        name: roleSemantic
        type: string
    serviceId:
        description: The id of a service
        in: path
        name: serviceId
        required: true
        type: string
    token:
        format: uuid
        in: query
        name: token
        required: true
        type: string
    token-optional:
        format: uuid
        in: query
        name: token
        type: string
paths:
    /:
        get:
            operationId: listRoot
            responses:
                "200":
                    $ref: '#/responses/listVersion'
            security: []
            summary: Returns version information
            tags:
                - Informational
    /.well-known/est/cacerts:
        get:
            description: |
                This endpoint is used during enrollments to bootstrap trust between enrolling clients and the Ziti Edge API.
                This endpoint returns a base64 encoded PKCS7 store. The content can be base64 decoded and parsed by any library
                that supports parsing PKCS7 stores.
            operationId: listWellKnownCas
            produces:
                - application/pkcs7-mime
            responses:
                "200":
                    description: A base64 encoded PKCS7 store
                    schema:
                        example: MIIMUQYJKoZIhvcNAQcCoIIMQjCCDD4CAQExADALBgkqhkiG9w0BBwGgggwkMIIG BjCCA+6gAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZcxCzAJBgNVBAYTAlVTMRcw FQYDVQQIDA5Ob3J0aCBDYXJvbGluYTESMBAGA1UEBwwJQ2hhcmxvdHRlMRMwEQYD VQQKDApOZXRGb3VuZHJ5MSkwJwYDVQQLDCBOZXRGb3VuZHJ5IENlcnRpZmljYXRl IEF1dGhvcml0eTEbMBkGA1UEAwwSTmV0Rm91bmRyeSBSb290IENBMB4XDTE4MDUx ODE2NTcyM1oXDTI4MDUxNTE2NTcyM1owgYsxCzAJBgNVBAYTAlVTMRcwFQYDVQQI DA5Ob3J0aCBDYXJvbGluYTETMBEGA1UECgwKTmV0Rm91bmRyeTEpMCcGA1UECwwg TmV0Rm91bmRyeSBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkxIzAhBgNVBAMMGk5ldEZv dW5kcnkgSW50ZXJtZWRpYXRlIENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC CgKCAgEAsb1EPhMUweS9WpjT7L54xAOmZqugJ6fhSrFfLUwNUy172q+ASvZTpT1z KIPcZpGmPB3TX2bHaAR67BbRkUR11JgWE3U8+FsGrYmPZtaKM6fg8Mh0WZ41oMYQ NJyQixOktrgqfybyJoT5PeT5AA7QQmd8mku2X9nkAu6gWPf2nHNc7SeQdijmyQQa VK3oqyaxOzWzsU/XbfMEz/ObkefUxgt5Z6jlK0xcW0Q+QgtawMKLUiuo6obWRPcl 7Hm9Sze8XJS5pbvS5JkUszxoRZuDVHZylrlHIpA/IL+BnvS+M7SP28UWe9skrv/s 6ACpJtuPJ1EYf5fakugOpY7i+hq7YNi//csbc49Qjn2OtttrR7JcTaHUEU1I/tQb QGAtNkI4pJjRVUdDawQFQlWHZD1COixNLErs2HzAI00DhLrY6SKITI/kjN0Xx010 XdMcdfay0PLWm6RwxiRmMQFL4GNIC895NF1q6xV4W4rWgqUNlcvKpy+i1chWpRbU He16ul0qh10fcESrRvAbXn5YrQJLrwbSr+85ubN8lYdNLE0qg2cIXZlUilarZZzW ghtCe+KkUpjfRuAi/CqfSwNK3QXEfeVEK6S49mHeSekOizFIw7fmDhCz9vXwMOnb ryRSLEJks0gIRcSDVChXheAqC98y4kcQdniNWFnqJXoqA+rrSokCAwEAAaNmMGQw HQYDVR0OBBYEFK8UXC/sq6dGVFAqEXHsQDzqzwuUMB8GA1UdIwQYMBaAFEHz6RRu OuXj2mwAzOeUinfWeivpMBIGA1UdEwEB/wQIMAYBAf8CAQAwDgYDVR0PAQH/BAQD AgGGMA0GCSqGSIb3DQEBCwUAA4ICAQBDAAaOE2Nbb49eOjyTNxIeOB+ZKQjJ1hUE gRrootAA8NYbtKW/vyxTWnNi5XOGXd4DFS9OKZ0mL/7NyLc0mbTwPH2ZT8KTPUTS Cpo6yktZ/7TMjyAtWZiOMg2EH+6m/nlNSXk/v5fb8+JQLdZfpxoA017dHh3tc8l7 KOskCZNwQHgF/YMXrPXUNbsGkXRuJLtpjPw5O9GvPys7p+a1aJH1WCTly9zfB6j+ rMF+UGCPDT30sxitVlohik83j6pKLgEAP/gi8nJbILlTP7ce+gJeHR2tfDvmK91X 6QgCF2STUFBU7/9H1/pPRRykOxQpAd8xqSgqGEyp9Ie4tysZjwoUEnG8IVJ5ykrI Fximvnb4B+LABV9WEo08n8m1R8wEryrISi8fBPn3Pr5nuayOfFLa15CLTkZF40FN 8ika1qNZy8bWRDwTZJQUUb7VCheRWcMwdZdNmhl3J+VZLpQ+ruW7b2ajwacHz5Nw BHKNcmxXb/4vHq/BnlcayHnSqT6036+OZQ+owDegcYmWV6LaM7xLErjHz2EE38M2 YSiW5SU1zluDe+iHb6l3Gd3Fj/X1gkMWFgYh0XPMSUSyimLNYzy4THKzmWlcQNFo LLiIDbLrMt+vk+vBkIsNTTPXRJOFPBhmIF6uIUj+2YhzNotX/pQtqMKms3pPlmHq dH6biwygETCCBhYwggP+oAMCAQICCQDquKpymLJ5WzANBgkqhkiG9w0BAQsFADCB lzELMAkGA1UEBhMCVVMxFzAVBgNVBAgMDk5vcnRoIENhcm9saW5hMRIwEAYDVQQH DAlDaGFybG90dGUxEzARBgNVBAoMCk5ldEZvdW5kcnkxKTAnBgNVBAsMIE5ldEZv dW5kcnkgQ2VydGlmaWNhdGUgQXV0aG9yaXR5MRswGQYDVQQDDBJOZXRGb3VuZHJ5 IFJvb3QgQ0EwHhcNMTgwNTE4MTY1NDQ3WhcNMzgwNTEzMTY1NDQ3WjCBlzELMAkG A1UEBhMCVVMxFzAVBgNVBAgMDk5vcnRoIENhcm9saW5hMRIwEAYDVQQHDAlDaGFy bG90dGUxEzARBgNVBAoMCk5ldEZvdW5kcnkxKTAnBgNVBAsMIE5ldEZvdW5kcnkg Q2VydGlmaWNhdGUgQXV0aG9yaXR5MRswGQYDVQQDDBJOZXRGb3VuZHJ5IFJvb3Qg Q0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDKq/Xa+749Cr3WJGYD DIEtNKIRnTFc6TeiRSm/O7hG2+1Nrh/dObjZJuDjsopWP8NFA/DwlNyEphYKAeSw HDmu+4nFd6ifoeDE2lYq6bNhLcgN+A3MlN5Phb2rnO32YYZwHXGWov+jtd2gaK0f WsH8CQxn6n2v7qvPMTeYFP8p4jqTZw2bvZWw+LMYTFCy541DFqQLQasMg10mXRAV XO7Oa9y+D1re1zLq4wS6u8ItJoKzfmvZkMvD90C/tQ4u0iJaL7GB2SE9MOPDeGVv pnoSAIkSVmvRDUAj2x9PuukykzoL1OAWzc5Cg+5LxRmLejVE7PvPcHaTtNag2tRD w2vbMeFKN8NvQH1QYcaPWZe4Vl9b6DAuTaH5RN919H/F+ZHyjZybVPwC14lflneI KyNy8JEV/YMIbEADWnuiedzDehk2Opn+0+9Zr2X/xfjCo8iWHFbNaVnQX7wdRaOo 783lEouncqe46FDBLBpyAuDKHQpIT3MK8rkC/1yBNxsH44vMweUZuK0u7PC9KHtm pQfuflYGfxA34kY6WU3jzyQHetoLYjoxTqNEEjuGpwy2o1j7RaCBEFIbYlnlbhpE WFTaQf96z2GQ6m1U3y7JyDflHSu9Fo1JNkG3qXsjDwda/6W7NRJRgdFrhnOwrm7F 6L9X4P1HnzU/VJL66LwPmiHVjQIDAQABo2MwYTAdBgNVHQ4EFgQUQfPpFG465ePa bADM55SKd9Z6K+kwHwYDVR0jBBgwFoAUQfPpFG465ePabADM55SKd9Z6K+kwDwYD VR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQADggIB ACfU74aKWROaxnue8tZb5PFkEbnDRcRrKXRhnptA0vrgB4ydnYxX9hEBZD8o6PBy 3rewvl5meSOBE6zyb4JD80lHdzHSVFIwbzsNOeEjCslv/PA/3Y+J7DCt6gPNMDeY uEssdqeSiMoYz2gnven4flSMKgTAJd3/SpVrn35HzXiU9MkmFVpPEMnTctOjw+Jn cCkG5+D9N14dxtgZ/tUfbH+GUfhyGVxRdPrX5KQqAyapMfEaMXXa8KNs7PG+sDiS WI+Sg9jUGtxgkfKdVNtFW+QMXyy7eT3iXPA+1r2hFAhgfIaGtBJUhxPHMhKtjbAg AX+6+2D3GAbaD1+lcQHhKry3hygQ3OX79FJW6zyPS0tiV/LfovHqX/3x9q5PTVBO wEOS2/LCc4R2M7S+HIPf4eSJ+nH4uCIdJ42WCror/mRsuL7geCksi70GHuCynP4y qQFszu/UtbBEsN8loTnLpOInxaGB1Y8UPm14b2Lo1/3HkoMVh0/UaHJ0TmnZ1r7m fGhfRyAZYRdvT1sB+Eb4b5A2zEZqsTc9IwFOhnI4ZilPoZ5s2xejqrVw3GSvovEh dprrQmvxuh+VQ23y/+/4z9b2xWyDu2zVveB4whqPe2rkgxJrEl4GfLk2DW+dN6j8 3Zl4lPoUZYwzkC6raCaHyFlAoaTbqz0H6rvVJYxJPS6UoQAxAA==
                        type: string
            security: []
            summary: Get CA Cert Store
            tags:
                - Well Known
    /api-sessions:
        get:
            description: |
                Returns a list of active API sessions. The resources can be sorted, filtered, and paginated. This endpoint
                requries admin access.
            operationId: listAPISessions
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            produces:
                - application/json; charset=utf-8
            responses:
                "200":
                    $ref: '#/responses/listAPISessions'
            security:
                - ztSession: []
            summary: List active API sessions
            tags:
                - API Session
    /api-sessions/{id}:
        delete:
            description: Deletes and API sesion by id. Requires admin access.
            operationId: deleteAPISessions
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "403":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Deletes an API Sessions
            tags:
                - API Session
        get:
            description: Retrieves a single API Session by id. Requires admin access.
            operationId: detailAPISessions
            responses:
                "200":
                    $ref: '#/responses/detailAPISession'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single API Session
            tags:
                - API Session
        parameters:
            - $ref: '#/parameters/id'
    /authenticate:
        parameters:
            - $ref: '#/parameters/authMethod'
        post:
            description: |
                Allows authentication  Methods include "password" and "cert"
            operationId: authenticate
            parameters:
                - in: body
                  name: auth
                  schema:
                    $ref: '#/definitions/authenticate'
            responses:
                "200":
                    $ref: '#/responses/detailCurrentAPISession'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "403":
                    $ref: '#/responses/invalidAuthResponse'
            security: []
            summary: Authenticate via a method supplied via a query string parameter
            tags:
                - Authentication
    /authenticate/mfa:
        post:
            description: Completes MFA authentication by submitting a MFA time based one time token or backup code.
            operationId: authenticateMfa
            parameters:
                - description: An MFA validation request
                  in: body
                  name: mfaAuth
                  required: true
                  schema:
                    $ref: '#/definitions/mfaCode'
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/emptyResponse'
            security:
                - ztSession: []
            summary: Complete MFA authentication
            tags:
                - Authentication
                - MFA
    /authenticators:
        get:
            description: |
                Returns a list of authenticators associated to identities. The resources can be sorted, filtered, and paginated.
                This endpoint requries admin access.
            operationId: listAuthenticators
            responses:
                "200":
                    $ref: '#/responses/listAuthenticators'
            security:
                - ztSession: []
            summary: List authenticators
            tags:
                - Authenticator
        post:
            description: |
                Creates an authenticator for a specific identity. Requires admin access.
            operationId: createAuthenticator
            parameters:
                - description: A Authenticator create object
                  in: body
                  name: authenticator
                  required: true
                  schema:
                    $ref: '#/definitions/authenticatorCreate'
            responses:
                "201":
                    description: The create was successful
                    schema:
                        $ref: '#/definitions/authenticatorCreate'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Creates an authenticator
            tags:
                - Authenticator
    /authenticators/{id}:
        delete:
            description: |
                Delete an authenticator by id. Deleting all authenticators for an identity will make it impossible to log in.
                Requires admin access.
            operationId: deleteAuthenticator
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Delete an Authenticator
            tags:
                - Authenticator
        get:
            description: Retrieves a single authenticator by id. Requires admin access.
            operationId: detailAuthenticator
            responses:
                "200":
                    $ref: '#/responses/detailAuthenticator'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single authenticator
            tags:
                - Authenticator
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on an authenticator by id. Requires admin access.
            operationId: patchAuthenticator
            parameters:
                - description: An authenticator patch object
                  in: body
                  name: authenticator
                  required: true
                  schema:
                    $ref: '#/definitions/authenticatorPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on an authenticator
            tags:
                - Authenticator
        put:
            description: Update all fields on an authenticator by id. Requires admin access.
            operationId: updateAuthenticator
            parameters:
                - description: An authenticator put object
                  in: body
                  name: authenticator
                  required: true
                  schema:
                    $ref: '#/definitions/authenticatorUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on an authenticator
            tags:
                - Authenticator
    /cas:
        get:
            description: Retrieves a list of CA resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listCas
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listCas'
            security:
                - ztSession: []
            summary: List CAs
            tags:
                - Certificate Authority
        post:
            description: Creates a CA in an unverified state. Requires admin access.
            operationId: createCa
            parameters:
                - description: A CA to create
                  in: body
                  name: ca
                  required: true
                  schema:
                    $ref: '#/definitions/caCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Creates a CA
            tags:
                - Certificate Authority
    /cas/{id}:
        delete:
            description: |
                Delete a CA by id. Deleting a CA will delete its associated certificate authenticators. This can make it
                impossible for identities to authenticate if they no longer have any valid authenticators. Requires admin access.
            operationId: deleteCa
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Delete a CA
            tags:
                - Certificate Authority
        get:
            description: Retrieves a single CA by id. Requires admin access.
            operationId: detailCa
            responses:
                "200":
                    $ref: '#/responses/detailCa'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single CA
            tags:
                - Certificate Authority
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update only the supplied fields on a CA by id. Requires admin access.
            operationId: patchCa
            parameters:
                - description: A CA patch object
                  in: body
                  name: ca
                  required: true
                  schema:
                    $ref: '#/definitions/caPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a CA
            tags:
                - Certificate Authority
        put:
            description: Update all fields on a CA by id. Requires admin access.
            operationId: updateCa
            parameters:
                - description: A CA update object
                  in: body
                  name: ca
                  required: true
                  schema:
                    $ref: '#/definitions/caUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a CA
            tags:
                - Certificate Authority
    /cas/{id}/jwt:
        get:
            description: |
                For CA auto enrollment, the enrollment JWT is static and provided on each CA resource. This endpoint provides
                the jwt as a text response.
            operationId: getCaJwt
            produces:
                - application/jwt
            responses:
                "200":
                    description: The result is the JWT text to validate the CA
                    examples:
                        application/jwt: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbSI6ImNhIiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6MTI 4MC8ifQ.Ot6lhNBSOw8ygHytdI5l7WDf9EWadOj44UPvJ0c-8mJ54fClWM3uMZrAHSSfV6KmOSZOeBBJe4VlNyoD-_MOECP0BzYSnSQP3E zJb0VlM-fFmGcKNGW157icyZNISfO43JL_Lw2QPBzTgikqSIj9eZnocC3BeAmZCHsVznnLfHWqDldcmuxnu-5MNOSrWV1x9iVcgLFlLHXK 2PLA4qIiZmlQTrQjpHJmUaoJ07mnj8hMKzxB3wBG8kpazjEo7HDRCO06aBH4eqFgf_l0iT8Dzcb31jquWMGUoSXPhf4lVJh_FiNcR1wVx- UiHLbG5h23Aqf1UJF-F38rc1FElKz0Zg
                    schema:
                        type: string
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieve the enrollment JWT for a CA
            tags:
                - Certificate Authority
        parameters:
            - $ref: '#/parameters/id'
    /cas/{id}/verify:
        parameters:
            - $ref: '#/parameters/id'
        post:
            consumes:
                - text/plain
            description: |
                Allows a CA to become verified by submitting a certificate in PEM format that has been signed by the target CA.
                The common name on the certificate must match the verificationToken property of the CA. Unverfieid CAs can not
                be used for enrollment/authentication. Requires admin access.
            operationId: verifyCa
            parameters:
                - description: A PEM formatted certificate signed by the target CA with the common name matching the CA's validationToken
                  in: body
                  name: certificate
                  required: true
                  schema:
                    type: string
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Verify a CA
            tags:
                - Certificate Authority
    /config-types:
        get:
            description: |
                Retrieves a list of config-type resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listConfigTypes
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listConfigTypes'
            security:
                - ztSession: []
            summary: List config-types
            tags:
                - Config
        post:
            operationId: createConfigType
            parameters:
                - description: A config-type to create
                  in: body
                  name: configType
                  required: true
                  schema:
                    $ref: '#/definitions/configTypeCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a config-type. Requires admin access.
            tags:
                - Config
    /config-types/{id}:
        delete:
            description: Delete a config-type by id. Removing a configuration type that are in use will result in a 409 conflict HTTP status code and error. All configurations of a type must be removed first.
            operationId: deleteConfigType
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a config-type
            tags:
                - Config
        get:
            description: Retrieves a single config-type by id. Requires admin access.
            operationId: detailConfigType
            responses:
                "200":
                    $ref: '#/responses/detailConfigType'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single config-type
            tags:
                - Config
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a config-type. Requires admin access.
            operationId: patchConfigType
            parameters:
                - description: A config-type patch object
                  in: body
                  name: configType
                  required: true
                  schema:
                    $ref: '#/definitions/configTypePatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a config-type
            tags:
                - Config
        put:
            description: Update all fields on a config-type by id. Requires admin access.
            operationId: updateConfigType
            parameters:
                - description: A config-type update object
                  in: body
                  name: configType
                  required: true
                  schema:
                    $ref: '#/definitions/configTypeUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a config-type
            tags:
                - Config
    /config-types/{id}/configs:
        get:
            description: Lists the configs associated to a config-type. Requires admin access.
            operationId: listConfigsForConfigType
            responses:
                "200":
                    $ref: '#/responses/listConfigs'
            security:
                - ztSession: []
            summary: Lists the configs of a specific config-type
            tags:
                - Config
        parameters:
            - $ref: '#/parameters/id'
    /configs:
        get:
            description: |
                Retrieves a list of config resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listConfigs
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listConfigs'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List configs
            tags:
                - Config
        post:
            description: Create a config resource. Requires admin access.
            operationId: createConfig
            parameters:
                - description: A config to create
                  in: body
                  name: config
                  required: true
                  schema:
                    $ref: '#/definitions/configCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a config resource
            tags:
                - Config
    /configs/{id}:
        delete:
            description: Delete a config by id. Requires admin access.
            operationId: deleteConfig
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a config
            tags:
                - Config
        get:
            description: Retrieves a single config by id. Requires admin access.
            operationId: detailConfig
            responses:
                "200":
                    $ref: '#/responses/detailConfig'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single config
            tags:
                - Config
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a config. Requires admin access.
            operationId: patchConfig
            parameters:
                - description: A config patch object
                  in: body
                  name: config
                  required: true
                  schema:
                    $ref: '#/definitions/configPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a config
            tags:
                - Config
        put:
            description: Update all fields on a config by id. Requires admin access.
            operationId: updateConfig
            parameters:
                - description: A config update object
                  in: body
                  name: config
                  required: true
                  schema:
                    $ref: '#/definitions/configUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a config
            tags:
                - Config
    /current-api-session:
        delete:
            description: Terminates the current API session
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Logout
            tags:
                - Current API Session
        get:
            description: Retrieves the API session that was used to issue the current request
            operationId: getCurrentAPISession
            responses:
                "200":
                    $ref: '#/responses/detailCurrentAPISession'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Return the current API session
            tags:
                - Current API Session
    /current-api-session/certificates:
        get:
            description: Retrieves a list of certificate resources for the current API session; supports filtering, sorting, and pagination
            operationId: listCurrentApiSessionCertificates
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listCurrentApiSessionCertificates'
            security:
                - ztSession: []
            summary: List the ephemeral certificates available for the current API Session
            tags:
                - Current API Session
        post:
            description: Creates an ephemeral certificate for the current API Session. This endpoint expects a PEM encoded CSRs to be provided for fulfillment as a property of a JSON payload. It is up to the client to manage the private key backing the CSR request.
            operationId: createCurrentApiSessionCertificate
            parameters:
                - description: The payload describing the CSR used to create a session certificate
                  in: body
                  name: sessionCertificate
                  required: true
                  schema:
                    $ref: '#/definitions/currentApiSessionCertificateCreate'
            responses:
                "201":
                    $ref: '#/responses/createCurrentApiSessionCertificateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Creates an ephemeral certificate for the current API Session
            tags:
                - Current API Session
    /current-api-session/certificates/{id}:
        delete:
            description: |
                Delete an ephemeral certificateby id
            operationId: deleteCurrentApiSessionCertificate
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Delete an ephemeral certificate
            tags:
                - Current API Session
        get:
            description: Retrieves a single ephemeral certificate by id
            operationId: detailCurrentApiSessionCertificate
            responses:
                "200":
                    $ref: '#/responses/detailCurrentApiSessionCertificate'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves an ephemeral certificate
            tags:
                - Current API Session
        parameters:
            - $ref: '#/parameters/id'
    /current-api-session/service-updates:
        get:
            description: |
                Retrieves data indicating the last time data relevant to this API Session was altered that would necessitate
                service refreshes.
            operationId: listServiceUpdates
            responses:
                "200":
                    $ref: '#/responses/listCurrentApiSessionServiceUpdates'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Returns data indicating whether a client should updates it service list
            tags:
                - Current API Session
                - Services
    /current-identity:
        get:
            description: Returns the identity associated with the API sessions used to issue the current request
            operationId: getCurrentIdentity
            responses:
                "200":
                    $ref: '#/responses/detailCurrentIdentity'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Return the current identity
            tags:
                - Current Identity
    /current-identity/authenticators:
        get:
            description: Retrieves a list of authenticators assigned to the current API session's identity; supports filtering, sorting, and pagination.
            operationId: listCurrentIdentityAuthenticators
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listAuthenticators'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List authenticators for the current identity
            tags:
                - Current API Session
    /current-identity/authenticators/{id}:
        get:
            description: Retrieves a single authenticator by id. Will only show authenticators assigned to the API session's identity.
            operationId: detailCurrentIdentityAuthenticator
            responses:
                "200":
                    $ref: '#/responses/detailAuthenticator'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieve an authenticator for the current identity
            tags:
                - Current API Session
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: |
                Update the supplied fields on an authenticator by id. Will only update authenticators assigned to the API
                session's identity.
            operationId: patchCurrentIdentityAuthenticator
            parameters:
                - description: An authenticator patch object
                  in: body
                  name: authenticator
                  required: true
                  schema:
                    $ref: '#/definitions/authenticatorPatchWithCurrent'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on an authenticator of this identity
            tags:
                - Current API Session
        put:
            description: |
                Update all fields on an authenticator by id.  Will only update authenticators assigned to the API session's
                identity.
            operationId: updateCurrentIdentityAuthenticator
            parameters:
                - description: An authenticator put object
                  in: body
                  name: authenticator
                  required: true
                  schema:
                    $ref: '#/definitions/authenticatorUpdateWithCurrent'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on an authenticator of this identity
            tags:
                - Current API Session
    /current-identity/edge-routers:
        get:
            description: |
                Lists the Edge Routers that the current identity has access to via policies. The data returned
                includes their address and online status
            operationId: getCurrentIdentityEdgeRouters
            responses:
                "200":
                    $ref: '#/responses/listCurrentIdentityEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Return this list of Edge Routers the identity has access to
            tags:
                - Current Identity
                - Edge Router
    /current-identity/mfa:
        delete:
            description: |
                Disable MFA for the current identity. Requires a current valid time based one time password if MFA enrollment has been completed. If not, code should be an empty string. If one time passwords are not available and admin account can be used to remove MFA from the identity via `DELETE /identities/<id>/mfa`.
            operationId: deleteMfa
            parameters:
                - description: An MFA validation request
                  in: body
                  name: mfaValidation
                  schema:
                    $ref: '#/definitions/mfaCode'
                - in: header
                  name: mfa-validation-code
                  type: string
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Disable MFA for the current identity
            tags:
                - Current Identity
                - MFA
        get:
            description: |
                Returns details about the current MFA enrollment. If enrollment has not been completed it will return the current MFA configuration details necessary to complete a `POST /current-identity/mfa/verify`.
            operationId: detailMfa
            responses:
                "200":
                    $ref: '#/responses/detailMfa'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Returns the current status of MFA enrollment
            tags:
                - Current Identity
                - MFA
        post:
            description: |
                Allows authenticator based MFA enrollment. If enrollment has already been completed, it must be disabled before attempting to re-enroll. Subsequent enrollment request is completed via `POST /current-identity/mfa/verify`
            operationId: enrollMfa
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/alreadyMfaEnrolledResponse'
            security:
                - ztSession: []
            summary: Initiate MFA enrollment
            tags:
                - Current Identity
                - MFA
    /current-identity/mfa/qr-code:
        get:
            description: |
                Shows an QR code image for unverified MFA enrollments. 404s if the MFA enrollment has been completed or not started.
            operationId: detailMfaQrCode
            produces:
                - image/png
                - application/json
            responses:
                "200":
                    description: OK
                "404":
                    description: No MFA enrollment or MFA enrollment is completed
            security:
                - ztSession: []
            summary: Show a QR code for unverified MFA enrollments
            tags:
                - Current Identity
                - MFA
    /current-identity/mfa/recovery-codes:
        get:
            description: |
                Allows the viewing of recovery codes of an MFA enrollment. Requires a current valid time based one time password to interact with. Available after a completed MFA enrollment.
            operationId: detailMfaRecoveryCodes
            parameters:
                - description: An MFA validation request
                  in: body
                  name: mfaValidation
                  schema:
                    $ref: '#/definitions/mfaCode'
                - in: header
                  name: mfa-validation-code
                  type: string
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: For a completed MFA enrollment view the current recovery codes
            tags:
                - Current Identity
                - MFA
        post:
            description: |
                Allows regeneration of recovery codes of an MFA enrollment. Requires a current valid time based one time password to interact with. Available after a completed MFA enrollment. This replaces all existing recovery codes.
            operationId: createMfaRecoveryCodes
            parameters:
                - description: An MFA validation request
                  in: body
                  name: mfaValidation
                  required: true
                  schema:
                    $ref: '#/definitions/mfaCode'
            responses:
                "200":
                    $ref: '#/responses/detailMfaRecoveryCodes'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: For a completed MFA enrollment regenerate the recovery codes
            tags:
                - Current Identity
                - MFA
    /current-identity/mfa/verify:
        post:
            description: |
                Completes MFA enrollment by accepting a time based one time password as verification. Called after MFA enrollment has been initiated via `POST /current-identity/mfa`.
            operationId: verifyMfa
            parameters:
                - description: An MFA validation request
                  in: body
                  name: mfaValidation
                  required: true
                  schema:
                    $ref: '#/definitions/mfaCode'
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Complete MFA enrollment by verifying a time based one time token
            tags:
                - Current Identity
                - MFA
    /database/check-data-integrity:
        post:
            description: Starts a data integrity scan on the datastore. Requires admin access. Only once instance may run at a time, including runs of fixDataIntegrity.
            operationId: checkDataIntegrity
            responses:
                "202":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "429":
                    $ref: '#/responses/rateLimitedResponse'
            security:
                - ztSession: []
            summary: Starts a data integrity scan on the datastore
            tags:
                - Database
    /database/data-integrity-results:
        get:
            description: Returns any results found from in-progress integrity checks. Requires admin access.
            operationId: dataIntegrityResults
            responses:
                "200":
                    $ref: '#/responses/dataIntegrityCheckResult'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Returns any results found from in-progress integrity checks
            tags:
                - Database
    /database/fix-data-integrity:
        post:
            description: Runs a data integrity scan on the datastore, attempts to fix any issues it can, and returns any found issues. Requires admin access. Only once instance may run at a time, including runs of checkDataIntegrity.
            operationId: fixDataIntegrity
            responses:
                "202":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "429":
                    $ref: '#/responses/rateLimitedResponse'
            security:
                - ztSession: []
            summary: Runs a data integrity scan on the datastore, attempts to fix any issues it can and returns any found issues
            tags:
                - Database
    /database/snapshot:
        post:
            description: Create a new database snapshot. Requires admin access.
            operationId: createDatabaseSnapshot
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "429":
                    $ref: '#/responses/rateLimitedResponse'
            security:
                - ztSession: []
            summary: Create a new database snapshot
            tags:
                - Database
    /edge-router-policies:
        get:
            description: |
                Retrieves a list of edge router policy resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouterPolicies
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouterPolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List edge router policies
            tags:
                - Edge Router Policy
        post:
            description: Create an edge router policy resource. Requires admin access.
            operationId: createEdgeRouterPolicy
            parameters:
                - description: An edge router policy to create
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/edgeRouterPolicyCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create an edge router policy resource
            tags:
                - Edge Router Policy
    /edge-router-policies/{id}:
        delete:
            description: Delete an edge router policy by id. Requires admin access.
            operationId: deleteEdgeRouterPolicy
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete an edge router policy
            tags:
                - Edge Router Policy
        get:
            description: Retrieves a single edge router policy by id. Requires admin access.
            operationId: detailEdgeRouterPolicy
            responses:
                "200":
                    $ref: '#/responses/detailEdgeRouterPolicy'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single edge router policy
            tags:
                - Edge Router Policy
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on an edge router policy. Requires admin access.
            operationId: patchEdgeRouterPolicy
            parameters:
                - description: An edge router policy patch object
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/edgeRouterPolicyPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on an edge router policy
            tags:
                - Edge Router Policy
        put:
            description: Update all fields on an edge router policy by id. Requires admin access.
            operationId: updateEdgeRouterPolicy
            parameters:
                - description: An edge router policy update object
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/edgeRouterPolicyUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on an edge router policy
            tags:
                - Edge Router Policy
    /edge-router-policies/{id}/edge-routers:
        get:
            description: |
                Retrieves a list of edge routers an edge router policy resources affects; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouterPolicyEdgeRouters
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List edge routers a policy affects
            tags:
                - Edge Router Policy
        parameters:
            - $ref: '#/parameters/id'
    /edge-router-policies/{id}/identities:
        get:
            description: |
                Retrieves a list of identities an edge router policy resources affects; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouterPolicyIdentities
            responses:
                "200":
                    $ref: '#/responses/listIdentities'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List identities an edge router policy affects
            tags:
                - Edge Router Policy
        parameters:
            - $ref: '#/parameters/id'
    /edge-router-role-attributes:
        get:
            description: |
                Retrieves a list of role attributes in use by edge routers; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouterRoleAttributes
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listRoleAttributes'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List role attributes in use by edge routers
            tags:
                - Role Attributes
    /edge-routers:
        get:
            description: |
                Retrieves a list of edge router resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouters
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
                - $ref: '#/parameters/roleFilter'
                - $ref: '#/parameters/roleSemantic'
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List edge routers
            tags:
                - Edge Router
        post:
            description: Create a edge router resource. Requires admin access.
            operationId: createEdgeRouter
            parameters:
                - description: A edge router to create
                  in: body
                  name: edgeRouter
                  required: true
                  schema:
                    $ref: '#/definitions/edgeRouterCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create an edge router
            tags:
                - Edge Router
    /edge-routers/{id}:
        delete:
            description: Delete an edge router by id. Requires admin access.
            operationId: deleteEdgeRouter
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete an edge router
            tags:
                - Edge Router
        get:
            description: Retrieves a single edge router by id. Requires admin access.
            operationId: detailEdgeRouter
            responses:
                "200":
                    $ref: '#/responses/detailEdgeRouter'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single edge router
            tags:
                - Edge Router
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on an edge router. Requires admin access.
            operationId: patchEdgeRouter
            parameters:
                - description: An edge router patch object
                  in: body
                  name: edgeRouter
                  required: true
                  schema:
                    $ref: '#/definitions/edgeRouterPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on an edge router
            tags:
                - Edge Router
        put:
            description: Update all fields on an edge router by id. Requires admin access.
            operationId: updateEdgeRouter
            parameters:
                - description: An edge router update object
                  in: body
                  name: edgeRouter
                  required: true
                  schema:
                    $ref: '#/definitions/edgeRouterUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on an edge router
            tags:
                - Edge Router
    /edge-routers/{id}/edge-router-policies:
        get:
            description: Retrieves a list of edge router policies that apply to the specified edge router.
            operationId: listEdgeRouterEdgeRouterPolicies
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouterPolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the edge router policies that affect an edge router
            tags:
                - Edge Router
        parameters:
            - $ref: '#/parameters/id'
    /edge-routers/{id}/identities:
        get:
            description: |
                Retrieves a list of identities that may access services via the given edge router. Supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouterIdentities
            responses:
                "200":
                    $ref: '#/responses/listIdentities'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List associated identities
            tags:
                - Edge Router
        parameters:
            - $ref: '#/parameters/id'
    /edge-routers/{id}/service-edge-router-policies:
        get:
            description: Retrieves a list of service policies policies that apply to the specified edge router.
            operationId: listEdgeRouterServiceEdgeRouterPolicies
            responses:
                "200":
                    $ref: '#/responses/listServicePolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the service policies that affect an edge router
            tags:
                - Edge Router
        parameters:
            - $ref: '#/parameters/id'
    /edge-routers/{id}/services:
        get:
            description: |
                Retrieves a list of services that may be accessed via the given edge router. Supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEdgeRouterServices
            responses:
                "200":
                    $ref: '#/responses/listServices'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List associated services
            tags:
                - Edge Router
        parameters:
            - $ref: '#/parameters/id'
    /enroll:
        parameters:
            - $ref: '#/parameters/token-optional'
        post:
            consumes:
                - application/pkcs10
                - application/json
                - application/x-pem-file
                - text/plain
            description: endpoint defers to the logic in the more specific `enroll/*` endpoints
            operationId: enroll
            produces:
                - application/x-pem-file
                - application/json
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            summary: Legacy enrollment endpoint
            tags:
                - Enroll
    /enroll/ca:
        post:
            description: |
                For CA auto enrollment, an identity is not created beforehand.
                Instead one will be created during enrollment. The client will present a client certificate that is signed by a
                Certificate Authority that has been added and verified (See POST /cas and POST /cas/{id}/verify).

                During this process no CSRs are requires as the client should already be in possession of a valid certificate.
            operationId: enrollCa
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            summary: Enroll an identity with a pre-exchanged certificate
            tags:
                - Enroll
    /enroll/erott:
        parameters:
            - $ref: '#/parameters/token'
        post:
            description: |
                Enrolls an edge-router via a one-time-token to establish a certificate based identity.
            operationId: enrollErOtt
            responses:
                "200":
                    $ref: '#/responses/erottResponse'
            summary: Enroll an edge-router
            tags:
                - Enroll
    /enroll/extend/router:
        post:
            description: |
                Allows a router to extend its certificates' expiration date by
                using its current and valid client certificate to submit a CSR. This CSR may
                be pased in using a new private key, thus allowing private key rotation or swapping.

                After completion any new connections must be made with certificates returned from a 200 OK
                response. Previous client certificate is rendered invalid for use with the controller even if it
                has not expired.

                This request must be made using the existing, valid, client certificate.
            operationId: extendRouterEnrollment
            parameters:
                - in: body
                  name: routerExtendEnrollmentRequest
                  required: true
                  schema:
                    $ref: '#/definitions/routerExtendEnrollmentRequest'
            responses:
                "200":
                    $ref: '#/responses/routerExtendEnrollmentResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            summary: Extend the life of a currently enrolled router's certificates
            tags:
                - Enroll
                - Extend Enrollment
    /enroll/ott:
        parameters:
            - $ref: '#/parameters/token'
        post:
            consumes:
                - application/pkcs10
            description: |
                Enroll an identity via a one-time-token which is supplied via a query string parameter. This enrollment method
                expects a PEM encoded CSRs to be provided for fulfillment. It is up to the enrolling identity to manage the
                private key backing the CSR request.
            operationId: enrollOtt
            produces:
                - application/x-x509-user-cert
            responses:
                "200":
                    $ref: '#/responses/zitiSignedCert'
                "404":
                    $ref: '#/responses/notFoundResponse'
            summary: Enroll an identity via one-time-token
            tags:
                - Enroll
    /enroll/ottca:
        parameters:
            - $ref: '#/parameters/token'
        post:
            description: |
                Enroll an identity via a one-time-token that also requires a pre-exchanged client certificate to match a
                Certificate Authority that has been added and verified (See POST /cas and POST /cas{id}/verify). The client
                must present a client certificate signed by CA associated with the enrollment. This enrollment is similar to
                CA auto enrollment except that is required the identity to be pre-created.

                As the client certificate has been pre-exchanged there is no CSR input to this enrollment method.
            operationId: enrollOttCa
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
            summary: Enroll an identity via one-time-token with a pre-exchanged client certificate
            tags:
                - Enroll
    /enroll/updb:
        parameters:
            - $ref: '#/parameters/token'
        post:
            description: |
                Enrolls an identity via a one-time-token to establish an initial username and password combination
            operationId: ernollUpdb
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            summary: Enroll an identity via one-time-token
            tags:
                - Enroll
    /enrollments:
        get:
            description: |
                Retrieves a list of outstanding enrollments; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listEnrollments
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listEnrollments'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List outstanding enrollments
            tags:
                - Enrollment
    /enrollments/{id}:
        delete:
            description: Delete an outstanding enrollment by id. Requires admin access.
            operationId: deleteEnrollment
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Delete an outstanding enrollment
            tags:
                - Enrollment
        get:
            description: Retrieves a single outstanding enrollment by id. Requires admin access.
            operationId: detailEnrollment
            responses:
                "200":
                    $ref: '#/responses/detailEnrollment'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves an outstanding enrollment
            tags:
                - Enrollment
        parameters:
            - $ref: '#/parameters/id'
    /geo-regions:
        get:
            description: |
                Retrieves a list of geo-regions; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listGeoRegions
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listGeoRegions'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List available geo-regions
            tags:
                - Geo Region
    /geo-regions/{id}:
        get:
            description: Retrieves a single geo-region by id. Requires admin access.
            operationId: detailGeoRegion
            responses:
                "200":
                    $ref: '#/responses/detailGeoRegion'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a geo-region
            tags:
                - Geo Region
        parameters:
            - $ref: '#/parameters/id'
    /identities:
        get:
            description: |
                Retrieves a list of identity resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listIdentities
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
                - $ref: '#/parameters/roleFilter'
                - $ref: '#/parameters/roleSemantic'
            responses:
                "200":
                    $ref: '#/responses/listIdentities'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List identities
            tags:
                - Identity
        post:
            description: Create an identity resource. Requires admin access.
            operationId: createIdentity
            parameters:
                - description: An identity to create
                  in: body
                  name: identity
                  required: true
                  schema:
                    $ref: '#/definitions/identityCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create an identity resource
            tags:
                - Identity
    /identities/{id}:
        delete:
            description: Delete an identity by id. Requires admin access.
            operationId: deleteIdentity
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete an identity
            tags:
                - Identity
        get:
            description: Retrieves a single identity by id. Requires admin access.
            operationId: detailIdentity
            responses:
                "200":
                    $ref: '#/responses/detailIdentity'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single identity
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on an identity. Requires admin access.
            operationId: patchIdentity
            parameters:
                - description: An identity patch object
                  in: body
                  name: identity
                  required: true
                  schema:
                    $ref: '#/definitions/identityPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on an identity
            tags:
                - Identity
        put:
            description: Update all fields on an identity by id. Requires admin access.
            operationId: updateIdentity
            parameters:
                - description: An identity update object
                  in: body
                  name: identity
                  required: true
                  schema:
                    $ref: '#/definitions/identityUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on an identity
            tags:
                - Identity
    /identities/{id}/edge-router-policies:
        get:
            description: Retrieves a list of edge router policies that apply to the specified identity.
            operationId: listIdentitysEdgeRouterPolicies
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouterPolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the edge router policies that affect an idenitty
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /identities/{id}/edge-routers:
        get:
            description: |
                Retrieves a list of edge-routers that the given identity may use to access services. Supports filtering, sorting, and pagination. Requires admin access.
            operationId: listIdentityEdgeRouters
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List accessible edge-routers
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /identities/{id}/failed-service-requests:
        get:
            description: |
                Returns a list of service session requests that failed due to posture checks. The entries will contain
                every policy that was verified against and every failed check in each policy. Each check will include
                the historical posture data and posture check configuration.
            operationId: getIdentityFailedServiceRequests
            responses:
                "200":
                    $ref: '#/responses/getIdentityFailedServiceRequest'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieve a list of the most recent service failure requests due to posture checks
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /identities/{id}/mfa:
        delete:
            description: |
                Allows an admin to remove MFA enrollment from a specific identity. Requires admin.
            operationId: removeIdentityMfa
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Remove MFA from an identitity
            tags:
                - Identity
                - MFA
        parameters:
            - $ref: '#/parameters/id'
    /identities/{id}/policy-advice/{serviceId}:
        get:
            description: |
                Analyzes policies to see if the given identity should be able to dial or bind the given service. |
                Will check services policies to see if the identity can access the service. Will check edge router policies |
                to check if the identity and service have access to common edge routers so that a connnection can be made. |
                Will also check if at least one edge router is on-line. Requires admin access.
            operationId: getIdentityPolicyAdvice
            responses:
                "200":
                    $ref: '#/responses/getIdentityPolicyAdvice'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Analyze policies relating the given identity and service
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
            - $ref: '#/parameters/serviceId'
    /identities/{id}/posture-data:
        get:
            description: |
                Returns a nested map data represeting the posture data of the identity.
                This data should be considered volatile.
            operationId: getIdentityPostureData
            responses:
                "200":
                    $ref: '#/responses/getIdentityPostureData'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieve the curent posture data for a specific identity.
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /identities/{id}/service-configs:
        delete:
            description: Remove service configs from a specific identity
            operationId: disassociateIdentitysServiceConfigs
            parameters:
                - description: An array of service and config id pairs to remove
                  in: body
                  name: serviceConfigIdPairs
                  schema:
                    $ref: '#/definitions/serviceConfigsAssignList'
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Remove associated service configs from a specific identity
            tags:
                - Identity
        get:
            description: Retrieves a list of service configs associated to a specific identity
            operationId: listIdentitysServiceConfigs
            responses:
                "200":
                    $ref: '#/responses/listServiceConfigs'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the service configs associated a specific identity
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
        post:
            description: Associate service configs to a specific identity
            operationId: associateIdentitysServiceConfigs
            parameters:
                - description: A service config patch object
                  in: body
                  name: serviceConfigs
                  required: true
                  schema:
                    $ref: '#/definitions/serviceConfigsAssignList'
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Associate service configs for a specific identity
            tags:
                - Identity
    /identities/{id}/service-policies:
        get:
            description: Retrieves a list of service policies that apply to the specified identity.
            operationId: listIdentityServicePolicies
            responses:
                "200":
                    $ref: '#/responses/listServicePolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the service policies that affect an identity
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /identities/{id}/services:
        get:
            description: |
                Retrieves a list of services that the given identity has access to. Supports filtering, sorting, and pagination. Requires admin access.
            operationId: listIdentityServices
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List accessible services
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /identity-role-attributes:
        get:
            description: |
                Retrieves a list of role attributes in use by identities; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listIdentityRoleAttributes
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listRoleAttributes'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List role attributes in use by identities
            tags:
                - Role Attributes
    /identity-types:
        get:
            description: |
                Retrieves a list of identity types; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listIdentityTypes
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listIdentityTypes'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List available identity types
            tags:
                - Identity
    /identity-types/{id}:
        get:
            description: Retrieves a single identity type by id. Requires admin access.
            operationId: detailIdentityType
            responses:
                "200":
                    $ref: '#/responses/detailIdentityType'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a identity type
            tags:
                - Identity
        parameters:
            - $ref: '#/parameters/id'
    /posture-check-types:
        get:
            description: |
                Retrieves a list of posture check types
            operationId: listPostureCheckTypes
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            produces:
                - application/json; charset=utf-8
            responses:
                "200":
                    $ref: '#/responses/listPostureCheckTypes'
            security:
                - ztSession: []
            summary: List a subset of posture check types
            tags:
                - Posture Checks
    /posture-check-types/{id}:
        get:
            description: Retrieves a single posture check type by id
            operationId: detailPostureCheckType
            responses:
                "200":
                    $ref: '#/responses/detailPostureCheckType'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single posture check type
            tags:
                - Posture Checks
        parameters:
            - $ref: '#/parameters/id'
    /posture-checks:
        get:
            description: |
                Retrieves a list of posture checks
            operationId: listPostureChecks
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
                - $ref: '#/parameters/roleFilter'
                - $ref: '#/parameters/roleSemantic'
            produces:
                - application/json; charset=utf-8
            responses:
                "200":
                    $ref: '#/responses/listPostureChecks'
            security:
                - ztSession: []
            summary: List a subset of posture checks
            tags:
                - Posture Checks
        post:
            description: Creates a Posture Checks
            operationId: createPostureCheck
            parameters:
                - description: A Posture Check to create
                  in: body
                  name: postureCheck
                  required: true
                  schema:
                    $ref: '#/definitions/PostureCheckCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Creates a Posture Checks
            tags:
                - Posture Checks
    /posture-checks/{id}:
        delete:
            description: Deletes and Posture Checks by id
            operationId: deletePostureCheck
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "403":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Deletes an Posture Checks
            tags:
                - Posture Checks
        get:
            description: Retrieves a single Posture Checks by id
            operationId: detailPostureCheck
            responses:
                "200":
                    $ref: '#/responses/detailPostureCheck'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single Posture Checks
            tags:
                - Posture Checks
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update only the supplied fields on a Posture Checks by id
            operationId: patchPostureCheck
            parameters:
                - description: A Posture Check patch object
                  in: body
                  name: postureCheck
                  required: true
                  schema:
                    $ref: '#/definitions/PostureCheckPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a Posture Checks
            tags:
                - Posture Checks
        put:
            description: Update all fields on a Posture Checks by id
            operationId: updatePostureCheck
            parameters:
                - description: A Posture Check update object
                  in: body
                  name: postureCheck
                  required: true
                  schema:
                    $ref: '#/definitions/PostureCheckUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a Posture Checks
            tags:
                - Posture Checks
    /posture-response:
        post:
            description: Submits posture responses
            operationId: createPostureResponse
            parameters:
                - description: A Posture Response
                  in: body
                  name: postureResponse
                  required: true
                  schema:
                    $ref: '#/definitions/PostureResponseCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Submit a posture response to a posture query
            tags:
                - Posture Checks
    /posture-response-bulk:
        post:
            description: Submits posture responses
            operationId: createPostureResponseBulk
            parameters:
                - description: A Posture Response
                  in: body
                  name: postureResponse
                  required: true
                  schema:
                    items:
                        $ref: '#/definitions/PostureResponseCreate'
                    type: array
            responses:
                "200":
                    $ref: '#/responses/emptyResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Submit multiple posture responses
            tags:
                - Posture Checks
    /protocols:
        get:
            operationId: listProtocols
            responses:
                "200":
                    $ref: '#/responses/listProtocols'
            security: []
            summary: Return a list of the listening Edge protocols
            tags:
                - Informational
    /service-edge-router-policies:
        get:
            description: |
                Retrieves a list of service edge router policy resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceEdgeRouterPolicies
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listServiceEdgeRouterPolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List service edge router policies
            tags:
                - Service Edge Router Policy
        post:
            description: Create a service edge router policy resource. Requires admin access.
            operationId: createServiceEdgeRouterPolicy
            parameters:
                - description: A service edge router policy to create
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/serviceEdgeRouterPolicyCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a service edge router policy resource
            tags:
                - Service Edge Router Policy
    /service-edge-router-policies/{id}:
        delete:
            description: Delete a service edge policy by id. Requires admin access.
            operationId: deleteServiceEdgeRouterPolicy
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a service edge policy
            tags:
                - Service Edge Router Policy
        get:
            description: Retrieves a single service edge policy by id. Requires admin access.
            operationId: detailServiceEdgeRouterPolicy
            responses:
                "200":
                    $ref: '#/responses/detailServiceEdgePolicy'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single service edge policy
            tags:
                - Service Edge Router Policy
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a service edge policy. Requires admin access.
            operationId: patchServiceEdgeRouterPolicy
            parameters:
                - description: A service edge router policy patch object
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/serviceEdgeRouterPolicyPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a service edge policy
            tags:
                - Service Edge Router Policy
        put:
            description: Update all fields on a service edge policy by id. Requires admin access.
            operationId: updateServiceEdgeRouterPolicy
            parameters:
                - description: A service edge router policy update object
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/serviceEdgeRouterPolicyUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a service edge policy
            tags:
                - Service Edge Router Policy
    /service-edge-router-policies/{id}/edge-routers:
        get:
            description: List the edge routers that a service edge router policy applies to
            operationId: listServiceEdgeRouterPolicyEdgeRouters
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the edge routers that a service edge router policy applies to
            tags:
                - Service Edge Router Policy
        parameters:
            - $ref: '#/parameters/id'
    /service-edge-router-policies/{id}/services:
        get:
            description: List the services that a service edge router policy applies to
            operationId: listServiceEdgeRouterPolicyServices
            responses:
                "200":
                    $ref: '#/responses/listServices'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: List the services that a service edge router policy applies to
            tags:
                - Service Edge Router Policy
        parameters:
            - $ref: '#/parameters/id'
    /service-policies:
        get:
            description: |
                Retrieves a list of service policy resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServicePolicies
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listServicePolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List service policies
            tags:
                - Service Policy
        post:
            description: Create a service policy resource. Requires admin access.
            operationId: createServicePolicy
            parameters:
                - description: A service policy to create
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/servicePolicyCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a service policy resource
            tags:
                - Service Policy
    /service-policies/{id}:
        delete:
            description: Delete a service policy by id. Requires admin access.
            operationId: deleteServicePolicy
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a service policy
            tags:
                - Service Policy
        get:
            description: Retrieves a single service policy by id. Requires admin access.
            operationId: detailServicePolicy
            responses:
                "200":
                    $ref: '#/responses/detailServicePolicy'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single service policy
            tags:
                - Service Policy
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a service policy. Requires admin access.
            operationId: patchServicePolicy
            parameters:
                - description: A service policy patch object
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/servicePolicyPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a service policy
            tags:
                - Service Policy
        put:
            description: Update all fields on a service policy by id. Requires admin access.
            operationId: updateServicePolicy
            parameters:
                - description: A service policy update object
                  in: body
                  name: policy
                  required: true
                  schema:
                    $ref: '#/definitions/servicePolicyUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a service policy
            tags:
                - Service Policy
    /service-policies/{id}/identities:
        get:
            description: |
                Retrieves a list of identity resources that are affected by a service policy; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServicePolicyIdentities
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listIdentities'
                "400":
                    $ref: '#/responses/notFoundResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List identities a service policy affects
            tags:
                - Service Policy
        parameters:
            - $ref: '#/parameters/id'
    /service-policies/{id}/posture-checks:
        get:
            description: |
                Retrieves a list of posture check resources that are affected by a service policy; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServicePolicyPostureChecks
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listPostureChecks'
                "400":
                    $ref: '#/responses/notFoundResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List posture check a service policy includes
            tags:
                - Service Policy
        parameters:
            - $ref: '#/parameters/id'
    /service-policies/{id}/services:
        get:
            description: |
                Retrieves a list of service resources that are affected by a service policy; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServicePolicyServices
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listServices'
                "400":
                    $ref: '#/responses/notFoundResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List services a service policy affects
            tags:
                - Service Policy
        parameters:
            - $ref: '#/parameters/id'
    /service-role-attributes:
        get:
            description: |
                Retrieves a list of role attributes in use by services; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceRoleAttributes
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listRoleAttributes'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List role attributes in use by services
            tags:
                - Role Attributes
    /services:
        get:
            description: |
                Retrieves a list of config resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServices
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
                - $ref: '#/parameters/roleFilter'
                - $ref: '#/parameters/roleSemantic'
            responses:
                "200":
                    $ref: '#/responses/listServices'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List services
            tags:
                - Service
        post:
            description: Create a services resource. Requires admin access.
            operationId: createService
            parameters:
                - description: A service to create
                  in: body
                  name: service
                  required: true
                  schema:
                    $ref: '#/definitions/serviceCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a services resource
            tags:
                - Service
    /services/{id}:
        delete:
            description: Delete a service by id. Requires admin access.
            operationId: deleteService
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a service
            tags:
                - Service
        get:
            description: Retrieves a single service by id. Requires admin access.
            operationId: detailService
            responses:
                "200":
                    $ref: '#/responses/detailService'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single service
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a service. Requires admin access.
            operationId: patchService
            parameters:
                - description: A service patch object
                  in: body
                  name: service
                  required: true
                  schema:
                    $ref: '#/definitions/servicePatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a service
            tags:
                - Service
        put:
            description: Update all fields on a service by id. Requires admin access.
            operationId: updateService
            parameters:
                - description: A service update object
                  in: body
                  name: service
                  required: true
                  schema:
                    $ref: '#/definitions/serviceUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a service
            tags:
                - Service
    /services/{id}/configs:
        get:
            description: |
                Retrieves a list of config resources associated to a specific service; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceConfig
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listConfigs'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List configs associated to a specific service
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
    /services/{id}/edge-routers:
        get:
            description: |
                Retrieves a list of edge-routers that may be used to access the given service. Supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceEdgeRouters
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listEdgeRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List accessible edge-routers
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
    /services/{id}/identities:
        get:
            description: |
                Retrieves a list of identities that have access to this service. Supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceIdentities
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listIdentities'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List identities with access
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
    /services/{id}/service-edge-router-policies:
        get:
            description: |
                Retrieves a list of service edge router policy resources that affect a specific service; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceServiceEdgeRouterPolicies
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listServiceEdgeRouterPolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List service edge router policies that affect a specific service
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
    /services/{id}/service-policies:
        get:
            description: |
                Retrieves a list of service policy resources that affect specific service; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listServiceServicePolicies
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listServicePolicies'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List service policies that affect a specific service
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
    /services/{id}/terminators:
        get:
            description: |
                Retrieves a list of terminator resources that are assigned specific service; supports filtering, sorting, and pagination.
            operationId: listServiceTerminators
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listTerminators'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List of terminators assigned to a service
            tags:
                - Service
        parameters:
            - $ref: '#/parameters/id'
    /sessions:
        get:
            description: |
                Retrieves a list of active sessions resources; supports filtering, sorting, and pagination. Requires admin access.

                Sessions are tied to an API session and are moved when an API session times out or logs out. Active sessions
                (i.e. Ziti SDK connected to an edge router) will keep the session and API session marked as active.
            operationId: listSessions
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listSessions'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List sessions
            tags:
                - Session
        post:
            description: Create a session resource. Requires admin access.
            operationId: createSession
            parameters:
                - description: A session to create
                  in: body
                  name: session
                  required: true
                  schema:
                    $ref: '#/definitions/sessionCreate'
            responses:
                "201":
                    $ref: '#/responses/sessionCreateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a session resource
            tags:
                - Session
    /sessions/{id}:
        delete:
            description: Delete a session by id. Requires admin access.
            operationId: deleteSession
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a session
            tags:
                - Session
        get:
            description: Retrieves a single session by id. Requires admin access.
            operationId: detailSession
            responses:
                "200":
                    $ref: '#/responses/detailSession'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single session
            tags:
                - Session
        parameters:
            - $ref: '#/parameters/id'
    /sessions/{id}/route-path:
        get:
            description: Retrieves a single session's route path by id. Requires admin access.
            operationId: detailSessionRoutePath
            responses:
                "200":
                    $ref: '#/responses/detailSessionRoutePath'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single session's router path
            tags:
                - Session
        parameters:
            - $ref: '#/parameters/id'
    /specs:
        get:
            description: Returns a list of spec files embedded within the controller for consumption/documentation/code geneartion
            operationId: listSpecs
            responses:
                "200":
                    $ref: '#/responses/listSpecs'
            security: []
            summary: Returns a list of API specs
            tags:
                - Informational
    /specs/{id}:
        get:
            description: Returns single spec resource embedded within the controller for consumption/documentation/code geneartion
            operationId: detailSpec
            responses:
                "200":
                    $ref: '#/responses/detailSpec'
            security: []
            summary: Return a single spec resource
            tags:
                - Informational
        parameters:
            - $ref: '#/parameters/id'
    /specs/{id}/spec:
        get:
            description: Return the body of the specification (i.e. Swagger, OpenAPI 2.0, 3.0, etc).
            operationId: detailSpecBody
            produces:
                - text/yaml
                - application/json
            responses:
                "200":
                    $ref: '#/responses/detailSpecBody'
            security: []
            summary: Returns the spec's file
            tags:
                - Informational
        parameters:
            - $ref: '#/parameters/id'
    /summary:
        get:
            description: This endpoint is usefull for UIs that wish to display UI elements with counts.
            operationId: listSummary
            responses:
                "200":
                    $ref: '#/responses/listSummaryCounts'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Returns a list of accessible resource counts
            tags:
                - Informational
    /terminators:
        get:
            description: |
                Retrieves a list of terminator resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listTerminators
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listTerminators'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List terminators
            tags:
                - Terminator
        post:
            description: Create a terminator resource. Requires admin access.
            operationId: createTerminator
            parameters:
                - description: A terminator to create
                  in: body
                  name: terminator
                  required: true
                  schema:
                    $ref: '#/definitions/terminatorCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a terminator resource
            tags:
                - Terminator
    /terminators/{id}:
        delete:
            description: Delete a terminator by id. Requires admin access.
            operationId: deleteTerminator
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a terminator
            tags:
                - Terminator
        get:
            description: Retrieves a single terminator by id. Requires admin access.
            operationId: detailTerminator
            responses:
                "200":
                    $ref: '#/responses/detailTerminator'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single terminator
            tags:
                - Terminator
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a terminator. Requires admin access.
            operationId: patchTerminator
            parameters:
                - description: A terminator patch object
                  in: body
                  name: terminator
                  required: true
                  schema:
                    $ref: '#/definitions/terminatorPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a terminator
            tags:
                - Terminator
        put:
            description: Update all fields on a terminator by id. Requires admin access.
            operationId: updateTerminator
            parameters:
                - description: A terminator update object
                  in: body
                  name: terminator
                  required: true
                  schema:
                    $ref: '#/definitions/terminatorUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a terminator
            tags:
                - Terminator
    /transit-routers:
        get:
            description: |
                Retrieves a list of transit router resources; supports filtering, sorting, and pagination. Requires admin access.
            operationId: listTransitRouters
            parameters:
                - $ref: '#/parameters/limit'
                - $ref: '#/parameters/offset'
                - $ref: '#/parameters/filter'
            responses:
                "200":
                    $ref: '#/responses/listTransitRouters'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: List transit routers
            tags:
                - Transit Router
        post:
            description: Create a transit router resource. Requires admin access.
            operationId: createTransitRouter
            parameters:
                - description: A transit router to create
                  in: body
                  name: router
                  required: true
                  schema:
                    $ref: '#/definitions/transitRouterCreate'
            responses:
                "201":
                    $ref: '#/responses/createResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
            security:
                - ztSession: []
            summary: Create a transit router resource
            tags:
                - Transit Router
    /transit-routers/{id}:
        delete:
            description: Delete a transit router by id. Requires admin access.
            operationId: deleteTransitRouter
            responses:
                "200":
                    $ref: '#/responses/deleteResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "409":
                    $ref: '#/responses/cannotDeleteReferencedResourceResponse'
            security:
                - ztSession: []
            summary: Delete a transit router
            tags:
                - Transit Router
        get:
            description: Retrieves a single transit router by id. Requires admin access.
            operationId: detailTransitRouter
            responses:
                "200":
                    $ref: '#/responses/detailTransitRouter'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Retrieves a single transit router
            tags:
                - Transit Router
        parameters:
            - $ref: '#/parameters/id'
        patch:
            description: Update the supplied fields on a transit router. Requires admin access.
            operationId: patchTransitRouter
            parameters:
                - description: A transit router patch object
                  in: body
                  name: router
                  required: true
                  schema:
                    $ref: '#/definitions/transitRouterPatch'
            responses:
                "200":
                    $ref: '#/responses/patchResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update the supplied fields on a transit router
            tags:
                - Transit Router
        put:
            description: Update all fields on a transit router by id. Requires admin access.
            operationId: updateTransitRouter
            parameters:
                - description: A transit router update object
                  in: body
                  name: router
                  required: true
                  schema:
                    $ref: '#/definitions/transitRouterUpdate'
            responses:
                "200":
                    $ref: '#/responses/updateResponse'
                "400":
                    $ref: '#/responses/badRequestResponse'
                "401":
                    $ref: '#/responses/unauthorizedResponse'
                "404":
                    $ref: '#/responses/notFoundResponse'
            security:
                - ztSession: []
            summary: Update all fields on a transit router
            tags:
                - Transit Router
    /version:
        get:
            operationId: listVersion
            responses:
                "200":
                    $ref: '#/responses/listVersion'
            security: []
            summary: Returns version information
            tags:
                - Informational
produces:
    - application/json
responses:
    alreadyMfaEnrolledResponse:
        description: The identity is already enrolled in MFA
        examples:
            application/json:
                error:
                    args: null
                    cause: null
                    causeMessage: ""
                    code: ALREADY_MFA_ENROLLED
                    message: The identity is already enrolled in MFA
                    requestId: 270908d6-f2ef-4577-b973-67bec18ae376
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    badRequestResponse:
        description: The supplied request contains invalid fields or could not be parsed (json and non-json bodies). The error's code, message, and cause fields can be inspected for further information
        examples:
            application/json:
                error:
                    args:
                        urlVars: {}
                    cause:
                        details:
                            context: (root)
                            field: (root)
                            property: fooField3
                        field: (root)
                        message: '(root): fooField3 is required'
                        type: required
                        value:
                            fooField: abc
                            fooField2: def
                    causeMessage: schema validation failed
                    code: COULD_NOT_VALIDATE
                    message: The supplied request contains an invalid document
                    requestId: ac6766d6-3a09-44b3-8d8a-1b541d97fdd9
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    cannotDeleteReferencedResourceResponse:
        description: The resource requested to be removed/altered cannot be as it is referenced by another object.
        examples:
            application/json:
                error:
                    args:
                        urlVars:
                            id: 71a3000f-7dda-491a-9b90-a19f4ee6c406
                    causeMessage: referenced by /some-resource/05f4f710-c155-4a74-86d5-77558eb9cb42
                    code: CONFLICT_CANNOT_MODIFY_REFERENCED
                    message: The resource cannot be deleted/modified. Remove all referencing resources first.
                    requestId: 270908d6-f2ef-4577-b973-67bec18ae376
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    createCurrentApiSessionCertificateResponse:
        description: A response of a create API Session certificate
        schema:
            $ref: '#/definitions/createCurrentApiSessionCertificateEnvelope'
    createResponse:
        description: The create request was successful and the resource has been added at the following location
        schema:
            $ref: '#/definitions/createEnvelope'
    dataIntegrityCheckResult:
        description: A list of data integrity issues found
        schema:
            $ref: '#/definitions/dataIntegrityCheckResultEnvelope'
    deleteResponse:
        description: The delete request was successful and the resource has been removed
        schema:
            $ref: '#/definitions/empty'
    detailAPISession:
        description: Retrieves a singular API Session by id
        schema:
            $ref: '#/definitions/detailAPISessionEnvelope'
    detailAuthenticator:
        description: A singular authenticator resource
        schema:
            $ref: '#/definitions/detailAuthenticatorEnvelope'
    detailCa:
        description: A singular Certificate Authority (CA) resource
        schema:
            $ref: '#/definitions/detailCaEnvelope'
    detailConfig:
        description: A singular config resource
        schema:
            $ref: '#/definitions/detailConfigEnvelope'
    detailConfigType:
        description: A singular config-type resource
        schema:
            $ref: '#/definitions/detailConfigTypeEnvelope'
    detailCurrentAPISession:
        description: The API session associated with the session used to issue the request
        examples:
            default:
                data:
                    _links:
                        self:
                            href: ./current-api-session
                    configTypes: null
                    createdAt: "2020-03-09T19:03:49.1883693Z"
                    expiresAt: "2020-03-09T19:34:21.5600897Z"
                    id: 27343114-b44f-406e-9981-f3c4f2f28d54
                    identity:
                        _links:
                            self:
                                href: ./identities/66352d7b-a6b2-4ce9-85bb-9f18e318704d
                        id: 66352d7b-a6b2-4ce9-85bb-9f18e318704d
                        name: Default Admin
                        urlName: identities
                    tags:
                        - userField1: 123
                        - userField2: asdf
                    token: 28bb0ed2-0577-4632-ae70-d17106b92871
                    updatedAt: "2020-03-09T19:04:21.5600897Z"
                meta: {}
        schema:
            $ref: '#/definitions/currentAPISessionDetailEnvelope'
    detailCurrentApiSessionCertificate:
        description: A response containing a single API Session certificate
        schema:
            $ref: '#/definitions/detailCurrentApiSessionCertificateEnvelope'
    detailCurrentIdentity:
        description: The identity associated with the API Session used to issue the request
        examples:
            default:
                data:
                    _links:
                        edge-router-policies:
                            href: ./identities/66352d7b-a6b2-4ce9-85bb-9f18e318704d/edge-routers
                        self:
                            href: ./identities/66352d7b-a6b2-4ce9-85bb-9f18e318704d
                        service-policies:
                            href: ./identities/66352d7b-a6b2-4ce9-85bb-9f18e318704d/identities
                    authenticators:
                        updb:
                            username: admin
                    createdAt: "2020-01-13T16:38:13.6854788Z"
                    enrollment: {}
                    id: 66352d7b-a6b2-4ce9-85bb-9f18e318704d
                    isAdmin: true
                    isDefaultAdmin: true
                    name: Default Admin
                    roleAttributes:
                        $ref: '#/definitions/attributes'
                    tags: {}
                    type:
                        _links:
                            self:
                                href: ./identity-types/User
                        id: User
                        name: User
                        urlName: identity-types
                    updatedAt: "2020-01-13T16:38:13.6854788Z"
                meta: {}
        schema:
            $ref: '#/definitions/currentIdentityDetailEnvelope'
    detailEdgeRouter:
        description: A singular edge router resource
        schema:
            $ref: '#/definitions/detailedEdgeRouterEnvelope'
    detailEdgeRouterPolicy:
        description: A single edge router policy
        schema:
            $ref: '#/definitions/detailEdgeRouterPolicyEnvelope'
    detailEnrollment:
        description: A singular enrollment resource
        schema:
            $ref: '#/definitions/detailEnrollmentEnvelope'
    detailGeoRegion:
        description: A single geo-region
        schema:
            $ref: '#/definitions/detailGeoRegionEnvelope'
    detailIdentity:
        description: A signle identity
        schema:
            $ref: '#/definitions/detailIdentityEnvelope'
    detailIdentityType:
        description: A single identity type
        schema:
            $ref: '#/definitions/detailIdentityTypeEnvelope'
    detailMfa:
        description: The details of an MFA enrollment
        schema:
            $ref: '#/definitions/detailMfaEnvelope'
    detailMfaRecoveryCodes:
        description: The recovery codes of an MFA enrollment
        schema:
            $ref: '#/definitions/detailMfaRecoveryCodesEnvelope'
    detailPostureCheck:
        description: Retrieves a singular posture check by id
        schema:
            $ref: '#/definitions/detailPostureCheckEnvelope'
    detailPostureCheckType:
        description: Retrieves a singular posture check type by id
        schema:
            $ref: '#/definitions/detailPostureCheckTypeEnvelope'
    detailService:
        description: A single service
        schema:
            $ref: '#/definitions/detailServiceEnvelope'
    detailServiceEdgePolicy:
        description: A single service edge router policy
        schema:
            $ref: '#/definitions/detailServiceEdgePolicyEnvelope'
    detailServicePolicy:
        description: A single service policy
        schema:
            $ref: '#/definitions/detailServicePolicyEnvelop'
    detailSession:
        description: A single session
        schema:
            $ref: '#/definitions/detailSessionEnvelope'
    detailSessionRoutePath:
        description: A single session's route path
        schema:
            $ref: '#/definitions/detailSessionRoutePathEnvelope'
    detailSpec:
        description: A single specification
        schema:
            $ref: '#/definitions/detailSpecEnvelope'
    detailSpecBody:
        description: Returns the document that represents the specification
        schema:
            $ref: '#/definitions/detailSpecBodyEnvelope'
    detailTerminator:
        description: A single terminator
        schema:
            $ref: '#/definitions/detailTerminatorEnvelope'
    detailTransitRouter:
        description: A single transit router
        schema:
            $ref: '#/definitions/detailTransitRouterEnvelope'
    emptyResponse:
        description: Base empty response
        schema:
            $ref: '#/definitions/empty'
    erottResponse:
        description: A response containing the edge routers signed certificates (server chain, server cert, CAs).
        schema:
            $ref: '#/definitions/enrollmentCertsEnvelope'
    getIdentityFailedServiceRequest:
        description: Returns a list of service request failures
        schema:
            $ref: '#/definitions/getIdentityFailedServiceRequestEnvelope'
    getIdentityPolicyAdvice:
        description: Returns the document that represents the policy advice
        schema:
            $ref: '#/definitions/getIdentityPolicyAdviceEnvelope'
    getIdentityPostureData:
        description: Returns the document that represents posture data
        schema:
            $ref: '#/definitions/getIdentityPostureDataEnvelope'
    invalidAuthResponse:
        description: The authentication request could not be processed as the credentials are invalid
        examples:
            application/json:
                error:
                    args:
                        urlVars: {}
                    cause: ""
                    causeMessage: ""
                    code: INVALID_AUTH
                    message: The authentication request failed
                    requestId: 5952ed10-3091-474f-a691-47ebab6990dc
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    listAPISessions:
        description: A list of active API Sessions
        schema:
            $ref: '#/definitions/listAPISessionsEnvelope'
    listAuthenticators:
        description: A list of authenticators
        schema:
            $ref: '#/definitions/listAuthenticatorsEnvelope'
    listCas:
        description: A list of Certificate Authorities (CAs)
        schema:
            $ref: '#/definitions/listCasEnvelope'
    listConfigTypes:
        description: A list of config-types
        schema:
            $ref: '#/definitions/listConfigTypesEnvelope'
    listConfigs:
        description: A list of configs
        schema:
            $ref: '#/definitions/listConfigsEnvelope'
    listCurrentApiSessionCertificates:
        description: A list of the current API Session's certificate
        schema:
            $ref: '#/definitions/listCurrentAPISessionCertificatesEnvelope'
    listCurrentApiSessionServiceUpdates:
        description: Data indicating necessary service updates
        schema:
            $ref: '#/definitions/listCurrentApiSessionServiceUpdatesEnvelope'
    listCurrentIdentityEdgeRouters:
        description: A list of edge routers
        schema:
            $ref: '#/definitions/listCurrentIdentityEdgeRoutersEnvelope'
    listEdgeRouterPolicies:
        description: A list of edge router policies
        schema:
            $ref: '#/definitions/listEdgeRouterPoliciesEnvelope'
    listEdgeRouters:
        description: A list of edge routers
        schema:
            $ref: '#/definitions/listEdgeRoutersEnvelope'
    listEnrollments:
        description: A list of enrollments
        schema:
            $ref: '#/definitions/listEnrollmentsEnvelope'
    listGeoRegions:
        description: A list of geo-regions
        schema:
            $ref: '#/definitions/listGeoRegionsEnvelope'
    listIdentities:
        description: A list of identities
        schema:
            $ref: '#/definitions/listIdentitiesEnvelope'
    listIdentityTypes:
        description: A list of identity types
        schema:
            $ref: '#/definitions/listIdentityTypesEnvelope'
    listPostureCheckTypes:
        description: A list of posture check types
        schema:
            $ref: '#/definitions/listPostureCheckTypesEnvelope'
    listPostureChecks:
        description: A list of posture checks
        schema:
            $ref: '#/definitions/listPostureCheckEnvelope'
    listProtocols:
        description: A list of supported Edge protocols
        schema:
            $ref: '#/definitions/listProtocolsEnvelope'
    listRoleAttributes:
        description: A list of role attributes
        schema:
            $ref: '#/definitions/listRoleAttributesEnvelope'
    listServiceConfigs:
        description: A list of service configs
        schema:
            $ref: '#/definitions/listServiceConfigsEnvelope'
    listServiceEdgeRouterPolicies:
        description: A list of service edge router policies
        schema:
            $ref: '#/definitions/listServiceEdgeRouterPoliciesEnvelope'
    listServicePolicies:
        description: A list of service policies
        schema:
            $ref: '#/definitions/listServicePoliciesEnvelope'
    listServices:
        description: A list of services
        schema:
            $ref: '#/definitions/listServicesEnvelope'
    listSessions:
        description: A list of sessions
        schema:
            $ref: '#/definitions/listSessionsEnvelope'
    listSpecs:
        description: A list of specifications
        schema:
            $ref: '#/definitions/listSpecsEnvelope'
    listSummaryCounts:
        description: Entity counts scopped to the current identitie's access
        schema:
            $ref: '#/definitions/listSummaryCountsEnvelope'
    listTerminators:
        description: A list of terminators
        schema:
            $ref: '#/definitions/listTerminatorsEnvelope'
    listTransitRouters:
        description: A list of specifications
        schema:
            $ref: '#/definitions/listTransitRoutersEnvelope'
    listVersion:
        description: Version information for the controller
        schema:
            $ref: '#/definitions/listVersionEnvelope'
    mfaCreatedResponse:
        description: The create request was succesful and the response contains the location and details to complete MFA enrollment
        schema:
            $ref: '#/definitions/mfaCreatedEnvelope'
    notFoundResponse:
        description: The requested resource does not exist
        examples:
            application/json:
                error:
                    args:
                        urlVars:
                            id: 71a3000f-7dda-491a-9b90-a19f4ee6c406
                    cause: null
                    causeMessage: ""
                    code: NOT_FOUND
                    message: The resource requested was not found or is no longer available
                    requestId: 270908d6-f2ef-4577-b973-67bec18ae376
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    patchResponse:
        description: The patch request was successful and the resource has been altered
        schema:
            $ref: '#/definitions/empty'
    rateLimitedResponse:
        description: The resource requested is rate limited and the rate limit has been exceeded
        examples:
            application/json:
                error:
                    args:
                        urlVars: {}
                    causeMessage: you have hit a rate limit in the requested operation
                    code: RATE_LIMITED
                    message: The resource is rate limited and the rate limit has been exceeded. Please try again later
                    requestId: 270908d6-f2ef-4577-b973-67bec18ae376
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    routerExtendEnrollmentResponse:
        description: A response containg the edge routers new signed certificates (server chain, server cert, CAs).
        schema:
            $ref: '#/definitions/enrollmentCertsEnvelope'
    sessionCreateResponse:
        description: The create request was successful and the resource has been added at the following location
        schema:
            $ref: '#/definitions/sessionCreateEnvelope'
    unauthorizedResponse:
        description: The currently supplied session does not have the correct access rights to request this resource
        examples:
            application/json:
                error:
                    args:
                        urlVars: {}
                    cause: ""
                    causeMessage: ""
                    code: UNAUTHORIZED
                    message: The request could not be completed. The session is not authorized or the credentials are invalid
                    requestId: 0bfe7a04-9229-4b7a-812c-9eb3cc0eac0f
                meta:
                    apiEnrolmentVersion: 0.0.1
                    apiVersion: 0.0.1
        schema:
            $ref: '#/definitions/apiErrorEnvelope'
    updateResponse:
        description: The update request was successful and the resource has been altered
        schema:
            $ref: '#/definitions/empty'
    zitiSignedCert:
        description: A PEM encoded certificate signed by the internal Ziti CA
        examples:
            application/x-x509-user-cert: |
                -----BEGIN CERTIFICATE-----
                MIICzDCCAlGgAwIBAgIRAPkVg1jVKqnNGFpSB3lPbaIwCgYIKoZIzj0EAwIwXjEL
                MAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMRMwEQYDVQQKDApOZXRGb3VuZHJ5MS0w
                KwYDVQQDDCROZXRGb3VuZHJ5IFppdGkgRXh0ZXJuYWwgQVBJIFJvb3QgQ0EwHhcN
                MTgxMTE1MTI1NzE3WhcNMTkxMTI1MTI1NzE3WjBrMQswCQYDVQQGEwJVUzELMAkG
                A1UECAwCTkMxEjAQBgNVBAcMCUNoYXJsb3R0ZTETMBEGA1UECgwKTmV0Rm91bmRy
                eTEPMA0GA1UECwwGQWR2RGV2MRUwEwYDVQQDDAxaaXRpQ2xpZW50MDEwdjAQBgcq
                hkjOPQIBBgUrgQQAIgNiAATTl2ft+/K9RvDgki9gSr9udNcV2bxD4LrWEdCdXNzF
                iVUiEcEte9z/M0JRt8lgo17OjFvS+ecrAmLtIZNmQnH3+9YeafjeNPpvQsMKxlTN
                MnU7Hka11GHc6swQZSyHvlKjgcUwgcIwCQYDVR0TBAIwADARBglghkgBhvhCAQEE
                BAMCBaAwMwYJYIZIAYb4QgENBCYWJE9wZW5TU0wgR2VuZXJhdGVkIENsaWVudCBD
                ZXJ0aWZpY2F0ZTAdBgNVHQ4EFgQUtx+Tej6lSYdjb8Jbc2QuvoEsI/swHwYDVR0j
                BBgwFoAUcdTlRrnP43ZbQ3PGAbZMPE26+H4wDgYDVR0PAQH/BAQDAgXgMB0GA1Ud
                JQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDBDAKBggqhkjOPQQDAgNpADBmAjEAuXDS
                H7KKMr+la+Yuh8d8Q9cLtXzdS0j6a8e7iOyPJmdWq2WuzNdbCfAfLgKXuxhSAjEA
                sadZrXl1OBv11RGAKdYBIyRmfYUotCFAtCNKcfgBUxci0TDaKDA7r3jnjKT1d7Fs
                -----END CERTIFICATE-----
        schema:
            type: string
schemes:
    - https
securityDefinitions:
    ztSession:
        description: An API Key that is provided post authentication
        in: header
        name: zt-session
        type: apiKey
swagger: "2.0"
```
