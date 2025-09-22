import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

import {themes as prismThemes} from 'prism-react-renderer';
import {Config} from "@docusaurus/types";
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';
import pluginHotjar from './src/plugins/hotjar';
import type { Options as ClientRedirectsOptions } from '@docusaurus/plugin-client-redirects';
import {
    docUrl, addDocsRedir,
    DOCUSAURUS_URL, DOCUSAURUS_DEBUG, hotjarId
} from "@openclint/docusaurus-shared/node";
import path from "node:path";
import {remarkYouTube, remarkReplaceMetaUrl, remarkScopedPath} from "@openclint/docusaurus-shared/plugins";
const baseUrl = '/';
const openziti = 'openziti';
const docsBase = `${baseUrl}/docs/${openziti}`;

const REMARK_MAPPINGS = [
    { from: '@onpremdocs',   to: '/onprem' },
    { from: '@openzitidocs', to: `/docs/openziti`},
];

const redirectsArr: { to: string; from: string[] }[] = [
  {
    to: docUrl(openziti, '/category/deployments'),
    from: [docUrl(docsBase, '/reference/deployments')]
  },
  {
    to: docUrl(openziti, '/guides/external-auth/browzer/'),
    from: [docUrl(docsBase, '/identity-providers-for-browZer')]
  }
];

addDocsRedir(redirectsArr); //add a redirect from /docs to the actual docs path if needed

const port =
    (() => {
      const idx = process.argv.indexOf('--port');
      return idx !== -1 ? process.argv[idx + 1] : 3000;
    })();

