// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

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
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      announcementBar: {
        content:
            '⭐️If you like OpenZiti, help spread the word by giving it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/openziti/ziti">GitHub</a>! ⭐️',
        isCloseable: false,
        id: 'github-stars'
      },
      navbar: {
        title: '',
        logo: {
          alt: 'OpenZiti',
          src: 'img/ziti-logo-dark.svg',
          height: "100px",
        },
        items: [
          {
            type: 'doc',
            docId: 'quickstarts/network/quickstartOverview',
            position: 'left',
            label: 'Get Started',
          },
          {
            type: 'doc',
            docId: 'introduction/intro',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'doc',
            docId: 'api/api',
            position: 'left',
            label: 'API Documentation',
          },
          {
            type: 'doc',
            docId: 'glossary/glossary',
            position: 'left',
            label: 'Glossary',
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
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
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
