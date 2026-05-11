// @site/__imports
import React from 'react';

// helper to find/throw errors with missing import/exports
const ensure = <T,>(x: T, name: string): T => {
    if (!x) throw new Error(`_partials: missing export "${name}" (bad path or loader)`);
    return x;
};

// markdown/mdx re-exports
//   - sibling .mdx files: relative paths (those move with this file when versioned)
//   - external _remotes content: @openziti_remotes alias resolves to docs/_remotes regardless of
//     which version's _imports.tsx is being built; gendoc only ever populates docs/_remotes.
export { default as DockerRouterReadme } from '@openziti_remotes/ziti-cmd/dist/docker-images/ziti-router/README.md';
export { default as DockerControllerReadme } from '@openziti_remotes/ziti-cmd/dist/docker-images/ziti-controller/README.md';
export { default as ConsoleAuthAdminClientCertificate } from './reference/40-command-line/_console-auth-admin-client-certificate.mdx';
export { default as ConsolePublicCertsPlatformIntro } from './how-to-guides/deployments/_console-public-certs-platform-intro.mdx';
export { default as ConsolePublicCertsBasicSteps } from './how-to-guides/deployments/_console-public-certs-basic-steps.mdx';
export { default as ConsolePublicCertsConfigurationLink } from './how-to-guides/deployments/_console-public-certs-configuration-link.mdx';
export { default as HostHelmChartReadme } from '@openziti_remotes/helm-charts/charts/ziti-host/README.md';
export { default as ControllerHelmChartReadme } from '@openziti_remotes/helm-charts/charts/ziti-controller/README.md';
export { default as RouterHelmChartReadme } from '@openziti_remotes/helm-charts/charts/ziti-router/README.md';
export { default as CallbackUrls } from './how-to-guides/external-auth/identity-providers/_callback_urls.mdx';
export { default as UnlistedIdp } from './how-to-guides/external-auth/identity-providers/_unlisted.mdx';
export { default as ConsolePublicCertsNote } from './how-to-guides/deployments/_console-public-certs-note.mdx';
export { default as AndroidMd } from '@openziti_remotes/ziti-android-app/README.md';
export { default as LinuxResolverConfig } from './how-to-guides/tunnelers/60-linux/_resolver.mdx';
export { default as LinuxAddIdentities } from './how-to-guides/tunnelers/60-linux/_add_identities.mdx';
export { default as DockerMd } from '@openziti_remotes/ziti-tunnel-sdk-c/docker/README.md';
export { default as TunHelmChartReadme } from '@openziti_remotes/helm-charts/charts/ziti-edge-tunnel/README.md';

// components: use ../site not @site so they import properly to the aggregate docs site
export { default as MarkdownWithoutH1 } from '@openziti/src/components/MarkdownWithoutH1';
export { default as Highlight } from '@openziti/src/components/OpenZitiHighlight';

// guarded wrappers to pinpoint failures during build
export const _verifyPartials = () => (
    <>
        {ensure(DockerRouterReadme, 'DockerRouterReadme') && null}
        {ensure(DockerControllerReadme, 'DockerControllerReadme') && null}
        {ensure(ConsoleAuthAdminClientCertificate, 'ConsoleAuthAdminClientCertificate') && null}
        {ensure(ConsolePublicCertsPlatformIntro, 'ConsolePublicCertsPlatformIntro') && null}
        {ensure(ConsolePublicCertsBasicSteps, 'ConsolePublicCertsBasicSteps') && null}
        {ensure(ConsolePublicCertsConfigurationLink, 'ConsolePublicCertsConfigurationLink') && null}
        {ensure(HostHelmChartReadme, 'HostHelmChartReadme') && null}
        {ensure(ControllerHelmChartReadme, 'ControllerHelmChartReadme') && null}
        {ensure(RouterHelmChartReadme, 'RouterHelmChartReadme') && null}
        {ensure(CallbackUrls, 'CallbackUrls') && null}
        {ensure(UnlistedIdp, 'UnlistedIdp') && null}
        {ensure(ConsolePublicCertsNote, 'ConsolePublicCertsNote') && null}
        {ensure(AndroidMd, 'AndroidMd') && null}
        {ensure(LinuxResolverConfig, 'LinuxResolverConfig') && null}
        {ensure(LinuxAddIdentities, 'LinuxAddIdentities') && null}
        {ensure(DockerMd, 'DockerMd') && null}
        {ensure(TunHelmChartReadme, 'TunHelmChartReadme') && null}
        {ensure(MarkdownWithoutH1, 'MarkdownWithoutH1') && null}
        {ensure(Highlight, 'Highlight') && null}
    </>
);
