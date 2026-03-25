import * as path from 'path';
import type { PluginConfig } from '@docusaurus/types';
import {
    LogLevel,
    remarkCodeSections,
    remarkReplaceMetaUrl,
    remarkScopedPath,
} from "@netfoundry/docusaurus-theme/plugins";

export function openZitiDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = '/docs/openziti',  // default for standalone; unified-doc may pass a different base
): PluginConfig {
    const docsPath = path.resolve(rootDir, 'docs');
    const sidebarPath = path.resolve(rootDir, 'sidebars.ts');
    console.log('openZitiDocsPluginConfig: docsPath=', docsPath);
    console.log('openZitiDocsPluginConfig: sidebarPath=', sidebarPath);
    console.log('openZitiDocsPluginConfig: routeBasePath=', routeBasePath);
    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'openziti',
            path: docsPath,
            routeBasePath,
            sidebarPath,
            includeCurrentVersion: true,
            remarkPlugins: [
                [remarkReplaceMetaUrl, { from: '@staticoz', to: `${routeBasePath}` }],
                [remarkScopedPath, { mappings: linkMappings }],
                [remarkCodeSections, { logLevel: LogLevel.Debug }],
            ],
        } as any,
    ];
}
