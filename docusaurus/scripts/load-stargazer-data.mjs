/**
 * Install stargazer data into the chart page from a downloaded artifact.
 *
 *   yarn stargazers:load                      # newest stargazer-data*.zip it can find
 *   yarn stargazers:load path/to/data.zip     # a specific artifact zip
 *   yarn stargazers:load path/to/unzipped/    # an already-extracted directory
 *   yarn stargazers:load some.json            # a single json file
 *
 * The zip is the `stargazer-data` artifact from netfoundry/docusaurus-shared's
 * publish workflow -- the no-token alternative to `./gendoc.sh -s`, which needs
 * a GitHub App token to hit the API. Output is always
 * src/pages/stargazers/all.repos.stargazers.json, the file the page imports.
 *
 * Deliberately dependency-free: it reads the zip with a small central
 * directory parser (lib/zip.mjs) over node:zlib rather than pulling adm-zip into the site's
 * package.json for a dev-only tool.
 */

import {existsSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
import {readZip} from './lib/zip.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DOCUSAURUS_DIR = resolve(SCRIPT_DIR, '..');
const REPO_ROOT = resolve(DOCUSAURUS_DIR, '..');
const OUT_FILE = join(DOCUSAURUS_DIR, 'src', 'pages', 'stargazers', 'all.repos.stargazers.json');

/* The files we know how to read, best source first. */
const BY_REPO = 'all.repos.stargazers.json';   // already the shape we want
const DETAIL = 'all.stargazers.detail.json';   // [{date,user,repo}] -- regroup it
const LEGACY = ['all.ziti.stargazers.json', 'all.zrok.stargazers.json', 'all.other.stargazers.json'];

function die(msg) {
    console.error(`\n  ${msg}\n`);
    process.exit(1);
}

/* ------------------ source discovery ------------------ */

/** Newest stargazer-data*.zip across the usual places, or null. */
function findZip() {
    const dirs = [
        process.cwd(),
        REPO_ROOT,
        join(homedir(), 'Downloads'),
        'C:/temp',
        '/tmp',
    ];
    const found = [];
    for (const dir of dirs) {
        if (!existsSync(dir)) continue;
        let names;
        try {
            names = readdirSync(dir);
        } catch {
            continue; // unreadable directory is not an error, just not a source
        }
        for (const n of names) {
            if (!/^stargazer-data.*\.zip$/i.test(n)) continue;
            const full = join(dir, n);
            try {
                found.push({full, mtime: statSync(full).mtimeMs});
            } catch { /* vanished between readdir and stat */ }
        }
    }
    if (!found.length) return null;
    found.sort((a, b) => b.mtime - a.mtime);
    return found[0].full;
}

/**
 * Collect candidate files from the source as {name, json}. For a zip holding
 * several dated snapshot directories (20260729/, 20260713/, ...) only the
 * newest is used -- the directory names sort chronologically.
 */
function collect(src) {
    const stat = statSync(src);
    let files;

    if (stat.isDirectory()) {
        files = readdirSync(src)
            .filter(n => n.endsWith('.json'))
            .map(n => ({name: n, buffer: readFileSync(join(src, n))}));
    } else if (src.toLowerCase().endsWith('.json')) {
        files = [{name: basename(src), buffer: readFileSync(src)}];
    } else {
        try {
            files = readZip(readFileSync(src));
        } catch (e) {
            die(`${e.message}: ${src}`);
        }
        const dirs = [...new Set(files.map(f => f.name.includes('/') ? f.name.split('/')[0] : ''))].sort();
        const newest = dirs[dirs.length - 1];
        if (newest) {
            files = files.filter(f => f.name.startsWith(`${newest}/`));
            console.log(`  snapshot:  ${newest}`);
        }
    }

    const out = new Map();
    for (const f of files) {
        const key = basename(f.name);
        try {
            out.set(key, JSON.parse(f.buffer.toString('utf8')));
        } catch {
            console.warn(`  skipping ${key}: not valid JSON`);
        }
    }
    return out;
}

/* ------------------ shaping ------------------ */

/** [{date, repo}, ...] -> {repo: [date, ...]} with each list sorted. */
function group(records, label) {
    const byRepo = {};
    for (const r of records) {
        if (!r || !r.repo || !r.date) continue;
        (byRepo[r.repo] ||= []).push(r.date);
    }
    for (const k of Object.keys(byRepo)) byRepo[k].sort();
    console.log(`  source:    ${label}`);
    return byRepo;
}

function shape(files) {
    if (files.has(BY_REPO)) {
        console.log(`  source:    ${BY_REPO} (used as-is)`);
        return files.get(BY_REPO);
    }
    if (files.has(DETAIL)) {
        return group(files.get(DETAIL), `${DETAIL} (regrouped by repo)`);
    }
    // Pre-2026-07 artifacts only carried the fixed ziti/zrok/other split. Each
    // record still names its own repo, so the three recombine losslessly.
    const legacy = LEGACY.filter(n => files.has(n));
    if (legacy.length) {
        return group(legacy.flatMap(n => files.get(n)), `${legacy.join(' + ')} (recombined)`);
    }
    die(`no stargazer data found. Expected one of:\n    ${[BY_REPO, DETAIL, ...LEGACY].join('\n    ')}`);
}

/* ------------------ main ------------------ */

const arg = process.argv[2];
const src = arg ? resolve(arg) : findZip();

if (!src) {
    die([
        'No stargazer data given and no stargazer-data*.zip found.',
        '',
        '  Usage: yarn stargazers:load [<zip|dir|json>]',
        '',
        '  Download the "stargazer-data" artifact from a netfoundry/docusaurus-shared',
        '  publish run, then point this at the zip. Searched automatically:',
        '    ./  ../  ~/Downloads  C:/temp  /tmp',
    ].join('\n'));
}
if (!existsSync(src)) die(`no such file or directory: ${src}`);

console.log(`\n  reading:   ${src}`);
const byRepo = shape(collect(src));

const repos = Object.keys(byRepo);
const total = repos.reduce((n, k) => n + byRepo[k].length, 0);

// Same guard as gh-stats.sh: never replace good chart data with nothing.
if (!repos.length || !total) die('refusing to write: the data is empty. Left the existing file alone.');

writeFileSync(OUT_FILE, JSON.stringify(byRepo));

const top = repos.sort((a, b) => byRepo[b].length - byRepo[a].length).slice(0, 5);
console.log(`  repos:     ${repos.length}`);
console.log(`  stars:     ${total}`);
console.log(`  top:       ${top.map(r => `${r} (${byRepo[r].length})`).join(', ')}`);
console.log(`  wrote:     ${OUT_FILE}\n`);
