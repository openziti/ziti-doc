# Building this Project

![build & deploy](https://github.com/openziti/ziti-doc/actions/workflows/main.workflow.yml/badge.svg)

## Prerequisite

* Linux - Documentation is run routinely by our CI
* Windows - Developed with [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
* Doxygen - [Doxygen](http://www.doxygen.nl/) is used to generate the api documentation for the C SDK and is
  necessary to be on the path

## Building the Docs Site

This project uses [GitHub Pages](https://pages.github.com/) to host the static HTML output of building the
docs site. GitHub has a few options for where you can put your doc at this time: the main branch, a folder on the
main branch named "docs," or a branch named "gh-pages." This project is currently configured
to publish by running `publish.sh` which destructively pushes the build output to the root of branch "master" in another repository "openziti/openziti.github.io". That repo is configured to publish the contents of the "master" branch as the GitHub Pages custom domain "openziti.io."

The best/easiest thing to do in order to build these docs is to have Windows Subsystem for Linux installed or any shell
which can execute a `.sh` script. As of 2020, there's a multitude of ways to get a BASH/shell interpreter in Windows.
It's not feasible to test all these shells to make sure this script works so it's encouraged that you use a Linux-based
flavor of BASH. If the script doesn't function - open an [issue](./issues).

After cloning this repository, open the BASH shell and execute the [gendoc.sh](./gendoc.sh) script. The script has a few
flags to pass that control the cleanup of what the script does. In general, it's recommended you use the -w flag
so that warnings are treated as errors. 

Expected usage: `./gendoc.sh -c`

> [!NOTE]\
> you must configure NodeJS >=16.14 before running `yarn`

> [!WARNING]\
> Do not use `npm` to build this project or add a plugin. Always use `yarn`.

You can then run `cd ./docusaurus && yarn install --frozen-lockfile && yarn start` to serve the Docusaurus site from webpack. If you're testing configuration changes you will need to serve the production build with `yarn serve` instead.

## Publishing this Site

`./publish.sh` is intended to run in GitHub Actions on branch `main` where the following variables are defined:

* `GIT_BRANCH`: output of `git rev-parse --abbrev-ref HEAD`
* `gh_ci_key`: base64 encoding of an OpenSSH private key authorized to clobber the `main` branch of [the root doc repo for GitHub pages](https://github.com/openziti/openziti.github.io/tree/main).

The [./publish.sh](./publish.sh) script emits a `CNAME` file that defines the custom domain to be used by GitHub Pages. If the script is not changed, the domain will revert to the value defined in the script every time the site is published.

To run this script locally, define the necessary variables in your environment.

## Adding a NodeJS Package

Docusaurus plugins are distributed as NodeJS packages. This project uses `yarn`, not `npm`, to manage packages, build the project, and run the development server. To add a NodeJS package:

```text
cd ./docusaurus
yarn add @whaterver
```

This will update `./docusaurus/package.json` and `./docusaurus/yarn.lock`. Test and commit these changes.

## Upgrading a NodeJS Package

Docusaurus plugins are distributed as NodeJS packages. This project uses `yarn`, not `npm`, to manage packages, build the project, and run the development server. To upgrade a NodeJS package:

```text
cd ./docusaurus
yarn upgrade @docusaurus/plugin-content-docs
```

This will update `./docusaurus/package.json` and `./docusaurus/yarn.lock`. Test and commit these changes.

## How Search Works

Algolia [DocSearch](https://docsearch.algolia.com/) provides search for this site.

* Docusaurus v2's classic preset theme provides an integration with Algolia DocSearch v3 as a built-in plugin. The public search API key and application ID are properties in `docusaurus.config.ts`. That plugin provides [the site's `/search` URL](/search) and a search widget in the main navigation ribbon that's visible on all pages. The Javascript running in these elements returns search results from the DocSearch API.

* The DocSearch API fetches records from an Algolia index that is populated by [an Algolia crawler](https://crawler.algolia.com/). Search results may be tuned by adjusting the crawler config. The crawler is specifically configured for the Docusaurus theme. If the theme changes structurally then it will be necessary to adjust the crawler config to suit. Changes to the site will not be reflected in the search results if the crawler config does not match the theme. The current config is based on [this configuration template for Docusaurus v2](https://docsearch.algolia.com/docs/templates/#docusaurus-v2-template).

## Check For Broken Links

[A CI job](https://github.com/openziti/ziti-doc/actions/workflows/check-links.yml) periodically detects broken links in the GH Pages site and incoming links from external sites but doesn't make any changes to the site source files. An alarm issue is raised and auto-resolved based on the result of the check.

With these scripts, you can test all the links in the site's pages and popular incoming request paths.

* [crawl-for-broken-links.sh](./check-links/crawl-for-broken-links.sh): uses `docker` to run `muffet` which crawls the given base URL looking for broken links

  ```text
  # check local dev server for broken outgoing links to itself and other sites, excluding a few hosts that are sensitive to being hammered by a crawler
  ./crawl-for-broken-links.sh http://127.0.0.1:3000

  # check the GH Pages site for broken links to anywhere
  ./crawl-for-broken-links.sh https://openziti.github.io --rate-limit=11
  ```

* [check-links.sh](./check-links/check-links.sh): uses `curl` to try a list of URL paths from a file

  ```text
  # check a list of popular incoming links from external sites
  ./check-links.sh https://docs.openziti.io ./popular-docs-links.txt
  ```

  ```text
  ./check-links.sh https://blog.openziti.io ./popular-blog-links.txt
  ```

  You will need to run `yarn serve` to crawl for broken links locally because the webpack server (`yarn start`) is not crawlable, and you will probably have to deploy to Vercel or GH Pages to test comprehensively for broken links. The `docusaurus` CLI's built-in development server preempts any request for a path ending `.html` with a permanent redirect (HTTP 301) to the same path without the suffix. This prevents the redirects plugin from placing effective redirects as files with `.html` suffixes and employing the meta refresh technique for redirecting user agents to the new location of a page. 

### Update the List of Popular Incoming Links

Use Google Analytics to build a "detail" report by modifying the standard report "Pages and screens." Add a column "Page path" to show the URL path for each record. Add a filter for the production hostname `openziti.io` to exclude test instances from the data. Click the "Share" button to export the data as a CSV file. Use a spreadsheet program to filter out redundant and irrelevant records.

## How openziti.io Works

The `openziti.io` domain name resolves to GitHub Pages which hosts the static HTML that's output by the Docusaurus build that runs in a GitHub workflow. 

## How docs.openziti.io Works

This redirector's purpose is to preserve incoming links for this domain. The `docs.openziti.io` domain name resolves to a CloudFront distribution that only responds with an HTTP redirect. If the request path is `/` then it responds with `https://openzit.io/docs` (the docs landing page). Otherwise, it responds with the same path that was requested at `https://openziti.io{path}`.

The redirector's behavior is controlled by a Javascript CloudFront function that's deployed automatically when it is changed in this repository. The function is defined in [cloudfront-function-docs-openziti-io.js](./cloudfront/cloudfront-function-docs-openziti-io.js). The function is deployed by [a GitHub workflow](./.github/workflows/deploy-cloudfront.yml) that runs when the file is changed in the `main` branch.
