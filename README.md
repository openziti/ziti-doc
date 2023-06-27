# Building this Project

![build & deploy](https://github.com/openziti/ziti-doc/actions/workflows/main.workflow.yml/badge.svg)

## Prerequisite

* Linux - Documentation is run routinely by our CI
* Windows - Developed with [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
* Doxygen - [Doxygen](http://www.doxygen.nl/) is used to generate the api documentation for the C SDK and is
  necessary to be on the path

## Building the Doc

Github offers [github pages](https://pages.github.com/) which this project uses to host the output of building the
static content. Github has a few options for where you can put your doc at this time, the main branch, a folder on the
main branch named 'docs' or a special branch that still works named "gh-pages". This project is currently configured
to use the main branch and docs folder.

The best/easiest thing to do in order to build these docs is to have Windows Subsystem for Linux installed or any shell
which can execute a `.sh` script. As of 2020 there's a multitude of ways to get a bash/shell interpreter in windows.
It's not feasible to test all these shells to make sure this script works so it's encouraged that you use a linux-based
flavor of bash. If the script doesn't function - open an [issue](./issues) and someone will look into it.

After cloning this repository open the bash shell and execute the [gendoc.sh](./gendoc.sh) script. The script has a few
flags to pass that mostly controls the cleanup of what the script does. In general, it's recommended you use the -w flag
so that warnings are treated as errors. 

Expected usage: `./gendoc.sh -c`

```
NOTE: you must be configured to run NodeJS >=16.14 before running the next command.
```

You can then run `cd ./docusaurus && yarn install && yarn start` to serve the Docusaurus site from webpack. If you're testing configuration changes you will need to serve the production build with `yarn serve` instead.

## Publishing this Site

`./publish.sh` is intended to run in GitHub Actions on branch `main` where the following variables are defined:

* `GIT_BRANCH`: output of `git rev-parse --abbrev-ref HEAD`
* `gh_ci_key`: base64 encoding of an OpenSSH private key authorized to clobber the `main` branch of [the root doc repo for GitHub pages](https://github.com/openziti/openziti.github.io/tree/main).

The script defines the GitHub Pages custom domain by committing a file `CNAME`. You must change the custom domain in the script if you change the custom domain in GitHub Pages web console.

You may run this script locally if you define the same variables in your environment.

## How Search Works

Algolia [DocSearch](https://docsearch.algolia.com/) provides search for this site.

* Docusaurus v2's classic preset theme provides an integration with Algolia DocSearch v3 as a built-in plugin. The public search API key and application ID are properties in `docusaurus.config.js`. That plugin provides [the site's `/search` URL](/search) and a search widget in the main navigation ribbon that's visible on all pages. The Javascript running in these elements returns search results from the DocSearch API.

* The DocSearch API fetches records from an Algolia index that is populated by [an Algolia crawler](https://crawler.algolia.com/). Search results may be tuned by adjusting the crawler config. The crawler is specifically configured for the Docusaurus theme. If the theme changes structurally then it will be necessary to adjust the crawler config to suit. Changes to the site will not be reflected in the search results if the crawler config does not match the theme. The current config is based on [this configuration template for Docusaurus v2](https://docsearch.algolia.com/docs/templates/#docusaurus-v2-template).

## Check For Broken Links

[A CI job](https://github.com/openziti/ziti-doc/actions/workflows/check-links.yml) periodically detects broken links in the GH Pages site and incoming links from external sites, but doesn't make any changes to the site source files. An alarm issue is raised and auto-resolved based on the result of the check.

With these scripts, you can test all the links in the site's pages and popular incoming request paths.

* [crawl-for-broken-links.sh](./check-links/crawl-for-broken-links.sh): uses `docker` to run `muffet` which crawls the given base URL looking for broken links

  ```bash
  # check local dev server for broken outgoing links to itself and other sites, excluding a few hosts that are sensitive to being hammered by a crawler
  ./crawl-for-broken-links.sh http://127.0.0.1:3000

  # check the GH Pages site for broken links to anywhere
  ./crawl-for-broken-links.sh https://openziti.github.io --rate-limit=11
  ```

* [check-links.sh](./check-links/check-links.sh): uses `curl` to try a list of URL paths from a file

  ```bash
  # check a list of popular incoming links from external sites
  ./check-links.sh https://docs.openziti.io ./popular-docs-links.txt
  ```

  ```bash
  ./check-links.sh https://blog.openziti.io ./popular-blog-links.txt
  ```

  You will need to run `yarn serve` to crawl for broken links locally because the webpack server (`yarn start`) is not crawlable, and you will probably have to deploy to Vercel or GH Pages to test comprehensively for broken links. The `docusaurus` CLI's built-in development server preempts any request for a path ending `.html` with a permanent redirect (HTTP 301) to the same path without the suffix. This prevents the redirects plugin from placing effective redirects as files with `.html` suffixes and employing the meta refresh technique for redirecting user agents to the new location of a page. 

## How the Proxies Work

There are a couple of reverse proxies hosted by CloudFront. Both employ CloudFront functions with a custom script. Both scripts are of type "viewer request" meaning they operate on the request of the viewer, which is on the front side of the proxy. 

The scripts parse the request and decide whether to return a response to the viewer or pass along the request to the origin, i.e., upstream, a.k.a backend, a.k.a. origin.

### How the Short URL Proxy Works

`https://get.openziti.io` is a CloudFront caching proxy that runs a viewer request function ([script](./cloudfront-function-github-proxy.js)). The upstream/origin is `https://raw.githubusercontent.com`. The proxy allows for a shorter URL by mapping a URL path abbreviation to the full path.

This proxy's function modifies the viewer's request if it matches one of the shortening prefixes below before passing it along to the origin, which is GitHub.

|purpose|abbreviation|full URL path|
|---|---|---|
|quickstart functions|`/quick/`|`/openziti/ziti/main/quickstart/docker/image/`|
|API specs|`/spec/`|`/openziti/edge-api/main/`|
|Linux package key|`/pack/`|`/openziti/ziti-tunnel-sdk-c/main/`
|Docker quickstart assets|`/dock/`|`/openziti/ziti/main/quickstart/docker/`|

### How the openziti.io Proxy Works

The `openziti.io` DNS name resolves to a proxy that redirects selectively to HashNode or GitHub Pages, depending on the request path. This preserves popular incoming links to blog articles as redirects while this docs site becomes the default destination for all other requests for `openziti.io`.

Like the GitHub proxy, this proxy runs a CloudFront viewer request function ([script](./cloudfront-function-openziti-io-proxy.js)) to decide how to handle requests. This proxy's function inspects the viewer's request to see if it exactly matches the `/` root document which triggers a redirect to `https://docs.openziti.io/`. If it does not match, then the proxy responds to the viewer with a redirect to the same request path at `blog.openziti.io`.

### CloudFront Proxy Deployment Notes

You can perform these steps in the AWS Web Console or with `aws` CLI.

* Find the name and "ETag" (changes when updated) of the CloudFront Function you wish to update.

  ```bash
  $ aws cloudfront list-functions | \
    jq '.FunctionList.Items[]|select(.FunctionMetadata.Stage == "LIVE")|.Name'
  "blog-viewer-request-function"
  "github-raw-viewer-request-router"
  ```

  ```bash
  $ aws cloudfront describe-function --name github-raw-viewer-request-router | \
    jq '.ETag'
"E135L1TOL8QIJF"
  ```

* Update the function's DEVELOPMENT stage in AWS. In the console you need to paste the new script and save it to update the development stage of the CloudFront function.

  ```bash
  aws cloudfront update-function \
    --name github-raw-viewer-request-router \
    --function-code fileb://./cloudfront-proxies/cloudfront-function-github-proxy.js \
    --function-config '{"Runtime": "cloudfront-js-1.0","Comment": "update function"}' \
    --if-match E135L1TOL8QIJF  # ETag from DescribeFunction
  ```

* Find the new ETag (version ID) of the updated function

  ```bash
  $ aws cloudfront describe-function --name github-raw-viewer-request-router | \
    jq '.ETag'
"E3T4TT2Z381HKD"
  ```

* Test the function. You need to verify the request or response was handled expectedly. You can also do this in the web console with the "test" tab on the CloudFront function.

  ```bash
  aws cloudfront test-function \
      --name github-raw-viewer-request-router \
      --stage DEVELOPMENT \
      --if-match E3T4TT2Z381HKD \
      --event-object fileb://./github/ziti-doc/cloudfront-proxies/github-test-event-object.json | jq -r '.TestResult.FunctionOutput' | jq .
  ```

  ```json
  {
    "request": {
      "headers": {
        "host": {
          "value": "get.openziti.io"
        }
      },
      "method": "GET",
      "querystring": {},
      "uri": "/openziti/ziti-tunnel-sdk-c/main/install.sh",
      "cookies": {}
    }
  }
  ```

* publish LIVE stage

  ```bash
  aws cloudfront publish-function \      
    --name github-raw-viewer-request-router \
    --if-match E3T4TT2Z381HKD
  ```
