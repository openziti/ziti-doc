function handler(event) {
    var request = event.request;
    var uri = request.uri;

    var response = {
      statusCode: 307,
      statusDescription: 'Not Found',
      headers: {
        location: {
          value: `https://blog.openziti.io${uri}`
        },
      }
    }

    switch (true) {
      // requests for root to docs
      case /^\/$/i.test(uri):
        response.headers.location.value = `https://openziti.github.io${uri}`;
        response.statusDescription = 'Found'
        break;
      }

    console.log(`Redirecting "${uri}" to "${response.headers.location.value}"`);
    return response;
}
