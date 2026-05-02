// Centralized path config so docusaurus.config.ts, sidebars.ts, and runtime React
// components share one source of truth for baseUrl-related URL construction.
// See docusaurus.config.ts for the meaning of useDocsForBaseUrl.

export const useDocsForBaseUrl = process.env.USE_DOCS_FOR_BASE_URL === 'true';
export const baseUrl = useDocsForBaseUrl ? '/docs/' : '/';
export const openziti = 'openziti';
export const docsBase = useDocsForBaseUrl ? `/${openziti}` : `/docs/${openziti}`;
