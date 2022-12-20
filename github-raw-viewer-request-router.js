function handler(event) {
    var request = event.request;

    var uri = request.uri;

    switch (true) {
      // quickstart functions are symlinked everywhere else
      case /^\/quick\/.*/i.test(uri):
        var re = /(^\/quick\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/ziti/main/quickstart/docker/image/$2');
        console.log("Routing '"+uri+"' to '"+request.uri+"'");
        break;
      // Edge API specs
      case /^\/spec\/.*/i.test(uri):
        var re = /(^\/spec\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/edge/main/specs/$2');
        console.log("Routing '"+uri+"' to '"+request.uri+"'");
        break;
      // tunneler package signing key
      case /^\/pack\/.*/i.test(uri):
        var re = /(^\/pack\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/ziti-tunnel-sdk-c/main/$2');
        console.log("Routing '"+uri+"' to '"+request.uri+"'");
        break;
      // docker quickstart
      case /^\/dock\/.*/i.test(uri):
        var re = /(^\/dock\/)(.*)/;
        request.uri = uri.replace(re, '/openziti/ziti/main/quickstart/docker/$2');
        console.log("Routing '"+uri+"' to '"+request.uri+"'");
        break;
    
    }

    return request;
}
