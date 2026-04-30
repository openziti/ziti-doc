import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

import {themes as prismThemes} from 'prism-react-renderer';
import {Config} from "@docusaurus/types";
import type {ThemeConfig} from '@docusaurus/preset-classic';
import pluginHotjar from './src/plugins/hotjar';
import type {Options as ClientRedirectsOptions} from '@docusaurus/plugin-client-redirects';
import {docUrl, hotjarId} from "@netfoundry/docusaurus-theme/node";
import {
    consoleLinkAbs, frontdoorLinkAbs, selfhostedLinkAbs,
    zlanLinkAbs, openzitiLinkAbs, zrokLinkAbs,
} from "@netfoundry/docusaurus-theme";
import path from "node:path";
import {openZitiFooter} from "./src/components/footer";
import {openzitiDocsPluginConfig, openzitiRedocSpecs} from "./docusaurus-plugin-openziti-docs";
import {
    remarkReplaceMetaUrl,
    remarkScopedPath,
    remarkYamlTable,
    remarkYouTube,
    timedPlugin
} from "@netfoundry/docusaurus-theme/plugins";

const baseUrl = '/';
const openziti = 'openziti';
const docsBase = `/docs/${openziti}`;

const REMARK_MAPPINGS = [
    { from: '@openzitidocs',    to: `${docsBase}`},
    { from: '@selfhosteddocs',  to: 'https://netfoundry.io/docs/selfhosted' },
    { from: '@zrokdocs',        to: 'https://netfoundry.io/docs/zrok' },
    { from: '@frontdoordocs',   to: 'https://netfoundry.io/docs/frontdoor' },
    { from: '@zlandocs',        to: 'https://netfoundry.io/docs/zlan' },
    { from: '@static', to: ``},
];

const redirectsArr: { to: string; from: string[] }[] = [
  {
    to: docUrl(docsBase, '/how-to-guides/external-auth/browzer'),
    from: [docUrl(docsBase, '/identity-providers-for-browZer')]
  }
];

const port =
    (() => {
      const idx = process.argv.indexOf('--port');
      return idx !== -1 ? process.argv[idx + 1] : 3000;
    })();

