import * as path from 'path';
import type { PluginConfig } from '@docusaurus/types';
import {
    LogLevel,
    remarkCodeSections,
    remarkReplaceMetaUrl,
    remarkScopedPath,
} from "@netfoundry/docusaurus-theme/plugins";

export function openzitiRedocSpecs() {
    return [
        { id: 'edge-client',     spec: 'https://get.openziti.io/spec/client.yml' },
        { id: 'edge-management', spec: 'https://get.openziti.io/spec/management.yml' },
    ];
}

// Image-path aliases. Single source of truth: change `to` and every markdown
// reference + JSX `useBaseUrl(`${OPENZITI_IMG}/...`)` follows.
export const OPENZITI_IMG = '/img';

export const openzitiImageAliases = [
    { from: '@openziti_img', to: OPENZITI_IMG },
];

export const OPENZITI_VERSION_LABELS = {
    current:     'Active LTS (2.0.x)',
    latest:      'Latest',
    maintenance: 'Maintenance LTS (1.6.x)',
} as const;

export function openzitiRedirects(routeBasePath: string = 'docs/openziti'): PluginConfig {
    const base = '/' + routeBasePath;
    return [
        '@docusaurus/plugin-client-redirects',
        {
            id: 'openziti-redirects',
            createRedirects(existingPath: string) {
                if (existingPath.startsWith(`${base}/get-started/`)) {
                    return [
                        existingPath.replace(`${base}/get-started/`, `${base}/learn/quickstarts/`),
                        existingPath.replace(`${base}/get-started/`, `${base}/quickstarts/`),
                    ];
                }
                // tunnelers moved from /reference/tunnelers/ to /how-to-guides/tunnelers/
                if (existingPath.startsWith(`${base}/how-to-guides/tunnelers/`)) {
                    return [existingPath.replace(`${base}/how-to-guides/tunnelers/`, `${base}/reference/tunnelers/`)];
                }
                // identity-providers sub-pages moved from external-auth/identity-providers/ to identity-providers/.
                // Excludes the index page (handled by explicit entry) to avoid EEXIST from duplicate stub generation.
                if (existingPath.startsWith(`${base}/how-to-guides/identity-providers/`) && existingPath !== `${base}/how-to-guides/identity-providers/`) {
                    return [existingPath.replace(`${base}/how-to-guides/identity-providers/`, `${base}/how-to-guides/external-auth/identity-providers/`)];
                }
                // guides/ renamed to how-to-guides/ (deployments, external-auth, hsm, topologies, etc.)
                if (existingPath.startsWith(`${base}/how-to-guides/`)) {
                    return [existingPath.replace(`${base}/how-to-guides/`, `${base}/guides/`)];
                }
                if (existingPath.startsWith(`${base}/learn/core-concepts/`)) {
                    return [existingPath.replace(`${base}/learn/core-concepts/`, `${base}/core-concepts/`)];
                }
                // troubleshooting moved from /guides/troubleshooting/ to /support/
                if (existingPath.startsWith(`${base}/support/`)) {
                    return [existingPath.replace(`${base}/support/`, `${base}/guides/troubleshooting/`)];
                }
                if (existingPath === `${base}/intro`) {
                    return [`${base}/learn/introduction`, `${base}/introduction`];
                }
                return undefined;
            },
            redirects: [
                { from: `${base}/reference/developer/api/edge-client-reference`,     to: `${base}/reference/developer/api/edge-client-api-reference` },
                { from: `${base}/reference/developer/api/edge-management-reference`, to: `${base}/reference/developer/api/edge-management-api-reference` },
                { from: `${base}/learn/core-concepts/security/authorization/posture-checks`, to: `${base}/learn/core-concepts/security/authorization/posture-checks/overview` },
                // external-auth section restructured: identity-providers moved up, others split out
                { from: `${base}/how-to-guides/external-auth`,                        to: `${base}/how-to-guides/identity-providers/` },
                { from: `${base}/how-to-guides/external-auth/identity-providers`,     to: `${base}/how-to-guides/identity-providers/` },
                { from: `${base}/how-to-guides/external-auth/tunnelers`,              to: `${base}/how-to-guides/tunnelers/` },
                { from: `${base}/how-to-guides/external-auth/zac`,                    to: `${base}/how-to-guides/zac` },
                { from: `${base}/how-to-guides/external-auth/ziti-cli`,               to: `${base}/reference/oidc-reference` },
                // pki-troubleshooting moved from /support/ to /support/troubleshooting/
                { from: `${base}/support/pki-troubleshooting`,                         to: `${base}/support/troubleshooting/pki-troubleshooting/` },
                { from: `${base}/support/pki-troubleshooting/renew-cert`,              to: `${base}/support/troubleshooting/pki-troubleshooting/renew-cert` },
                { from: `${base}/support/pki-troubleshooting/troubleshoot-expired-certs`, to: `${base}/support/troubleshooting/pki-troubleshooting/troubleshoot-expired-certs` },
            ],
        },
    ];
}

export function openzitiDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = 'docs/openziti',
): PluginConfig {
    const op = path.resolve(rootDir, 'docs');
    const osbp = path.resolve(rootDir, 'sidebars.ts');
    const docsBase = '/' + routeBasePath;
    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'openziti', // do not change - affects algolia search
            path: op,
            routeBasePath,
            sidebarPath: osbp,
            lastVersion: 'current',
            includeCurrentVersion: true,
            versions: {
                'current':     { label: OPENZITI_VERSION_LABELS.current,     path: '',       banner: 'none'         },
                'latest':      { label: OPENZITI_VERSION_LABELS.latest,      path: 'latest', banner: 'unreleased'   },
                'maintenance': { label: OPENZITI_VERSION_LABELS.maintenance,  path: 'maint',  banner: 'unmaintained' },
            },
            beforeDefaultRemarkPlugins: [
                // Must run before Docusaurus's default broken-image / broken-link check,
                // otherwise alias URLs (`@openziti_img/...`, `@openzitidocs/...`) fail validation.
                [remarkScopedPath, { mappings: [...linkMappings, ...openzitiImageAliases], logLevel: LogLevel.Silent }],
                [remarkReplaceMetaUrl, { from: '@staticoz', to: docsBase }],
            ],
            remarkPlugins: [
                function forbidSite() {
                    return (tree: unknown, file: { path?: string }) => {
                        const src = String(file);
                        if (src.includes('@site')) {
                            throw new Error(
                                `[FORBIDDEN] @site is not allowed in docs - use @openziti.\nFile: ${file.path}`,
                            );
                        }
                    };
                },
                [remarkCodeSections, { logLevel: LogLevel.Debug }],
            ],
        } as any,
    ];
}