const config: Config = {
    title: 'OpenZiti',
    tagline: 'Replacing Infrastructure With Software',
    url: `http://localhost:${port}`,
    baseUrl: '/docs',
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
    themes: [
        ['@docusaurus/theme-classic', {
            customCss: require.resolve('./src/css/custom.css'),
        }],
        '@docusaurus/theme-mermaid',
        '@docusaurus/theme-search-algolia',
    ],
    customFields: {
        DOCUSAURUS_BASE_PATH: '/',
        DOCUSAURUS_DOCS_PATH: docsBase,
        OPENZITI_DOCS_BASE: '/docs/openziti',
    },
    plugins: [
        function webpackAliases() {
            return {
                name: 'unified-doc-webpack-aliases',
                configureWebpack() {
                    return {
                        resolve: {
                            alias: {
                                '@openziti': path.resolve(__dirname, `./`),
                            },
                        },
                    };
                },
            };
        },
        [pluginHotjar, {}],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'docs-policies',
                path: 'docs-policies',
                routeBasePath: 'policies',
                sidebarPath: require.resolve('./sidebar-policies.ts'),
                beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives,],
                remarkPlugins: [
                    require('./src/plugins/remark/remark-yaml-table'),
                    require('./src/plugins/remark/remark-code-block'),
                ],
            },
        ],
        [
            '@docusaurus/plugin-content-blog',
            {
                showReadingTime: true,
                routeBasePath: 'openziti/blog',
                tagsBasePath: 'tags',
                include: ['**/*.{md,mdx}'],
                path: 'blog',
                remarkPlugins: [
                    remarkYouTube,
                    [remarkReplaceMetaUrl, {from: '@staticoz', to: 'openziti'}],
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS }],
                ],
                blogSidebarCount: 'ALL',
                blogSidebarTitle: 'All posts',
            },
        ],
        [
            '@docusaurus/plugin-client-redirects',
            {
                createRedirects: path => {
                    if (path.startsWith(docUrl(docsBase, "/guides/topologies/gateway/"))) {
                        return [path.replace(docUrl(docsBase, "/guides/topologies/gateway/"), docUrl(docsBase, "/guides/local-gateway/"))];
                    }
                    if (path.startsWith(docUrl(docsBase, "/guides/deployments/kubernetes/"))) {
                        return [path.replace(docUrl(docsBase, "/guides/deployments/kubernetes/"), docUrl(docsBase, "/guides/kubernetes/hosting/"))];
                    }
                    if (path.startsWith(docUrl(docsBase, "/reference/tunnelers/kubernetes/"))) {
                        return [path.replace(docUrl(docsBase, "/reference/tunnelers/kubernetes/"), docUrl(docsBase, "/guides/kubernetes/workload-tunneling/"))];
                    }
                    if (path.startsWith(docUrl(docsBase, "/guides/deployments/"))) {
                        return [
                            path.replace(docUrl(docsBase, "/guides/deployments/"), docUrl(docsBase, "/reference/deployments/")),
                        ];
                    }
                    if (path.startsWith(docUrl(docsBase, "/reference/developer/api/"))) {                       // for each existing page
                        return [
                            path.replace(docUrl(docsBase, "/reference/developer/api/"), "/api/"),                      // return a "from" redirect for each old path
                            path.replace(docUrl(docsBase, "/reference/developer/api/"), "/api/rest/"),
                            path.replace(docUrl(docsBase, "/reference/developer/api/"), "/api/rest/edge-apis/")
                        ];
                    }
                    if (path.startsWith(docUrl(docsBase, "/learn/quickstarts/"))) {
                        return [path.replace(docUrl(docsBase, "/learn/quickstarts/"), docUrl(docsBase, "/quickstarts/"))];
                    }
                    if (path.startsWith(docUrl(docsBase, "/learn/core-concepts/zero-trust-models/"))) {
                        return [
                            path.replace(docUrl(docsBase, "/learn/core-concepts/zero-trust-models/"), docUrl(docsBase, "/deployment-architecture/")),
                            path.replace(docUrl(docsBase, "/learn/core-concepts/zero-trust-models/"), docUrl(docsBase, "/core-concepts/zero-trust-models/"))
                        ];
                    }
                    if (path.startsWith(docUrl(docsBase, "/learn/core-concepts/"))) {
                        return [path.replace(docUrl(docsBase, "/learn/core-concepts/"), docUrl(docsBase, "/core-concepts/"))];
                    }
                    if (path.startsWith(docUrl(docsBase, "/learn/introduction/"))) {
                        return [path.replace(docUrl(docsBase, "/learn/introduction/"), docUrl(docsBase, "/introduction/"))];
                    }
                    return undefined;
                },
                redirects: redirectsArr,
            } satisfies ClientRedirectsOptions,
        ],
        ['@docusaurus/plugin-google-tag-manager', {id: `openziti-gtm`, containerId: 'GTM-5SF399H3'}],
        ['@docusaurus/plugin-content-pages',{id: `openziti-root-pages`, path: `src/pages`, routeBasePath: '/'}],
        ['@docusaurus/plugin-content-pages',{id: `openziti-pages`, path: `src/pages`, routeBasePath: 'openziti'}],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'openziti',
                path: `docs`,
                routeBasePath: 'openziti',
                sidebarPath: `sidebars.ts`,
                includeCurrentVersion: true,
                remarkPlugins: [
                    [remarkReplaceMetaUrl, {from: '@staticoz', to: 'openziti'}],
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS }],
                ],
            },
        ],
    ],
    presets: [
        [ // Redocusaurus config
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
            hotjar: {applicationId: hotjarId},
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
                        to: docUrl(docsBase, '/learn/introduction/'),
                        label: 'Documentation',
                        position: 'right',
                        activeBaseRegex: docUrl(docsBase, '/(?!downloads)'),
                    },
                    {
                        to: docUrl(docsBase, '/downloads'),
                        label: 'Downloads',
                        position: 'right',
                        activeBaseRegex: docUrl(docsBase, '/downloads'),
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
                                value: `<a href="https://www.youtube.com/OpenZiti" target="_blank" title="OpenZiti on YouTube"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="` + docUrl(docsBase, "img/yt.svg") + `" alt="YouTube logo"/>YouTube</span></a>`
                            },
                            {
                                type: 'html',
                                value: `<a href="https://x.com/OpenZiti" target="_blank" title="OpenZiti on X(formerly Twitter)"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="` + docUrl(docsBase, "img/twit.svg") + `" alt="X/Twitter logo"/>X (Twitter)</span></a>`
                            },
                            {
                                type: 'html',
                                value: `<a href="https://www.reddit.com/r/openziti" target="_blank" title="OpenZiti Subreddit"><span id="navbarDropdownItem"><img id="navbarDropdownImage" src="` + docUrl(docsBase, "img/reddit-logo.png") + `" alt="Reddit logo"/>Reddit</span></a>`
                            },
                            {
                                type: 'html',
                                value: `<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="` + docUrl(docsBase, "img/ziggy.png") + `" alt="X/Twitter Ziggy logo"/><a href="https://x.com/OpenZiggy" target="_blank" title="OpenZiggy on X(formerly Twitter)">Ziggy</span></a>`
                            },
                            {
                                type: 'html',
                                value: '<div class="text-divider"><p>Other</p></div>'
                            },
                            {
                                type: 'html',
                                value: `<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="` + docUrl(docsBase, "img/blog-icon.png") + `" alt="OpenZiti blog logo"/><a href="https://blog.openziti.io/" target="_blank" title="Blog">Blog</span></a>`
                            },
                            {
                                type: 'html',
                                value: `<span id="navbarDropdownItem"><img id="navbarDropdownImage" src="` + docUrl(docsBase, "img/oz-test-kitchen.png") + `" alt="OpenZiti Test Kitchen logo"/><a href="https://github.com/openziti-test-kitchen" target="_blank" title="Git project for the test kitchen">Test Kitchen</span></a>`
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
