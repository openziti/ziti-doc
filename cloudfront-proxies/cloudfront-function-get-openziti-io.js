function handler(event) {
    var request = event.request;

    var uri = request.uri;

    switch (true) {
      // quickstart functions are symlinked everywhere else
      case /^\/quick\/.*/i.test(uri):
        var re = /(^\/quick\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/ziti/release-next/quickstart/docker/image/$2');
        break;
      // Edge API specs
      case /^\/spec\/.*/i.test(uri):
        var re = /(^\/spec\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/edge-api/main/$2');
        break;
      // tunneler downloads like the package signing key and install script
      case /^\/(tun|pack)\/.*/i.test(uri):
        var re = /(^\/(tun|pack)\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/ziti-tunnel-sdk-c/main/$3');
        break;
      // docker quickstart
      case /^\/dock\/.*/i.test(uri):
        var re = /(^\/dock\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/ziti/release-next/quickstart/docker/$2');
        break;
    }

    console.log(`Routing "${uri}" to "${request.uri}"`);

    return request;
}
