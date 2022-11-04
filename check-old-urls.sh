#!/usr/bin/env bash

set -euo pipefail

[[ $# -eq 1 ]] || {
    echo "ERROR: need base URL to check as first param" >&2
    exit 1
} 

typeset -a FAILURES=()
while read; do
    curl -sfLw "\n${REPLY}\t%{http_code}\n" ${1}${REPLY} &>/dev/null || { FAILURES+=($REPLY); }; 
done <<URLS
/ziti/overview.html
/ziti/quickstarts/quickstart-overview.html
/index.html
/ziti/quickstarts/network/local-no-docker.html
/ziti/quickstarts/network/hosted.html
/ziti/clients/which-client.html
/ziti/clients/tunneler.html
/ziti/services/overview.html
/ziti/identities/overview.html
/articles/zitification/prometheus/part1.html
/ziti/quickstarts/network/local-with-docker.html
/ziti/software-architecture.html
/api/index.html
/ziti/quickstarts/network/local-docker-compose.html
/ziti/quickstarts/services/index.html
/ziti/config-store/overview.html
/articles/index.html
/ziti/quickstarts/zac/installation.html
/ziti/clients/linux.html
/ziti/security/overview.html
/ziti/quickstarts/services/host-access.html
/glossary/glossary.html
/ziti/manage/controller.html
/api/rest/index.html
/ziti/identities/creating.html
/ziti/quickstarts/hsm-overview.html
/ziti/clients/sdks.html
/ziti/quickstarts/hsm/softhsm.html
/ziti/identities/enrolling.html
/ziti-cmd/quickstart/kubernetes/sidecar-tunnel/kubernetes-sidecar-tunnel-quickstart.html
/ziti/security/authorization/policies/overview.html
/ziti/manage/manage.html
/ziti/manage/edge-router.html
/ziti/services/creating.html
/api/clang/index.html
/ziti/security/authentication/authentication.html
/articles/golang-aha/article.html
/ziti/manage/router-overview.html
/ziti/metrics/overview.html
/articles/zitification/zitifying-ssh/index.html
/ziti/clients/windows.html
/ziti/config-store/managing.html
/ziti-android-app/README.html
/articles/bootstrapping-trust/part-01.encryption-everywhere.html
/articles/zitification/kubernetes/index.html
/articles/c-sdk-on-beaglebone.html
/ziti/manage/pki.html
/ziti/security/authentication/third-party-cas.html
/articles/zitification/prometheus/part2.html
/ziti/security/authorization/authorization.html
/articles/zitification/prometheus/part3.html
/ziti/clients/android.html
/ziti/clients/macos.html
/ziti/config-store/consuming.html
/ziti/quickstarts/hsm/yubikey.html
/articles/zitification/index.html
/ziti/clients/iOS.html
/ziti/downloads/overview.html
/ziti/metrics/prometheus.html
/ziti/security/authorization/posture-checks.html
/ziti/security/enrollment/enrollment.html
/articles/bootstrapping-trust/part-05.bootstrapping-trust.html
/ziti/clients/sdks
/ziti/security/authentication/authentication-policies.html
/ziti/security/authorization/policies/creating-edge-router-policies.html
/articles/zitification/zitifying-scp/index.html
/ziti/manage/troubleshooting.html
/ziti/security/authentication/external-jwt-signers.html
/ziti/metrics/metric-types.html
/ziti/security/authorization/policies/creating-service-edge-router-policies.html
/api/swift/index.html
/ziti/security/authentication/certificate-management.html
/ziti/security/authentication/totp.html
/articles/bootstrapping-trust/part-02.a-primer-on-public-key-cryptography.html
/ziti/
/ziti/security/authentication/identities.html
/ziti/clients/tunneler
/ziti/security/authentication/api-session-certificates.html
/articles/bootstrapping-trust/part-04.certificate-authorities-and-chains-of-trust.html
/ziti/security/authorization/policies/creating-service-policies.html
/articles/bootstrapping-trust/part-03.certificates.html
/ziti/apis/edge-apis.html
/ziti/config-store/overview
/ziti/metrics/file.html
/ziti/metrics/inspect.html
URLS

# /api/csharp/NetFoundry.html
# /api/csharp/NetFoundry.ZitiConnection.html
# /api/csharp/NetFoundry.ZitiIdentity.html
# /api/csharp/NetFoundry.Ziti.html
# /api/csharp/NetFoundry.ZitiConnection.OnConnected.html
# /api/csharp/NetFoundry.ZitiConnection.OnDataReceived.html
# /api/csharp/NetFoundry.ZitiConnection.OnDataWritten.html
# /api/csharp/NetFoundry.ZitiException.html
# /api/csharp/NetFoundry.ZitiStream.html
# /api/csharp/NetFoundry.ZitiStatus.html


if [[ ${#FAILURES[*]} -eq 0 ]]; then
    echo "Success!"
    exit 0
else
    printf 'Failed:\n'
    for i in ${FAILURES[*]}; do printf '\t%s\n' $i; done | sort
    exit 1
fi
