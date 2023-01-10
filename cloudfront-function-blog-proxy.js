function handler(event) {
    var request = event.request;
    var uri = request.uri;

    var popularBlogUris = [
      "/about",
      "/archive",
      "/bootstrapping-trust-part-1-encryption-everywhere",
      "/bootstrapping-trust-part-2-a-primer-on-public-key-cryptography",
      "/bootstrapping-trust-part-3-certificates",
      "/bootstrapping-trust-part-4-certificate-authorities-chains-of-trust",
      "/bootstrapping-trust-part-5-bootstrapping-trust",
      "/browzer-gateway-fqdn-certs",
      "/browzer-gateway-wildcard-certs",
      "/extrovert-wednesday",
      "/free-secure-access-to-nas-from-anywhere",
      "/golang-aha-moments-channels",
      "/golang-aha-moments-generics",
      "/high-level-publicprivate-cryptography",
      "/integrating-ziti-is-easy",
      "/introducing-openziti-browzer",
      "/its-a-zitiful-life",
      "/kubernetes",
      "/members",
      "/mobile-point-of-sale-mpos-app-ziti-android-java-sdk-integration",
      "/my-intern-assignment-call-a-dark-webhook-from-aws-lambda",
      "/newsletter",
      "/nginx-zerotrust-api-security",
      "/openziti-authentication-api-integrations",
      "/openziti-browzer-gateway",
      "/openziti-browzer-gateway-1",
      "/openziti-is-participating-in-hacktoberfest-prost",
      "/openziti-python-sdk-introduction",
      "/quickstart",
      "/securing-nodejs-applications",
      "/securing-web-apis-with-openziti",
      "/series/browzer",
      "/series/golang-aha",
      "/series/openziti-sdks",
      "/series/ziti-network-berlhome",
      "/setting-up-oracle-cloud-to-host-openziti",
      "/set-up-a-secure-multiplayer-minecraft-server",
      "/tag/aws-lambda",
      "/tag/developer",
      "/tag/ebpf",
      "/tag/go",
      "/tag/golang",
      "/tag/opensource",
      "/tag/openziti",
      "/tunneling-voip-over-openziti",
      "/using-ebpf-tc-to-securely-mangle-packets-in-the-kernel-and-pass-them-to-my-secure-networking-application",
      "/zero-trust-monitoring-with-openziti",
      "/zero-trust-overlay-network-to-access-homeassistant",
      "/zitification",
      "/zitifying-scp",
      "/zitifying-ssh"
    ]

    switch (true) {
      case uri == "/":
        var response = {
          statusCode: 307,
          statusDescription: 'Found',
          headers: {
            location: {
              value: `https://openziti.github.io${uri}`
            },
          }
        }
        console.log(`Redirecting "${uri}" to "${response.headers.location.value}"`);
        return response;
        break;
      case popularBlogUris.includes(uri.replace(/\/$/, "")):
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
