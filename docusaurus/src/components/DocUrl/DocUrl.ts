
const docsBase = process.env.DEPLOY_ENV === 'kinsta' ? '' : '/docs'
export function docUrl(path:string): string {
    return docsBase + path;
}