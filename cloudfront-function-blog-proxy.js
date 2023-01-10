function handler(event) {
    var request = event.request;
    var uri = request.uri;

    var popularBlogUris = [
      "/golang-aha-moments-generics",
      "/openziti-python-sdk-introduction",
      "/golang-aha-moments-channels",
      "/using-ebpf-tc-to-securely-mangle-packets-in-the-kernel-and-pass-them-to-my-secure-networking-application",
      "/securing-nodejs-applications",
      "/nginx-zerotrust-api-security",
      "/introducing-openziti-browzer",
      "/zero-trust-monitoring-with-openziti",
      "/free-secure-access-to-nas-from-anywhere",
      "/zero-trust-overlay-network-to-access-homeassistant",
      "/my-intern-assignment-call-a-dark-webhook-from-aws-lambda",
      "/bootstrapping-trust-part-1-encryption-everywhere",
      "/zitifying-ssh",
      "/setting-up-oracle-cloud-to-host-openziti",
      "/openziti-browzer-gateway",
      "/set-up-a-secure-multiplayer-minecraft-server",
      "/series/golang-aha",
      "/zitification",
      "/openziti-is-participating-in-hacktoberfest-prost",
      "/tunneling-voip-over-openziti",
      "/securing-web-apis-with-openziti",
      "/newsletter",
      "/openziti-authentication-api-integrations",
      "/browzer-gateway-wildcard-certs",
      "/browzer-gateway-fqdn-certs",
      "/its-a-zitiful-life",
      "/members",
      "/kubernetes",
      "/series/browzer",
      "/about",
      "/integrating-ziti-is-easy",
      "/bootstrapping-trust-part-5-bootstrapping-trust",
      "/high-level-publicprivate-cryptography",
      "/zitifying-scp",
      "/mobile-point-of-sale-mpos-app-ziti-android-java-sdk-integration",
      "/bootstrapping-trust-part-2-a-primer-on-public-key-cryptography",
      "/bootstrapping-trust-part-4-certificate-authorities-chains-of-trust",
      "/extrovert-wednesday",
      "/bootstrapping-trust-part-3-certificates",
      "/tag/opensource",
      "/tag/openziti",
      "/tag/go",
      "/openziti-browzer-gateway-1",
      "/series/openziti-sdks",
      "/series/ziti-network-berlhome",
      "/tag/golang",
      "/tag/aws-lambda",
      "/archive",
      "/tag/developer",
      "/tag/ebpf"
    ]

    switch (true) {
      case popularBlogUris.includes(uri):
        var response = {
          statusCode: 307,
          statusDescription: 'Found',
          headers: {
            location: {
              value: `https://blog.openziti.io${uri}`
            },
          }
        }
        console.log(`Redirecting "${uri}" to "${response.headers.location.value}"`);
        return response;
        break;
      default:
        console.log(`Forwarding "${uri}" to origin`);
        return request;
      }

}
