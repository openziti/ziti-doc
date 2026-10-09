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
 * Dependency-free, same as load-stargazer-data.mjs: a small central-directory reader over node:zlib.
 */

import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateRawSync} from 'node:zlib';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(SCRIPT_DIR, '..', 'static', 'tools', 'config-builder-app');
const REPO = 'openziti/ziti-console';
const TAG_PREFIX = 'config-builder-v';
const ASSET = 'config-builder.zip';

const args = process.argv.slice(2);
const value = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

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

/** Read a zip's entries as {name, buffer}. Handles stored + deflated members. */
function readZip(buf, label) {
    const tail = Math.max(0, buf.length - 65_557);
    let eocd = -1;
    for (let i = buf.length - 22; i >= tail; i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) die(`not a zip file (no end-of-central-directory record): ${label}`);

    const count = buf.readUInt16LE(eocd + 10);
    let p = buf.readUInt32LE(eocd + 16);
    const entries = [];

    for (let i = 0; i < count; i++) {
        if (buf.readUInt32LE(p) !== 0x02014b50) die(`corrupt central directory in ${label}`);
        const method = buf.readUInt16LE(p + 10);
        const compressedSize = buf.readUInt32LE(p + 20);
        const nameLen = buf.readUInt16LE(p + 28);
        const extraLen = buf.readUInt16LE(p + 30);
        const commentLen = buf.readUInt16LE(p + 32);
        const localOffset = buf.readUInt32LE(p + 42);
        const name = buf.toString('utf8', p + 46, p + 46 + nameLen).replace(/\\/g, '/');
        p += 46 + nameLen + extraLen + commentLen;

        if (name.endsWith('/')) continue;

        const lhNameLen = buf.readUInt16LE(localOffset + 26);
        const lhExtraLen = buf.readUInt16LE(localOffset + 28);
        const start = localOffset + 30 + lhNameLen + lhExtraLen;
        const raw = buf.subarray(start, start + compressedSize);

        if (method === 0) entries.push({name, buffer: raw});
        else if (method === 8) entries.push({name, buffer: inflateRawSync(raw)});
        else die(`unsupported compression method ${method} for ${name} in ${label}`);
    }
    return entries;
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

const entries = readZip(zip, label);
if (!entries.some(e => e.name === 'index.html')) die(`${label} has no index.html at its root`);

rmSync(OUT_DIR, {recursive: true, force: true});
for (const {name, buffer} of entries) {
    const target = resolve(OUT_DIR, name);
    if (!target.startsWith(OUT_DIR + sep)) die(`refusing to write outside ${OUT_DIR}: ${name}`);
    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, buffer);
}
console.log(`config-builder: installed ${label} (${entries.length} files) into ${OUT_DIR}`);
