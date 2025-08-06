export const DOCUSAURUS_DEBUG = process.env.DOCUSAURUS_DEBUG === 'true';
export const DOCUSAURUS_URL = process.env.DOCUSAURUS_URL || 'https://openziti.io';
export const DOCUSAURUS_BASE_PATH = process.env.DOCUSAURUS_BASE_PATH || '/base-url';
export const DOCUSAURUS_DOCS_PATH = process.env.DOCUSAURUS_DOCS_PATH || '/docs-path';
export const hotjarId = process.env.ZITI_HOTJAR_APPID || "6443327"; //default localdev hotjarId

export function cleanUrl(path:string) {
    return path.replace(/\/\/+/g, '/');
}

export function docUrl(path:string): string {
    return cleanUrl(DOCUSAURUS_DOCS_PATH + '/' + path);
}

export function baseUrl(path:string): string {
    return cleanUrl(DOCUSAURUS_BASE_PATH + '/' + path);
}

export function absoluteUrl(path:string): string {
    return cleanUrl(DOCUSAURUS_BASE_PATH + '/' + DOCUSAURUS_DOCS_PATH + '/' + path);
}

export function addDocsRedir(redirectsArr:{ to: string; from: string[] }[]) {
    if (process.env.DEPLOY_ENV === 'kinsta') {
        redirectsArr.push({
            to: docUrl('/learn/introduction/'),
            from: [docUrl('/docs')],
        });
    }
}