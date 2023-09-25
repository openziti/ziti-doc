// this script answers requests for docs.openziti.io with a redirect
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var response = {
    statusCode: 307,
    statusDescription: 'Not Found',
    headers: {
      location: {
        value: `https://openziti.io${uri}`
      },
    }
  }

  switch (true) {
    // redirect to docs intro page if request for docs.openziti.io/
    case uri == "/":
      response.headers.location.value = `https://openziti.io/docs`;
      break;
    // otherwise send the default response redirecting to openziti.io/*
    }

  console.log(`Redirecting "${uri}" to "${response.headers.location.value}"`);
  return response;

}
