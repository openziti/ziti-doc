// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// This docusaurus.config.js is used by GitHub Pages to build the site with baseUrl: '/docusaurus/'

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenZiti',
  tagline: 'Replacing Infrastructure With Software',
  url: 'https://openziti.github.io/',
  baseUrl: '/',
  trailingSlash: false,
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
      '@docusaurus/plugin-google-analytics',
      {
        trackingID: 'G-THVRRJ3GLE',
        anonymizeIP: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-api',
        path: 'docs-api',
        routeBasePath: 'api',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-glossary',
        path: 'docs-glossary',
        routeBasePath: 'glossary',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-guides',
        path: 'docs-guides',
        routeBasePath: 'guides',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['md', 'html'], // /myPage.md -> /myPage
        // toExtensions: ['exe', 'zip'], // /myAsset -> /myAsset.zip (if latter exists)
        redirects: [
          {
            to: '/',
            from: ['/docusaurus'],
          },
          {
            to: '/docs/introduction/intro',
            from: ['/ziti/overview'],
          },
          {
            to: '/docs/quickstarts/services/ztha',
            from: ['/ziti/quickstarts/services/host-access'],
          },
          {
            to: '/docs/quickstarts/network/',
            from: ['/ziti/quickstarts/quickstart-overview'],
          },
          {
            to: '/api/ziti-sdk-csharp',
            from: ['/api/csharp/NetFoundry'],
          },
          {
            to: '/docs/core-concepts/clients/choose',
            from: ['/ziti/clients/which-client'],
          },
          {
            to: '/docs/core-concepts/services/overview',
            from: ['/ziti/services/overview'],
          },
          {
            to: '/docs/core-concepts/identities/overview',
            from: ['/ziti/identities/overview'],
          },
          {
            to: '/docs/introduction/openziti-is-software',
            from: ['/docs/introduction/zitiSoftwareArchitecture', '/ziti/software-architecture'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/linux',
            from: ['/ziti/clients/linux'],
          },
          {
            to: '/docs/core-concepts/security/overview',
            from: ['/ziti/security/overview'],
          },
          {
            to: '/docs/core-concepts/identities/creating',
            from: ['/ziti/identities/creating'],
          },
          {
            to: '/guides/hsm/',
            from: ['/ziti/quickstarts/hsm-overview'],
          },
          {
            to: '/docs/core-concepts/clients/sdks',
            from: ['/ziti/clients/sdks'],
          },
          {
            to: '/guides/hsm/softhsm',
            from: ['/ziti/quickstarts/hsm/softhsm'],
          },
          {
            to: '/docs/core-concepts/identities/enrolling',
            from: ['/ziti/identities/enrolling'],
          },
          {
            to: '/guides/kubernetes/kubernetes-sidecar-tunnel-quickstart',
            from: ['/ziti-cmd/quickstart/kubernetes/sidecar-tunnel/kubernetes-sidecar-tunnel-quickstart'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/overview',
            from: ['/ziti/security/authorization/policies/overview'],
          },
          {
            to: '/docs/manage/controller',
            from: ['/ziti/manage/controller.html', '/ziti/manage/manage'],
          },
          {
            to: '/docs/core-concepts/services/creating',
            from: ['/ziti/services/creating'],
          },
          {
            to: '/docs/core-concepts/security/authentication/auth',
            from: ['/ziti/security/authentication/authentication'],
          },
          {
            to: '/docs/core-concepts/metrics/',
            from: ['/ziti/metrics/overview'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/windows',
            from: ['/ziti/clients/windows'],
          },
          {
            to: '/docs/core-concepts/config-store/managing',
            from: ['/ziti/config-store/managing'],
          },
          {
            to: '/guides/mobile/android',
            from: ['/ziti-android-app/README'],
          },
          // {
          //   to: '/blog/bootstrapping-trust/part-01.encryption-everywhere',
          //   from: ['/articles/bootstrapping-trust/part-01.encryption-everywhere'],
          // },
          {
            to: '/docs/core-concepts/security/authentication/third-party-cas',
            from: ['/ziti/security/authentication/third-party-cas'],
          },
          {
            to: '/docs/core-concepts/security/authorization/auth',
            from: ['/ziti/security/authorization/authorization'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/android',
            from: ['/ziti/clients/android'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/macos',
            from: ['/ziti/clients/macos'],
          },
          {
            to: '/docs/core-concepts/config-store/consuming',
            from: ['/ziti/config-store/consuming'],
          },
          {
            to: '/guides/hsm/yubikey',
            from: ['/ziti/quickstarts/hsm/yubikey'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/iOS',
            from: ['/ziti/clients/iOS'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/',
            from: ['/ziti/downloads/overview'],
          },
          {
            to: '/docs/core-concepts/metrics/prometheus',
            from: ['/ziti/metrics/prometheus'],
          },
          {
            to: '/docs/core-concepts/security/authorization/posture-checks',
            from: ['/ziti/security/authorization/posture-checks'],
          },
          {
            to: '/docs/core-concepts/security/enrollment',
            from: ['/ziti/security/enrollment/enrollment'],
          },
          // {
          //   to: '/blog/bootstrapping-trust/part-05.bootstrapping-trust',
          //   from: ['/articles/bootstrapping-trust/part-05.bootstrapping-trust'],
          // },
          {
            to: '/docs/core-concepts/security/authentication/authentication-policies',
            from: ['/ziti/security/authentication/authentication-policies'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/creating-edge-router-policies',
            from: ['/ziti/security/authorization/policies/creating-edge-router-policies'],
          },
          {
            to: '/docs/core-concepts/security/authentication/external-jwt-signers',
            from: ['/ziti/security/authentication/external-jwt-signers'],
          },
          {
            to: '/docs/core-concepts/metrics/metric-types',
            from: ['/ziti/metrics/metric-types'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/creating-service-edge-router-policies',
            from: ['/ziti/security/authorization/policies/creating-service-edge-router-policies'],
          },
          {
            to: '/docs/core-concepts/security/authentication/certificate-management',
            from: ['/ziti/security/authentication/certificate-management'],
          },
          {
            to: '/docs/core-concepts/security/authentication/totp',
            from: ['/ziti/security/authentication/totp'],
          },
          // {
          //   to: '/blog/bootstrapping-trust/part-02.a-primer-on-public-key-cryptography',
          //   from: ['/articles/bootstrapping-trust/part-02.a-primer-on-public-key-cryptography'],
          // },
          {
            to: '/',
            from: ['/ziti/'],
          },
          {
            to: '/docs/core-concepts/security/authentication/identities',
            from: ['/ziti/security/authentication/identities'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/',
            from: ['/ziti/clients/tunneler'],
          },
          {
            to: '/docs/core-concepts/security/authentication/api-session-certificates',
            from: ['/ziti/security/authentication/api-session-certificates'],
          },
          // {
          //   to: '/blog/bootstrapping-trust/part-04.certificate-authorities-and-chains-of-trust',
          //   from: ['/articles/bootstrapping-trust/part-04.certificate-authorities-and-chains-of-trust'],
          // },
          {
            to: '/docs/core-concepts/security/authorization/policies/creating-service-policies',
            from: ['/ziti/security/authorization/policies/creating-service-policies'],
          },
          // {
          //   to: '/blog/bootstrapping-trust/part-03.certificates',
          //   from: ['/articles/bootstrapping-trust/part-03.certificates'],
          // },
          {
            to: '/api/rest/',
            from: ['/ziti/apis/edge-apis'],
          },
          {
            to: '/docs/core-concepts/config-store/overview',
            from: ['/ziti/config-store/overview'],
          },
          {
            to: '/docs/core-concepts/metrics/file',
            from: ['/ziti/metrics/file'],
          },
          {
            to: '/docs/core-concepts/metrics/inspect',
            from: ['/ziti/metrics/inspect'],
          },
        ],
        createRedirects(existingPath) {
          if (existingPath.includes('/blog')) {
            // Redirect from /articles/X to /blog/X
            return [
              existingPath.replace('/blog', '/articles'),
            ];
          } 
          else 
          if (existingPath.includes('/docs')) {
            // Redirect from /ziti/X to /docs/X
            return [
              existingPath.replace('/docs', '/ziti'),
            ];
          }
          return undefined; // Return a falsy value: no redirect created
        },
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
        debug: true
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        // The application ID provided by Algolia
        appId: 'EYL355ZRV9',
  
        // Public API key: it is safe to commit it
        apiKey: '96f3340e859a20220001b4a0bb73c451',
  
        indexName: 'prod_DOCUSAURUS',
  
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
            to: '/docs/introduction/intro',
            label: 'Docs',
            position: 'left',
            activeBaseRegex: `/docs/`,
          },
          {
            to: '/api/',
            label: 'APIs',
            position: 'left',
            activeBaseRegex: `/api/`,
          },
          {
            to: '/guides/',
            label: 'Guides',
            position: 'left',
            activeBaseRegex: `/guides/`,
          },
          {
            to: '/glossary/glossary',
            label: 'Glossary',
            position: 'left',
            activeBaseRegex: `/glossary/`,
          },
          // {
          //   to: '/blog',
          //   label: 'Blog',
          //   position: 'right'
          // },
          {
            href: 'https://github.com/openziti/ziti',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
        ],
        copyright: `Copyright © ${new Date().getFullYear()} NetFoundry Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
