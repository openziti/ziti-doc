/**
 * Install the config builder app that the /config-builder page embeds.
 *
 *   yarn config-builder:load                       # newest config-builder-v* release of openziti/ziti-console
 *   yarn config-builder:load --tag config-builder-v0.1.0
 *   yarn config-builder:load --zip path/to/config-builder.zip
 *   yarn config-builder:load --if-missing          # do nothing when it is already installed (used by `yarn start`)
 *
 * `yarn start` and `yarn build` run it automatically (prestart, prebuild). The output is gitignored, never committed.
 *
 * The app is built and released by openziti/ziti-console (the `Create Releases` workflow attaches
 * config-builder.zip to each config-builder-v* release). Output is static/tools/config-builder-app/, which is
 * replaced wholesale so stale hashed bundles never linger. GITHUB_TOKEN or GH_TOKEN, if set, lifts the API rate limit.
 *
 * --repo, --tag-prefix, --asset and --out (relative to docusaurus/) retarget it at another release zip.
 * Dependency-free: the zip reader is lib/zip.mjs, shared with load-stargazer-data.mjs.
 */

import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readZip} from './lib/zip.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

const REPO = value('--repo', 'openziti/ziti-console');
const TAG_PREFIX = value('--tag-prefix', 'config-builder-v');
const ASSET = value('--asset', 'config-builder.zip');
const OUT_DIR = resolve(SCRIPT_DIR, '..', value('--out', 'static/tools/config-builder-app'));

function die(msg) {
    console.error(`\n  ${msg}\n`);
    process.exit(1);
}

const headers = () => {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    return {'User-Agent': 'ziti-doc-config-builder-load', ...(token ? {Authorization: `Bearer ${token}`} : {})};
};

async function get(url) {
    const res = await fetch(url, {headers: headers()});
    if (!res.ok) die(`${url} returned ${res.status}`);
    return res;
}

/** The release to install: the requested tag, or the newest published config-builder-v* release. */
async function findRelease(tag) {
    if (tag) {
        return (await get(`https://api.github.com/repos/${REPO}/releases/tags/${tag}`)).json();
    }
    const releases = await (await get(`https://api.github.com/repos/${REPO}/releases?per_page=50`)).json();
    const release = releases.find(r => !r.draft && r.tag_name.startsWith(TAG_PREFIX));
    if (!release) die(`no published ${TAG_PREFIX}* release found in ${REPO}`);
    return release;
}

if (args.includes('--if-missing') && existsSync(join(OUT_DIR, 'index.html'))) {
    console.log(`config-builder: already installed in ${OUT_DIR}, skipping`);
    process.exit(0);
}

let zip;
let label;
if (value('--zip')) {
    label = value('--zip');
    zip = readFileSync(label);
} else {
    const release = await findRelease(value('--tag'));
    const asset = release.assets.find(a => a.name === ASSET);
    if (!asset) die(`release ${release.tag_name} has no ${ASSET} asset`);
    label = release.tag_name;
    zip = Buffer.from(await (await get(asset.browser_download_url)).arrayBuffer());
}

let entries;
try {
    entries = readZip(zip);
} catch (e) {
    die(`${e.message}: ${label}`);
}
if (!entries.some(e => e.name === 'index.html')) die(`${label} has no index.html at its root`);

rmSync(OUT_DIR, {recursive: true, force: true});
for (const {name, buffer} of entries) {
    const target = resolve(OUT_DIR, name);
    if (!target.startsWith(OUT_DIR + sep)) die(`refusing to write outside ${OUT_DIR}: ${name}`);
    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, buffer);
}
console.log(`config-builder: installed ${label} (${entries.length} files) into ${OUT_DIR}`);
