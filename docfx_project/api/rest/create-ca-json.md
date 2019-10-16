    Verb: POST

    name: The name of the CA to create
    isAutoCaEnrollmentEnabled: controls if the CA can be used for automatic enrollment
    isOttCaEnrollmentEnabled: controls if the CA be used for one time token enrollment
    isAuthEnabled: controls if the CA is enabled for authentication. Devices can enroll but not connect if set to false
    certPem: the CA to upload in PEM format

    {
      "name": "${ca_name}",
      "isAutoCaEnrollmentEnabled": ${true|false},
      "isOttCaEnrollmentEnabled": ${true|false},
      "isAuthEnabled": ${true|false},
      "certPem": "${cert}"
    }