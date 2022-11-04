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
  trailingSlash: undefined,
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
            from: ['/ziti/overview.html'],
          },
          {
            to: '/docs/quickstarts/services/ztha',
            from: ['/ziti/quickstarts/services/host-access.html'],
          },
          {
            to: '/docs/quickstarts/network/',
            from: ['/ziti/quickstarts/quickstart-overview.html'],
          },
          {
            to: '/api/ziti-sdk-csharp',
            from: ['/api/csharp/NetFoundry.html'],
          },
          {
            to: '/docs/core-concepts/clients/choose',
            from: ['/ziti/clients/which-client.html'],
          },
          {
            to: '/docs/core-concepts/services/overview',
            from: ['/ziti/services/overview.html'],
          },
          {
            to: '/docs/core-concepts/identities/overview',
            from: ['/ziti/identities/overview.html'],
          },
          {
            to: '/docs/introduction/openziti-is-software',
            from: ['/docs/introduction/zitiSoftwareArchitecture', '/ziti/software-architecture.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/linux/',
            from: ['/ziti/clients/linux.html'],
          },
          {
            to: '/docs/core-concepts/security/overview',
            from: ['/ziti/security/overview.html'],
          },
          {
            to: '/docs/core-concepts/identities/creating',
            from: ['/ziti/identities/creating.html'],
          },
          {
            to: '/guides/hsm/',
            from: ['/ziti/quickstarts/hsm-overview.html'],
          },
          {
            to: '/docs/core-concepts/clients/sdks',
            from: ['/ziti/clients/sdks', '/ziti/clients/sdks.html'],
          },
          {
            to: '/guides/hsm/softhsm',
            from: ['/ziti/quickstarts/hsm/softhsm.html'],
          },
          {
            to: '/docs/core-concepts/identities/enrolling',
            from: ['/ziti/identities/enrolling.html'],
          },
          {
            to: '/guides/kubernetes/kubernetes-sidecar-tunnel-quickstart',
            from: ['/ziti-cmd/quickstart/kubernetes/sidecar-tunnel/kubernetes-sidecar-tunnel-quickstart.html'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/overview',
            from: ['/ziti/security/authorization/policies/overview.html'],
          },
          {
            to: '/docs/manage/controller',
            from: ['/ziti/manage/controller.html', '/ziti/manage/manage.html'],
          },
          {
            to: '/docs/core-concepts/services/overview',
            from: ['/ziti/services/creating.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/auth',
            from: ['/ziti/security/authentication/authentication.html'],
          },
          {
            to: '/docs/core-concepts/metrics/',
            from: ['/ziti/metrics/overview.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/windows',
            from: ['/ziti/clients/windows.html'],
          },
          {
            to: '/docs/core-concepts/config-store/managing',
            from: ['/ziti/config-store/managing.html'],
          },
          {
            to: '/guides/mobile/android',
            from: ['/ziti-android-app/README.html'],
          },
          {
            to: '/blog/bootstrapping-trust/part-01.encryption-everywhere',
            from: ['/articles/bootstrapping-trust/part-01.encryption-everywhere.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/third-party-cas',
            from: ['/ziti/security/authentication/third-party-cas.html'],
          },
          {
            to: '/docs/core-concepts/security/authorization/auth',
            from: ['/ziti/security/authorization/authorization.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/android',
            from: ['/ziti/clients/android.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/macos',
            from: ['/ziti/clients/macos.html'],
          },
          {
            to: '/docs/core-concepts/config-store/consuming',
            from: ['/ziti/config-store/consuming.html'],
          },
          {
            to: '/guides/hsm/yubikey',
            from: ['/ziti/quickstarts/hsm/yubikey.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/iOS',
            from: ['/ziti/clients/iOS.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/',
            from: ['/ziti/downloads/overview.html'],
          },
          {
            to: '/docs/core-concepts/metrics/prometheus',
            from: ['/ziti/metrics/prometheus.html'],
          },
          {
            to: '/docs/core-concepts/security/authorization/posture-checks',
            from: ['/ziti/security/authorization/posture-checks.html'],
          },
          {
            to: '/docs/core-concepts/security/enrollment',
            from: ['/ziti/security/enrollment/enrollment.html'],
          },
          {
            to: '/blog/bootstrapping-trust/part-05.bootstrapping-trust',
            from: ['/articles/bootstrapping-trust/part-05.bootstrapping-trust.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/authentication-policies',
            from: ['/ziti/security/authentication/authentication-policies.html'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/creating-edge-router-policies',
            from: ['/ziti/security/authorization/policies/creating-edge-router-policies.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/external-jwt-signers',
            from: ['/ziti/security/authentication/external-jwt-signers.html'],
          },
          {
            to: '/docs/core-concepts/metrics/metric-types',
            from: ['/ziti/metrics/metric-types.html'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/creating-service-edge-router-policies',
            from: ['/ziti/security/authorization/policies/creating-service-edge-router-policies.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/certificate-management',
            from: ['/ziti/security/authentication/certificate-management.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/totp',
            from: ['/ziti/security/authentication/totp.html'],
          },
          {
            to: '/blog/bootstrapping-trust/part-02.a-primer-on-public-key-cryptography',
            from: ['/articles/bootstrapping-trust/part-02.a-primer-on-public-key-cryptography.html'],
          },
          {
            to: '/',
            from: ['/ziti'],
          },
          {
            to: '/docs/core-concepts/security/authentication/identities',
            from: ['/ziti/security/authentication/identities.html'],
          },
          {
            to: '/docs/core-concepts/clients/tunnelers/',
            from: ['/ziti/clients/tunneler', '/ziti/clients/tunneler.html'],
          },
          {
            to: '/docs/core-concepts/security/authentication/api-session-certificates',
            from: ['/ziti/security/authentication/api-session-certificates.html'],
          },
          {
            to: '/blog/bootstrapping-trust/part-04.certificate-authorities-and-chains-of-trust',
            from: ['/articles/bootstrapping-trust/part-04.certificate-authorities-and-chains-of-trust.html'],
          },
          {
            to: '/docs/core-concepts/security/authorization/policies/creating-service-policies',
            from: ['/ziti/security/authorization/policies/creating-service-policies.html'],
          },
          {
            to: '/blog/bootstrapping-trust/part-03.certificates',
            from: ['/articles/bootstrapping-trust/part-03.certificates.html'],
          },
          {
            to: '/api/rest/',
            from: ['/ziti/apis/edge-apis.html'],
          },
          {
            to: '/docs/core-concepts/config-store/overview',
            from: ['/ziti/config-store/overview', '/ziti/config-store/overview.html'],
          },
          {
            to: '/docs/core-concepts/metrics/file',
            from: ['/ziti/metrics/file.html'],
          },
          {
            to: '/docs/core-concepts/metrics/inspect',
            from: ['/ziti/metrics/inspect.html'],
          },
          {
            to: '/docs/manage/pki',
            from: ['/ziti/manage/pki.html'],
          },
          {
            to: '/blog/c-sdk-on-beaglebone',
            from: ['/articles/c-sdk-on-beaglebone.html'],
          },
          {
            to: '/blog/golang-aha/article',
            from: ['/articles/golang-aha/article.html'],
          },
          {
            to: '/blog',
            from: ['/articles/index.html'],
          },
          {
            to: '/blog/zitification',
            from: ['/articles/zitification/index.html'],
          },
          {
            to: '/blog/zitification/kubernetes',
            from: ['/articles/zitification/kubernetes/index.html'],
          },
          {
            to: '/blog/zitification/prometheus/part1',
            from: ['/articles/zitification/prometheus/part1.html'],
          },
          {
            to: '/blog/zitification/prometheus/part2',
            from: ['/articles/zitification/prometheus/part2.html'],
          },
          {
            to: '/blog/zitification/prometheus/part3',
            from: ['/articles/zitification/prometheus/part3.html'],
          },
          {
            to: '/blog/zitification/zitifying-scp',
            from: ['/articles/zitification/zitifying-scp/index.html'],
          },
          {
            to: '/blog/zitification/zitifying-ssh',
            from: ['/articles/zitification/zitifying-ssh/index.html'],
          },
          {
            to: '/docs/quickstarts/network/hosted',
            from: ['/ziti/quickstarts/network/hosted.html'],
          },
          {
            to: '/docs/quickstarts/network/local-docker-compose',
            from: ['/ziti/quickstarts/network/local-docker-compose.html'],
          },
          {
            to: '/docs/quickstarts/network/local-no-docker',
            from: ['/ziti/quickstarts/network/local-no-docker.html'],
          },
          {
            to: '/docs/quickstarts/network/local-with-docker',
            from: ['/ziti/quickstarts/network/local-with-docker.html'],
          },
          {
            to: '/docs/quickstarts/services/',
            from: ['/ziti/quickstarts/services/index.html'],
          },
          {
            to: '/docs/quickstarts/zac/installation',
            from: ['/ziti/quickstarts/zac/installation.html'],
          },
          {
            to: '/docs/introduction/openziti-is-software',
            from: ['/policies/CONTRIBUTING.html'],
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
            href: 'https://openziti.discourse.group/',
            position: 'right',
            className: 'header-discourse-link',
          },
          {
            href: 'https://github.com/openziti/ziti',
            position: 'right',
            className: 'header-github-link',
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
