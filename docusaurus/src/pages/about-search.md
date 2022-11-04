
# How Search Works

These are some notes about how Algolia [DocSearch](https://docsearch.algolia.com/) is set up for this site.

* The OpenZiti project has applied for and received non-commercial [open-source project status](https://docsearch.algolia.com/docs/who-can-apply/). This grants free access to certain Algolia features.

* Docusaurus v2's classic preset theme provides an integration with Algolia DocSearch v3 as a built-in plugin. The public search API key and application ID are properties in `docusaurus.config.js`. That plugin provides [the site's `/search` URL](/search) and a search widget in the main navigation ribbon that's visible on all pages. The Javascript running in these elements returns search results from the DocSearch API.

* The DocSearch API fetches records from an Algolia index that is populated by [an Algolia crawler](https://crawler.algolia.com/). Search results may be tuned by adjusting the crawler config. The crawler is specifically configured for the Docusaurus theme. If the theme changes structurally then it will be necessary to adjust the crawler config to suit. Changes to the site will not be reflected in the search results if the crawler config does not match the theme. The current config is based on [this configuration template for Docusaurus v2](https://docsearch.algolia.com/docs/templates/#docusaurus-v2-template).