const config: Config = {
    title: 'OpenZiti',
    tagline: 'Replacing Infrastructure With Software',
    url: `http://localhost:${port}`,
    baseUrl: `/`,
    trailingSlash: undefined,
    onBrokenLinks: 'throw',
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
        hooks: {
            onBrokenMarkdownLinks: 'throw',
        },
    },
    themes: [
        ['@docusaurus/theme-classic', {
            customCss: [
                require.resolve('./src/css/custom.css'),
                require.resolve('@netfoundry/docusaurus-theme/css/product-picker.css'),
            ],
        }],
        '@docusaurus/theme-mermaid',
        '@netfoundry/docusaurus-theme',
    ],
    customFields: {
        DOCUSAURUS_BASE_PATH: '/docs',
        DOCUSAURUS_DOCS_PATH: docsBase,
        OPENZITI_DOCS_BASE: docsBase,
    },
    plugins: [
        function webpackAliases() {
            return {
                name: 'unified-doc-webpack-aliases',
                configureWebpack() {
                    return {
                        resolve: {
                            alias: {
                                '@openziti':         path.resolve(__dirname, `./`),
                                '@openziti_remotes': path.resolve(__dirname, `./docs/_remotes`),
                            },
                        },
                    };
                },
            };
        },
        [pluginHotjar, {}],
        [
            '@docusaurus/plugin-content-blog',
            {
                showReadingTime: true,
                routeBasePath: `${docsBase}/blog`,
                tagsBasePath: 'tags',
                include: ['**/*.{md,mdx}'],
                path: 'blog',
                remarkPlugins: [
                    remarkYouTube,
                    [remarkReplaceMetaUrl, { from: '@staticoz', to: `${docsBase}` }],
                    [remarkReplaceMetaUrl, { from: '@site', to: `${baseUrl}` }],
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
                    // intro/what-is-openziti/ came from learn/introduction/ and the old /introduction/ redirect alias
                    if (path.startsWith(docUrl(docsBase, "/intro/what-is-openziti/"))) {
                        return [
                            path.replace(docUrl(docsBase, "/intro/what-is-openziti/"), docUrl(docsBase, "/learn/introduction/")),
                            path.replace(docUrl(docsBase, "/intro/what-is-openziti/"), docUrl(docsBase, "/introduction/")),
                        ];
                    }
                    // intro/get-started/ came from learn/quickstarts/ and the even older /quickstarts/
                    if (path.startsWith(docUrl(docsBase, "/intro/get-started/"))) {
                        return [
                            path.replace(docUrl(docsBase, "/intro/get-started/"), docUrl(docsBase, "/learn/quickstarts/")),
                            path.replace(docUrl(docsBase, "/intro/get-started/"), docUrl(docsBase, "/quickstarts/")),
                        ];
                    }
                    // unchanged: learn/core-concepts/ paths didn't move
                    if (path.startsWith(docUrl(docsBase, "/learn/core-concepts/zero-trust-models/"))) {
                        return [
                            path.replace(docUrl(docsBase, "/learn/core-concepts/zero-trust-models/"), docUrl(docsBase, "/deployment-architecture/")),
                            path.replace(docUrl(docsBase, "/learn/core-concepts/zero-trust-models/"), docUrl(docsBase, "/core-concepts/zero-trust-models/"))
                        ];
                    }
                    if (path.startsWith(docUrl(docsBase, "/learn/core-concepts/"))) {
                        return [path.replace(docUrl(docsBase, "/learn/core-concepts/"), docUrl(docsBase, "/core-concepts/"))];
                    }
                    // unchanged: reference/developer/api/ didn't move
                    if (path.startsWith(docUrl(docsBase, "/reference/developer/api/"))) {
                        return [
                            path.replace(docUrl(docsBase, "/reference/developer/api/"), "/api/"),
                            path.replace(docUrl(docsBase, "/reference/developer/api/"), "/api/rest/"),
                            path.replace(docUrl(docsBase, "/reference/developer/api/"), "/api/rest/edge-apis/")
                        ];
                    }
                    // how-to-guides/tunnelers/kubernetes/ — chain: reference/tunnelers/kubernetes/ ← guides/kubernetes/workload-tunneling/
                    if (path.startsWith(docUrl(docsBase, "/how-to-guides/tunnelers/kubernetes/"))) {
                        return [path.replace(docUrl(docsBase, "/how-to-guides/tunnelers/kubernetes/"), docUrl(docsBase, "/guides/kubernetes/workload-tunneling/"))];
                    }
                    // how-to-guides/tunnelers/ came from reference/tunnelers/
                    if (path.startsWith(docUrl(docsBase, "/how-to-guides/tunnelers/"))) {
                        return [path.replace(docUrl(docsBase, "/how-to-guides/tunnelers/"), docUrl(docsBase, "/reference/tunnelers/"))];
                    }
                    // how-to-guides/topologies/gateway/ — chain preserving the oldest /guides/local-gateway/ alias
                    if (path.startsWith(docUrl(docsBase, "/how-to-guides/topologies/gateway/"))) {
                        return [path.replace(docUrl(docsBase, "/how-to-guides/topologies/gateway/"), docUrl(docsBase, "/guides/local-gateway/"))];
                    }
                    // how-to-guides/deployments/kubernetes/ — chain preserving the oldest /guides/kubernetes/hosting/ alias
                    if (path.startsWith(docUrl(docsBase, "/how-to-guides/deployments/kubernetes/"))) {
                        return [path.replace(docUrl(docsBase, "/how-to-guides/deployments/kubernetes/"), docUrl(docsBase, "/guides/kubernetes/hosting/"))];
                    }
                    // how-to-guides/deployments/ came from reference/deployments/ (oldest alias)
                    if (path.startsWith(docUrl(docsBase, "/how-to-guides/deployments/"))) {
                        return [path.replace(docUrl(docsBase, "/how-to-guides/deployments/"), docUrl(docsBase, "/reference/deployments/"))];
                    }
                    // support/ came from guides/troubleshooting/
                    if (path.startsWith(docUrl(docsBase, "/support/"))) {
                        return [path.replace(docUrl(docsBase, "/support/"), docUrl(docsBase, "/guides/troubleshooting/"))];
                    }
                    // how-to-guides/ came from guides/ (general — must come after all specific how-to rules above)
                    if (path.startsWith(docUrl(docsBase, "/how-to-guides/"))) {
                        return [path.replace(docUrl(docsBase, "/how-to-guides/"), docUrl(docsBase, "/guides/"))];
                    }
                    return undefined;
                },
                redirects: redirectsArr,
            } satisfies ClientRedirectsOptions,
        ],
        ['@docusaurus/plugin-google-tag-manager', {id: `openziti-gtm`, containerId: 'GTM-5SF399H3'}],
        ['@docusaurus/plugin-content-pages',{id: `openziti-root-pages`, path: `src/pages`, routeBasePath: '/'}],
        ['@docusaurus/plugin-content-pages',{id: `openziti-pages`, path: `src/pages`, routeBasePath: 'openziti'}],
        openzitiDocsPluginConfig(__dirname, REMARK_MAPPINGS, `docs/${openziti}`),
    ],
    presets: [
        [ // Redocusaurus config
            'redocusaurus',
            {
                // Plugin Options for loading OpenAPI files
                specs: openzitiRedocSpecs(),
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
            // NetFoundry theme configuration — mirrors unified-doc so the standalone
            // OpenZiti site presents the same navbar (Products / Resources / icons).
            // Cross-product links point at the live netfoundry.io/docs/... URLs because
            // those products don't exist in the standalone build.
            netfoundry: {
                showStarBanner: true,
                starBanner: {
                    repoUrl: 'https://github.com/openziti/ziti',
                    label: 'Star OpenZiti on GitHub',
                },
                footer: openZitiFooter,
                // ProductPicker requires every link to use `to:` (not `href:`) — the theme's
                // pathLabel reads link.to.replace(...) and crashes on undefined. The theme strips
                // the scheme/host from absolute URLs internally, so external links work fine here.
                productPickerColumns: [
                    { header: 'Cloud SaaS',              links: [consoleLinkAbs,    frontdoorLinkAbs] },
                    { header: 'Self-Hosted Licensed',    links: [selfhostedLinkAbs, zlanLinkAbs]      },
                    { header: 'Self-Hosted Open Source', links: [
                        { ...openzitiLinkAbs, to: docUrl(docsBase, '/intro/what-is-openziti/') },
                        zrokLinkAbs,
                    ]},
                ],
                resourcesPickerSections: [
                    {
                        header: 'Learn & Engage',
                        links: [
                            {
                                label: 'NetFoundry Blog',
                                description: 'Latest news, updates, and insights from NetFoundry.',
                                href: 'https://netfoundry.io/blog/',
                                logoUrl: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
                            },
                            {
                                label: 'OpenZiti Tech Blog',
                                description: 'Technical articles and community updates.',
                                href: 'https://blog.openziti.io/',
                                logoUrl: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                            },
                        ],
                    },
                    {
                        header: 'Community & Support',
                        links: [
                            {
                                label: 'NetFoundry YouTube',
                                description: 'Video tutorials, demos, and technical deep dives.',
                                href: 'https://www.youtube.com/c/NetFoundry',
                                logoUrl: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
                                badge: 'youtube',
                            },
                            {
                                label: 'OpenZiti YouTube',
                                description: 'OpenZiti community videos and project updates.',
                                href: 'https://www.youtube.com/openziti',
                                logoUrl: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                                badge: 'youtube',
                            },
                            {
                                label: 'OpenZiti Discourse',
                                description: 'Ask questions and connect with the community.',
                                href: 'https://openziti.discourse.group/',
                                iconName: 'discourse',
                            },
                        ],
                    },
                ],
                navbarIconLinks: [
                    { href: 'https://github.com/openziti/ziti',  title: 'GitHub',    iconName: 'github' },
                    { href: 'https://openziti.discourse.group/', title: 'Discourse', iconName: 'discourse' },
                ],
            },
            hotjar: {applicationId: hotjarId},
            metadata: [
                {name: 'description', content: 'open source zero trust'},
                {name: 'robots', content: 'index, follow'},
            ],
            docs: {
                sidebar: {
                    hideable: true,
                    autoCollapseCategories: true,
                },
            },
            navbar: {
                hideOnScroll: false,
                title: '',
                // Logos are rendered by the swizzled src/theme/Navbar/Logo/index.tsx
                // (NetFoundry + OpenZiti), matching the unified-doc deployment.
                items: [
                    { type: 'custom-productPicker',   position: 'left',  label: 'Products' },
                    { type: 'custom-versionDropdown', position: 'left',  docsPluginId: 'openziti', pathPrefix: docsBase },
                    { type: 'custom-resourcesPicker', position: 'left' },
                    { type: 'custom-iconLinks',       position: 'right' },
                ],
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
