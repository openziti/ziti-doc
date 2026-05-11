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
            lastVersion: '1.x',
            includeCurrentVersion: true,
            versions: {
                'current': { label: '2.x', path: 'next', banner: 'unreleased', noIndex: true },
                '1.x':     { label: '1.x', path: '',     banner: 'none' },
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
