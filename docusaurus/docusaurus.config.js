// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// This docusaurus.config.js is used by GitHub Pages to build the site with baseUrl: '/docusaurus/'

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenZiti',
  tagline: 'OpenZiti Tagline',
  url: 'https://openziti.io',
  baseUrl: '/docusaurus/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',

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
        blog: {
          blogTitle: 'OpenZiti Technical Blog',
          blogDescription: 'OpenZiti Blog Desc',
          showReadingTime: true,

        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
          {
            to: '/blog',
            label: 'Blog',
            position: 'right'
          },
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
