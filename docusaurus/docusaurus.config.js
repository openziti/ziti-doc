// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// This docusaurus.config.js is used by GitHub Pages to build the site with baseUrl: '/docusaurus/'
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenZiti',
  tagline: 'Replacing Infrastructure With Software',
  url: 'https://openziti.io/',
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

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-policies',
        path: 'docs-policies',
        routeBasePath: 'policies',
        sidebarPath: require.resolve('./sidebar-policies.js'),
        beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives, ],
        remarkPlugins: [
          require('./src/plugins/remark/remark-yaml-table'),
          require('./src/plugins/remark/remark-code-block'),
        ],
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        createRedirects: path => {
          return undefined;
        },
        redirects: [],
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
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            '**/_remotes/**'
          ],
          editUrl: 'https://github.com/openziti/ziti-doc/tree/main/docusaurus',
          beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives, ],
          remarkPlugins: [
            require('./src/plugins/remark/remark-yaml-table'),
            require('./src/plugins/remark/remark-code-block'),
          ],
          showLastUpdateTime: true
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        debug: true,
        googleTagManager: {
          containerId: 'GTM-5SF399H3',
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
    {
      metadata: [
        {name: 'description', content: 'open source zero trust'},
        {name: 'robots', content: 'index, follow'},
      ],
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
        },
      },
      navbar: {
        title: '',
        hideOnScroll: false,
        logo: {
          alt: 'The OpenZiti logo, an open source zero trust network overlay',
          src: 'img/ziti-logo-dark.svg',
          srcDark: 'img/ziti-logo-light.svg',
          href: 'https://openziti.io',
          target: "_self",
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
                value: '<a href="https://x.com/OpenZiti" target="_blank" title="OpenZiti on X(formerly Twitter)"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/twit.svg"/>Twitter</span></a>'
              },
              {
                type: 'html',
                value: '<a href="https://www.reddit.com/r/openziti" target="_blank" title="OpenZiti Subreddit"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/reddit-logo.png"/>Reddit</span></a>'
              },
              {
                type: 'html',
                value: '<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/ziggy.png"/><a href="https://x.com/OpenZiggy" target="_blank" title="OpenZiggy on Twitter">Ziggy</span></a>'
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
                value: '<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="/img/oz-test-kitchen.png"/><a href="https://github.com/openziti-test-kitchen" target="_blank" title="Git project for the test kitchen">Test Kitchen</span></a>'
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
            label: 'NetFoundry Cloud',
            to: 'https://netfoundry.io/products/netfoundry-platform/netfoundry-cloud-for-openziti/'
          },
          {
            label: 'Blog',
            to: 'https://blog.openziti.io'
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} NetFoundry Inc.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        // scala necessary to avoid Cannot set properties of undefined (setting 'triple-quoted-string')
        // see https://github.com/Redocly/redoc/issues/2511
        additionalLanguages: ['python', 'java', 'csharp', 'go', 'bash', 'scala'],
      },
    },
};

module.exports = config;

{
  plugins: [
    'docusaurus-plugin-hotjar',
  ]
}
