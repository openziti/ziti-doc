// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// This docusaurus.config.js is used by GitHub Pages to build the site with baseUrl: '/docusaurus/'

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenZiti',
  tagline: 'Replacing Infrastructure With Software',
  url: 'https://docs.openziti.io/',
  baseUrl: '/',
  trailingSlash: undefined,
  // onBrokenLinks: 'warn',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  onDuplicateRoutes: 'throw',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'OpenZiti', // Usually your GitHub org/user name.
  projectName: 'ziti', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-policies',
        path: 'docs-policies',
        routeBasePath: 'policies',
        sidebarPath: require.resolve('./sidebar-policies.js'),
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        createRedirects: path => {
          if ( path.startsWith("/docs/guides/") ) {      // for each existing page
            return [                                     // return a "from" redirect for each old path
              path.replace("/docs/guides/","/guides/"),
              path.replace("/docs/guides/","/operations/"),
              path.replace("/docs/guides/","/docs/manage/"),
            ];
          }
          if ( path.startsWith("/docs/reference/deployments/") ) {
            const opsPaths = []
            if (!(path === "/docs/reference/deployments/")) {  // do not place a redirect in /operations/index.html or /docs/manage/index.html because there can be only one "from" and it was previously created to /docs/guides/index.html
              opsPaths.push(
                path.replace("/docs/reference/deployments/","/operations/"),
                path.replace("/docs/reference/deployments/","/docs/manage/")
              )
            }
            return opsPaths;
          }
          if ( path.startsWith("/docs/reference/developer/api/") ) {
            return [
              path.replace("/docs/reference/developer/api/","/api/"),
              path.replace("/docs/reference/developer/api/","/api/rest/"),
              path.replace("/docs/reference/developer/api/","/api/rest/edge-apis/")
            ];
          }
          if ( path.startsWith("/docs/reference/configuration/") ) {
            return [path.replace("/docs/reference/configuration/","/operations/configuration/")];
          }
          if ( path.startsWith("/docs/guides/") ) {
            return [path.replace("/docs/guides/","/operations/configuration/")];
          }
          if ( path.startsWith("/docs/learn/quickstarts/") ) {
            return [path.replace("/docs/learn/quickstarts/","/docs/quickstarts/")];
          }
          if ( path.startsWith("/docs/learn/core-concepts/zero-trust-models/") ) {
            return [
              path.replace("/docs/learn/core-concepts/zero-trust-models/","/docs/deployment-architecture/"),
              path.replace("/docs/learn/core-concepts/zero-trust-models/","/docs/core-concepts/zero-trust-models/")
            ];
          }
          if ( path.startsWith("/docs/learn/core-concepts/") ) {
            return [path.replace("/docs/learn/core-concepts/","/docs/core-concepts/")];
          }
          if ( path.startsWith("/docs/learn/introduction/") ) {
            return [path.replace("/docs/learn/introduction/","/docs/introduction/")];
          }
          if ( path.startsWith("/docs/reference/tunnelers/") ) {
            return [
              path.replace("/docs/reference/tunnelers/","/docs/learn/core-concepts/clients/tunnelers/"),
              path.replace("/docs/reference/tunnelers/","/docs/core-concepts/clients/tunnelers/")
            ];
          }
          if ( path.startsWith("/blog/") ) {
            var regex = /^\/blog\/(.*)\/?$/;
            return [
              path.replace(regex,"/articles/$1.html")
            ];
          }
          return undefined;
        },
        redirects: [
          {
            to: '/docs/learn/core-concepts/security/authentication/external-jwt-signers',
            from: ['/ziti/security/authentication/external-jwt-signers.html'],
          },
          {
            to: '/docs/guides/kubernetes/workload-tunneling/kubernetes-sidecar',
            from: ['/guides/kubernetes/kubernetes-sidecar-tunnel-quickstart'],
          },
          {
            to: '/docs/learn/core-concepts/identities/enrolling',
            from: ['/ziti/identities/enrolling.html'],
          },
          {
            to: '/docs/reference/tunnelers/',
            from: ['/ziti/clients/tunneler.html'],
          },
          {
            to: '/docs/reference/tunnelers/linux/',
            from: ['/ziti/clients/linux.html'],
          },
          {
            to: '/docs/guides/troubleshooting/',
            from: ['/operations/troubleshooting/troubleshooting'],
          },
          {
            to: '/docs/learn/core-concepts/pki',
            from: ['/docs/manage/pki', '/operations/pki'],
          },
          {
            to: '/docs/reference/developer/sdk',
            from: ['/api/ziti-sdk-swift', '/api/ziti-c-sdk', '/api/ziti-sdk-csharp'],
          },
          {
            to: '/docs/reference/developer/sdk/android',
            from: ['/guides/mobile/android'],
          },
          {
            to: '/docs/reference/developer/sdk',
            from: ['/docs/core-concepts/clients/sdks'],
          },
          {
            to: '/docs/reference/glossary',
            from: ['/glossary', '/glossary/glossary'],
          },
          {
            to: '/docs/learn/introduction/',
            from: ['/docs', '/docs/learn', '/docs/introduction/intro', '/docusaurus/docs/overview', '/ziti/overview/', '/ziti/overview.html'],
          },
          {
            to: '/docs/learn/quickstarts/network/',
            from: ['/ziti/quickstarts/quickstart-overview.html', '/ziti/quickstarts/networks-overview.html', '/docs/quickstarts'],
          },
          {
            to: '/docs/learn/introduction/openziti-is-software',
            from: ['/docs/introduction/zitiSoftwareArchitecture', '/ziti/software-architecture.html'],
          },
          {
            to: '/docs/reference/deployments/controller',
            from: ['/ziti/manage/sample-controller-config.yaml'],
          },
          {
            to: '/policies/CODE_OF_CONDUCT',
            from: ['/policies'],
          },
          {
            to: '/docs/reference/deployments/router/deployment',
            from: ['/docs/manage/edge-router'],
          },
          {
            to: '/docs/learn/quickstarts/services/',
            from: ['/docs/quickstarts/services/ztna'],
          },
          {
            to: '/docs/learn/quickstarts/zac/',
            from: ['/docs/quickstarts/zac/installation'],
          },
        ],
      },
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/openziti/ziti-doc/tree/main/docusaurus',

        },
        // blog: false,
        blog: {
          blogTitle: 'OpenZiti Technical Blog',
          blogDescription: 'Technical articles about OpenZiti',
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        debug: true,
        gtag: {
          trackingID: 'G-THVRRJ3GLE',
          anonymizeIP: true,
        },
      }),
    ],
    // Redocusaurus config
    [
      'redocusaurus',
      {
        // Plugin Options for loading OpenAPI files
        specs: [
          {
            id: 'edge-client',
            spec: 'https://get.openziti.io/spec/client.yml',
          },
          {
            id: 'edge-management',
            spec: 'https://get.openziti.io/spec/management.yml',
          },
        ],
        // Theme Options for modifying how redoc renders them
        theme: {
          // Change with your site colors
          primaryColor: '#1890ff',
        },
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        // The application ID provided by Algolia
        appId: 'EXWPKK5PV4',
  
        // Public API key: it is safe to commit it
        apiKey: '47858a78ccf0246d9b9cf4efaf6a1b8b',
  
        indexName: 'openziti',
  
        // Optional: see doc section below
        contextualSearch: true,
  
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.example\\.com|thirdparty\\.example\\.com',
  
        // Optional: Algolia search parameters
        searchParameters: {},
  
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
  
        //... other Algolia params
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        }
      },
      navbar: {
        title: '',
        hideOnScroll: false,
        logo: {
          alt: 'OpenZiti Logo',
          src: 'img/ziti-logo-dark.svg',
          srcDark: 'img/ziti-logo-light.svg',
        },
        items: [
          {
            to: '/docs/learn/introduction/',
            label: 'Documentation',
            position: 'right',
            activeBaseRegex: '/docs/(?!downloads)',
          },
          {
            to: '/docs/downloads',
            label: 'Downloads',
            position: 'right',
            activeBaseRegex: '/docs/downloads',
          },
          {
            to: 'https://blog.openziti.io/',
            label: 'Blog',
            position: 'right'
          },
          {
            type: 'dropdown',
            label: 'Links',
            position: 'right',
            items: [
              {
                type: 'html',
                value: '<div class="text-divider"><p>Socials</p></div>'
              },
              {
                type: 'html',
                value: '<a href="https://www.youtube.com/OpenZiti" target="_blank" title="OpenZiti on YouTube"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/yt.svg"/>YouTube</span></a>'
              },
              {
                type: 'html',
                value: '<a href="https://twitter.com/OpenZiti" target="_blank" title="OpenZiti on Twitter"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/twit.svg"/>Twitter</span></a>'
              },
              {
                type: 'html',
                value: '<a href="https://reddit.com/r/openziti" target="_blank" title="OpenZiti Subreddit"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/reddit-logo.png"/>Reddit</span></a>'
              },
              {
                type: 'html',
                value: '<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/ziggy.png"/><a href="https://twitter.com/OpenZiggy" target="_blank" title="OpenZiggy on Twitter">Ziggy</span></a>'
              },
              {
                type: 'html',
                value: '<div class="text-divider"><p>Other</p></div>'
              },
              {
                type: 'html',
                value: '<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/blog-icon.png"/><a href="https://blog.openziti.io/" target="_blank" title="Blog">Blog</span></a>'
              },
              {
                type: 'html',
                value: '<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/oz-test-kitchen.png"/><a href="https://github.com/openziti-test-kitchen" target="_blank" title="Git project incubator">Test Kitchen</span></a>'
              },
              {
                type: 'html',
                value: '<a href="https://zeds.openziti.org" target="_blank" title="Developer Sandbox"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/zeds.png"/>ZEDS</span></a>'
              },
              {
                type: 'html',
                value: '<a href="https://netfoundry.io/pricing/" target="_blank" title="NetFoundry-hosted Ziti"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/nf.svg"/>CloudZiti</span></a>'
              },
            ]
          },
          {
            href: 'https://openziti.discourse.group/',
            position: 'right',
            className: 'header-discourse-link',
            title: 'Discourse'
          },
          {
            href: 'https://github.com/openziti/ziti',
            position: 'right',
            className: 'header-github-link',
            title: 'GitHub'
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            label: 'Policies',
            to: '/policies/CODE_OF_CONDUCT',
          },
          {
            label: 'CloudZiti',
            to: 'https://netfoundry.io/pricing/'
          },
          {
            label: 'Blog',
            to: 'https://blog.openziti.io'
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} NetFoundry Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
