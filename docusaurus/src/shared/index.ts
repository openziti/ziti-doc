// Safe in browser & Node: check globalThis.process only by property access on a known object.
// 1) Use Node's env if present; 2) else use browser-injected __DOCUSAURUS_ENV__; 3) else {}
type Env = Record<string, string | undefined>;
const g: any = typeof globalThis !== "undefined" ? globalThis : {};

const RUNTIME_ENV: Env = (() => {
    if (g.process && typeof g.process.env === "object") return g.process.env as Env;
    if (g.__DOCUSAURUS_ENV__) return g.__DOCUSAURUS_ENV__ as Env;
    return {};
})();

const getEnv = (k: string, d?: string) =>
    (RUNTIME_ENV[k] ?? d) as string | undefined;

const ORIGIN =
    getEnv("DOCUSAURUS_URL") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost");

export const DOCUSAURUS_DEBUG = getEnv("DOCUSAURUS_DEBUG") === "true";
export const DOCUSAURUS_URL = ORIGIN;
export const DOCUSAURUS_BASE_PATH = getEnv("DOCUSAURUS_BASE_PATH", "/base-url");
export const DOCUSAURUS_DOCS_PATH = getEnv("DOCUSAURUS_DOCS_PATH", "/docs-path");
export const hotjarId = getEnv("ZITI_HOTJAR_APPID", "6443327")!;

export function cleanUrl(path: string) {
    return path.replace(/([^:]\/)\/+/g, "$1");
}

export function docUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_DOCS_PATH}/${path}`);
}

export function baseUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_BASE_PATH}/${path}`);
}

export function absoluteUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_BASE_PATH}/${DOCUSAURUS_DOCS_PATH}/${path}`);
}

export function absoluteOriginUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_URL}${absoluteUrl(path)}`);
}

export function addDocsRedir(redirectsArr: { to: string; from: string[] }[]) {
    if (getEnv("DEPLOY_ENV") === "kinsta") {
        redirectsArr.push({
            to: docUrl("/learn/introduction/"),
            from: [docUrl("/docs")],
        });
    }
}
