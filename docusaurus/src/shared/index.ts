export const baseUrlConst = '/';
export const hotjarId = process.env.ZITI_HOTJAR_APPID || "6443327"; //default localdev hotjarId
export const docsBase = baseUrlConst + (process.env.DEPLOY_ENV === 'kinsta' ? '' : 'docs/');
export const DOCUSAURUS_DEBUG = process.env.DOCUSAURUS_DEBUG === 'true';

export function cleanUrl(path:string) {
    return path.replace(/\/\/+/g, '/');
}

export function docUrl(path:string): string {
    return cleanUrl(docsBase + path);
}