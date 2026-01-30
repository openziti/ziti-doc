import type { PluginConfig } from '@docusaurus/types';
import { LogLevel, remarkCodeSections, remarkReplaceMetaUrl, remarkScopedPath } from "@netfoundry/docusaurus-theme/plugins";

/**
 * OpenZiti docs plugin config.
 * @param routeBasePath - 'docs/openziti' for standalone (baseUrl '/'), 'openziti' for unified-doc (baseUrl '/docs/')
 * @param staticozTarget - Target for @staticoz replacement (e.g., '/docs/openziti' or '/openziti')
 */
export function openzitiDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = 'docs/openziti',
    staticozTarget?: string
): PluginConfig {
    const remarkPlugins: any[] = [];
    if (staticozTarget) {
        remarkPlugins.push([remarkReplaceMetaUrl, { from: '@staticoz', to: staticozTarget, logLevel: LogLevel.Silent }]);
    }
    remarkPlugins.push([remarkScopedPath, { mappings: linkMappings, logLevel: LogLevel.Silent }]);
    remarkPlugins.push([remarkCodeSections, { logLevel: LogLevel.Debug }]);

    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'openziti',
            path: `${rootDir}/docs`,
            routeBasePath,
            sidebarPath: `${rootDir}/sidebars.ts`,
            includeCurrentVersion: true,
            remarkPlugins,
        } as any,
    ];
}
