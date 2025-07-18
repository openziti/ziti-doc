import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

import {themes as prismThemes} from 'prism-react-renderer';
import {Config} from "@docusaurus/types";
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';
import pluginHotjar from './src/plugins/hotjar';
import type { Options as ClientRedirectsOptions } from '@docusaurus/plugin-client-redirects';
import remarkReplaceMetaUrl from './src/plugins/remark/remark-replace-meta-url';
import {remarkScopedPath} from "./src/plugins/remark/remarkScopedPath";

const baseUrlConst = '/';
const hotjarId = process.env.ZITI_HOTJAR_APPID || "6443327"; //default localdev hotjarId

const docsBase = process.env.DEPLOY_ENV === 'kinsta' ? '' : '/docs'
function docUrl(path:string): string {
  return docsBase + path;
}

const config: Config = {
  title: 'OpenZiti',
  tagline: 'Replacing Infrastructure With Software',
  url: 'https://openziti.io/',
  baseUrl: baseUrlConst,
  trailingSlash: undefined,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  onDuplicateRoutes: 'throw',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'OpenZiti', // Usually your GitHub org/username.
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
    [pluginHotjar, {}],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-policies',
        path: 'docs-policies',
        routeBasePath: 'policies',
        sidebarPath: require.resolve('./sidebar-policies.ts'),
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
          if ( path.startsWith(docUrl("/guides/topologies/gateway/")) ) {
            return [path.replace(docUrl("/guides/topologies/gateway/"),docUrl("/guides/local-gateway/"))];
          }
          if ( path.startsWith(docUrl("/guides/deployments/kubernetes/")) ) {
            return [path.replace(docUrl("/guides/deployments/kubernetes/"), docUrl("/guides/kubernetes/hosting/"))];
          }
          if ( path.startsWith(docUrl("/reference/tunnelers/kubernetes/")) ) {
            return [path.replace(docUrl("/reference/tunnelers/kubernetes/"),docUrl("/guides/kubernetes/workload-tunneling/"))];
          }
          if ( path.startsWith(docUrl("/guides/deployments/")) ) {
            return [
              path.replace(docUrl("/guides/deployments/"),docUrl("/reference/deployments/")),
            ];
          }
          if ( path.startsWith(docUrl("/reference/developer/api/")) ) {                       // for each existing page
            return [
              path.replace(docUrl("/reference/developer/api/"),"/api/"),                      // return a "from" redirect for each old path
              path.replace(docUrl("/reference/developer/api/"),"/api/rest/"),
              path.replace(docUrl("/reference/developer/api/"),"/api/rest/edge-apis/")
            ];
          }
          if ( path.startsWith(docUrl("/learn/quickstarts/")) ) {
            return [path.replace(docUrl("/learn/quickstarts/"),docUrl("/quickstarts/"))];
          }
          if ( path.startsWith(docUrl("/learn/core-concepts/zero-trust-models/")) ) {
            return [
              path.replace(docUrl("/learn/core-concepts/zero-trust-models/"),docUrl("/deployment-architecture/")),
              path.replace(docUrl("/learn/core-concepts/zero-trust-models/"),docUrl("/core-concepts/zero-trust-models/"))
            ];
          }
          if ( path.startsWith(docUrl("/learn/core-concepts/")) ) {
            return [path.replace(docUrl("/learn/core-concepts/"),docUrl("/core-concepts/"))];
          }
          if ( path.startsWith(docUrl("/learn/introduction/")) ) {
            return [path.replace(docUrl("/learn/introduction/"),docUrl("/introduction/"))];
          }
          return undefined;
        },
        redirects: [
          {
            to: docUrl('/category/deployments'),
            from: [docUrl('/reference/deployments')]
          },
          {
            to: docUrl('/guides/deployments/linux/controller/deploy'),
            from: [docUrl('/reference/deployments/controller')]
          },
          {
            to: docUrl('/guides/deployments/linux/router/cli-mgmt'),
            from: [docUrl('/reference/deployments/router/cli-mgmt')]
          },
          {
            to: docUrl('/guides/deployments/linux/router/deploy'),
            from: [docUrl('/reference/deployments/router/deployment')]
          },
          {
            to: docUrl('/guides/deployments/linux/router/router-configuration'),
            from: [docUrl('/reference/deployments/router/router-configuration')]
          },
          {
            to: docUrl('/reference/tunnelers/docker'),
            from: [docUrl('/reference/tunnelers/linux/container')]
          },
          {
            to: docUrl('/category/core-concepts'),
            from: [docUrl('/learn/core-concepts')]
          },
          {
            to: docUrl('/reference/tunnelers/nginx'),
            from: [docUrl('/guides/securing-apis/aks-api-with-nginx-ziti-module')]
          },
          {
            to: docUrl('/category/cloud'),
            from: [docUrl('/guides/Public_Cloud_Deployment')]
          },
          {
            to: docUrl('/guides/topologies/services'),
            from: [docUrl('/guides/Public_Cloud_Deployment/Services')]
          },
          {
            to: docUrl('/guides/deployments/cloud/router'),
            from: [docUrl('/guides/Public_Cloud_Deployment/Router')]
          },
          {
            to: docUrl('/guides/deployments/cloud/controller'),
            from: [docUrl('/guides/Public_Cloud_Deployment/Controller')]
          },
          {
            to: docUrl('/guides/topologies/gateway/tunneler'),
            from: [docUrl('/guides/Local_Gateway/EdgeTunnel')]
          },
          {
            to: docUrl('/guides/topologies/gateway/router'),
            from: [docUrl('/guides/Local_Gateway/EdgeRouter')]
          },
          {
            to: docUrl('/guides/deployments/linux/controller/backup'),
            from: [docUrl('/guides/database-backup'), docUrl('/reference/backup/controller')]
          },
          {
            to: docUrl('/reference/tunnelers/nginx'),
            from: [docUrl('/category/securing-apis')]
          },
          {
            to: docUrl('/category/cloud'),
            from: [docUrl('/category/public-cloud-deployment')]
          },
          {
            to: docUrl('/category/gateway'),
            from: [docUrl('/category/local-gateway')]
          },
          {
            to: docUrl('/category/kubernetes'),
            from: [docUrl('/category/hosting-openziti')]
          },
          {
            to: '/blog/',
            from: ['/blog/zitification/prometheus/part1']
          },
          {
            to: docUrl('/learn/core-concepts/data-flow-explainer'),
            from: [docUrl('/guides/data-flow-explainer')],
          },
          {
            to: docUrl('/learn/core-concepts/metrics/overview'),
            from: [docUrl('/core-concepts/metrics'), docUrl('/core-concepts/metrics/metric-types')],
          },
          {
            to: docUrl('/learn/core-concepts/security/authentication/external-jwt-signers'),
            from: ['/ziti/security/authentication/external-jwt-signers.html'],
          },
          {
            to: docUrl('/learn/core-concepts/identities/enrolling'),
            from: ['/ziti/identities/enrolling.html'],
          },
          {
            to: docUrl('/reference/tunnelers/'),
            from: ['/ziti/clients/tunneler.html'],
          },
          {
            to: docUrl('/reference/tunnelers/linux/'),
            from: ['/ziti/clients/linux.html'],
          },
          {
            to: docUrl('/learn/core-concepts/pki'),
            from: [docUrl('/manage/pki'), '/operations/pki'],
          },
          {
            to: docUrl('/reference/developer/sdk'),
            from: ['/api/ziti-sdk-swift', '/api/ziti-c-sdk', '/api/ziti-sdk-csharp'],
          },
          {
            to: docUrl('/reference/developer/sdk'),
            from: [docUrl('/core-concepts/clients/sdks')],
          },
          {
            to: docUrl('/learn/introduction/'),
            from: [docUrl('/learn'), docUrl('/introduction/intro'), '/docusaurus/docs/overview', '/ziti/overview/', '/ziti/overview.html'],
          },
          {
            to: docUrl('/learn/quickstarts/'),
            from: ['/ziti/quickstarts/quickstart-overview.html', '/ziti/quickstarts/networks-overview.html', docUrl('/learn/quickstarts/network'), docUrl('/quickstarts/network')],
          },
          {
            to: docUrl('/learn/introduction/openziti-is-software'),
            from: [docUrl('/introduction/zitiSoftwareArchitecture'), '/ziti/software-architecture.html'],
          },
          {
            to: '/policies/CODE_OF_CONDUCT',
            from: ['/policies'],
          },
          {
            to: docUrl('/learn/quickstarts/services/'),
            from: [docUrl('/quickstarts/services/ztna')],
          },
          {
            to: docUrl('/learn/quickstarts/zac/'),
            from: [docUrl('/quickstarts/zac/installation')],
          },
          {
            to: docUrl('/guides/external-auth/browzer/'),
            from: [docUrl('/identity-providers-for-browZer')]
          }
        ],
      } satisfies ClientRedirectsOptions,
    ],
  ],
  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          routeBasePath: docsBase,
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
            [remarkReplaceMetaUrl, { from: '_baseurl_', to: baseUrlConst }],
            [remarkScopedPath,
              {
                debug: false,
                mappings: [
                  { from: '@openzitidocs', to: docsBase },
                ],
              },
            ]
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
      } satisfies Options),
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
    {
      hotjar: { applicationId: hotjarId },
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
  
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites, and we want to navigate with window.location.href to them.
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
          target: "_self",
        },
        items: [
          {
            type: 'html',
            value: '<a class="navbar__item navbar__link header-netfoundry-link" href="https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/" target="_blank">NetFoundry</a>',
            position: 'right'
          },
          {
            to: docUrl('/learn/introduction/'),
            label: 'Documentation',
            position: 'right',
            activeBaseRegex: docUrl('/(?!downloads)'),
          },
          {
            to: docUrl('/downloads'),
            label: 'Downloads',
            position: 'right',
            activeBaseRegex: docUrl('/downloads'),
          },
          {
            type: 'html',
            value: '<a class="navbar__item navbar__link header-netfoundry-link" href="https://blog.openziti.io/" target="_blank">Blog</a>',
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
                value: `<a href="https://www.youtube.com/OpenZiti" target="_blank" title="OpenZiti on YouTube"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="${baseUrlConst}img/yt.svg" alt="YouTube logo"/>YouTube</span></a>`
              },
              {
                type: 'html',
                value: `<a href="https://x.com/OpenZiti" target="_blank" title="OpenZiti on X(formerly Twitter)"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="${baseUrlConst}img/twit.svg" alt="X/Twitter logo"/>X (Twitter)</span></a>`
              },
              {
                type: 'html',
                value: `<a href="https://www.reddit.com/r/openziti" target="_blank" title="OpenZiti Subreddit"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="${baseUrlConst}img/reddit-logo.png" alt="Reddit logo"/>Reddit</span></a>`
              },
              {
                type: 'html',
                value: `<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="${baseUrlConst}img/ziggy.png" alt="X/Twitter Ziggy logo"/><a href="https://x.com/OpenZiggy" target="_blank" title="OpenZiggy on X(formerly Twitter)">Ziggy</span></a>`
              },
              {
                type: 'html',
                value: '<div class="text-divider"><p>Other</p></div>'
              },
              {
                type: 'html',
                value: `<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="${baseUrlConst}img/blog-icon.png" alt="OpenZiti blog logo"/><a href="https://blog.openziti.io/" target="_blank" title="Blog">Blog</span></a>`
              },
              {
                type: 'html',
                value: `<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="${baseUrlConst}img/oz-test-kitchen.png" alt="OpenZiti Test Kitchen logo"/><a href="https://github.com/openziti-test-kitchen" target="_blank" title="Git project for the test kitchen">Test Kitchen</span></a>`
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
    } satisfies ThemeConfig,
};

module.exports = config;
