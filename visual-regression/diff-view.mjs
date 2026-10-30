#!/usr/bin/env node
// Shows what a failed visual-regression run changed: one self-contained HTML page with only the changed bands of each
// failed screenshot, expected | actual | diff side by side, plus a summary table.
//
//   node visual-regression/diff-view.mjs --pr 1363          latest visual-regression run of a PR (needs gh)
//   node visual-regression/diff-view.mjs --run 40925162807  a run by ID (needs gh)
//   node visual-regression/diff-view.mjs [test-results dir] a local run (default visual-regression/test-results)
//
//   --repo OWNER/REPO   repo for gh (default: the current checkout's)
//   --out DIR           where index.html goes (default visual-regression/diff-view)
//   --no-open           don't open the page in a browser (implied when CI is set)
//
// From docusaurus/: yarn view:visual-regression --pr 1363
// Zero dependencies: the PNG reading and writing below uses node:zlib only.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const VR = path.dirname(fileURLToPath(import.meta.url));
const GAP = 60;      // changed rows closer than this merge into one band
const PAD = 40;      // context rows above and below a band
const MAXH = 800;    // rows shown per band
const MAXBANDS = 6;  // bands shown per screenshot

// ---- args ----
const argv = process.argv.slice(2);
const opt = { open: !process.env.CI, out: path.join(VR, 'diff-view') };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--pr') opt.pr = argv[++i];
  else if (a === '--run') opt.run = argv[++i];
  else if (a === '--repo') opt.repo = argv[++i];
  else if (a === '--out') opt.out = path.resolve(argv[++i]);
  else if (a === '--no-open') opt.open = false;
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0]); process.exit(0); }
  else if (!a.startsWith('-')) opt.dir = path.resolve(a);
  else { console.error(`unknown argument: ${a}`); process.exit(2); }
}

// ---- gh: find and download the run's report artifact ----
function gh(...args) {
  try {
    return execFileSync('gh', [...args, ...(opt.repo ? ['--repo', opt.repo] : [])], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    console.error(`gh ${args.join(' ')}: ${(e.stderr || e.message).trim()}`);
    process.exit(1);
  }
}

// the PR's latest failed run: passing runs (and runs skipped by the visual-baseline-update label) have nothing to show
if (opt.pr) {
  const branch = gh('pr', 'view', opt.pr, '--json', 'headRefName', '--jq', '.headRefName');
  opt.run = gh('run', 'list', '--workflow', 'visual-regression.yml', '--branch', branch, '--status', 'failure',
    '--limit', '1', '--json', 'databaseId', '--jq', '.[0].databaseId');
  if (!opt.run) { console.error(`PR ${opt.pr} has no failed visual-regression run (branch ${branch})`); process.exit(1); }
  console.log(`PR ${opt.pr}: latest failed run is ${opt.run}`);
}
if (opt.run) {
  const dest = path.join(VR, '.runs', String(opt.run));
  if (!fs.existsSync(path.join(dest, 'test-results'))) {
    fs.rmSync(dest, { recursive: true, force: true });
    console.log(`downloading the report of run ${opt.run}`);
    gh('run', 'download', String(opt.run), '--name', 'visual-regression-report', '--dir', dest);
  }
  opt.dir = path.join(dest, 'test-results');
  if (opt.out === path.join(VR, 'diff-view')) opt.out = path.join(dest, 'diff-view');
}
opt.dir ??= path.join(VR, 'test-results');
if (!fs.existsSync(opt.dir)) { console.error(`no test results at ${opt.dir}`); process.exit(1); }

// ---- PNG: 8-bit RGB/RGBA, non-interlaced (what Playwright writes) ----
function readPng(file) {
  if (!fs.existsSync(file)) return null;
  const buf = fs.readFileSync(file);
  let pos = 8, width, height, type, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), kind = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4); type = data[9];
      if (data[8] !== 8 || ![2, 6].includes(type) || data[12]) throw new Error(`${file}: unsupported PNG format`);
    } else if (kind === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, stride = width * bpp, raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[row + x - bpp] : 0, b = y ? px[row - stride + x] : 0, c = x >= bpp && y ? px[row - stride + x - bpp] : 0;
      let v = raw[src + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[row + x] = v;
    }
  }
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++, j += bpp) {
    data[i * 4] = px[j]; data[i * 4 + 1] = px[j + 1]; data[i * 4 + 2] = px[j + 2]; data[i * 4 + 3] = bpp === 4 ? px[j + 3] : 255;
  }
  return { width, height, data };
}

const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(kind, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(kind, 4, 'ascii'); data.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function writePng({ width, height, data }) {
  const stride = width * 4, raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 1; // Sub filter
    for (let x = 0; x < stride; x++) raw[y * (stride + 1) + 1 + x] = data[y * stride + x] - (x >= 4 ? data[y * stride + x - 4] : 0);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ---- diff bands ----
// Playwright paints changed pixels pure red in the diff image; unchanged ones are faded.
function bands(diff) {
  const rows = [];
  let changed = 0;
  for (let y = 0; y < diff.height; y++) {
    let hit = false;
    for (let x = 0; x < diff.width; x++) {
      const i = (y * diff.width + x) * 4;
      if (diff.data[i] > 200 && diff.data[i + 1] < 60 && diff.data[i + 2] < 60) { hit = true; changed++; }
    }
    if (hit) rows.push(y);
  }
  const merged = [];
  for (const y of rows) {
    const last = merged[merged.length - 1];
    if (last && y - last[1] <= GAP) last[1] = y; else merged.push([y, y]);
  }
  return { changed, bands: merged.map(([a, b]) => [Math.max(0, a - PAD), Math.min(diff.height, b + PAD)]) };
}

// rows y0..y1 of img as a data URI; desktop-width shots are halved, since each column shows them at about half size
function crop(img, y0, y1) {
  if (!img) return null;
  const h = Math.max(0, Math.min(img.height, y1) - y0);
  if (!h) return null;
  const s = img.width >= 1000 ? 2 : 1, w = Math.floor(img.width / s), hh = Math.max(1, Math.floor(h / s));
  const data = Buffer.alloc(w * hh * 4);
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) for (let ch = 0; ch < 4; ch++) {
    let sum = 0;
    for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) sum += img.data[((y0 + y * s + dy) * img.width + x * s + dx) * 4 + ch];
    data[(y * w + x) * 4 + ch] = sum / (s * s);
  }
  return `data:image/png;base64,${writePng({ width: w, height: hh, data }).toString('base64')}`;
}

// ---- page ----
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const rows = [];
let body = '';
for (const dir of fs.readdirSync(opt.dir).sort()) {
  const d = path.join(opt.dir, dir);
  if (!fs.statSync(d).isDirectory()) continue;
  const diffFile = fs.readdirSync(d).find((f) => f.endsWith('-diff.png'));
  if (!diffFile) continue;
  const base = diffFile.replace(/-diff\.png$/, '');
  const [exp, act, diff] = ['expected', 'actual', 'diff'].map((k) => readPng(path.join(d, `${base}-${k}.png`)));
  const { changed, bands: bs } = bands(diff);
  const name = dir.replace(/^visual-/, '');
  const pct = ((100 * changed) / (diff.width * diff.height)).toFixed(2);
  const dh = act && exp ? act.height - exp.height : 0;
  rows.push({ name, pct, dh, bands: bs.map(([a, b]) => `${a}-${b}`).join(', ') });

  body += `<h2 id="${esc(name)}">${esc(name)}</h2><div class=meta>${pct}% of pixels changed; ${bs.length} band(s)`;
  if (dh) body += `; <b>page height changed by ${dh}px, so everything below the first change is shifted</b>`;
  body += '</div>';
  for (const [y0, end] of bs.slice(0, MAXBANDS)) {
    const y1 = Math.min(end, y0 + MAXH);
    body += `<div class=meta>y ${y0}-${end}${end > y1 ? ` (first ${MAXH}px shown)` : ''}</div><div class=band>`;
    for (const [k, img] of [['expected', exp], ['actual', act], ['diff', diff]]) {
      const uri = crop(img, y0, y1);
      body += `<div><b>${k}</b>${uri ? `<img src="${uri}">` : '<i>past the end of the page</i>'}</div>`;
    }
    body += '</div>';
  }
  if (bs.length > MAXBANDS) body += `<div class=meta>${bs.length - MAXBANDS} more band(s) not shown</div>`;
}

const table = rows.length
  ? '| Screenshot | Pixels changed | Height change | Changed rows |\n| --- | --- | --- | --- |\n' +
    rows.map((r) => `| ${r.name} | ${r.pct}% | ${r.dh ? `${r.dh}px` : '-'} | ${r.bands} |`).join('\n') + '\n'
  : 'No failed screenshots.\n';
console.log(`\n${table}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `## Visual regression: ${rows.length} failed screenshot(s)\n\n${table}\n` +
    'Download the `visual-regression-report` artifact and open `diff-view/index.html`, or run ' +
    '`yarn view:visual-regression --run <run id>` from `docusaurus/`.\n');
}

const toc = rows.map((r) => `<li><a href="#${esc(r.name)}">${esc(r.name)}</a> ${r.pct}%${r.dh ? `, height ${r.dh}px` : ''}</li>`).join('');
const html = `<!doctype html><meta charset=utf-8><title>visual-regression diffs</title><style>
body{font:14px system-ui,sans-serif;margin:16px;background:#f4f4f4;color:#222} h2{margin:28px 0 4px} .meta{color:#555;margin:4px 0}
.band{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 16px} .band div{background:#fff;padding:4px}
.band b{display:block;font-size:12px;color:#555} img{width:100%;border:1px solid #ccc}</style>
<h1>Visual-regression diffs</h1><div class=meta>${esc(opt.run ? `run ${opt.run}` : opt.dir)}: ${rows.length} failed screenshot(s)</div>
<ul>${toc}</ul>${body}`;
fs.mkdirSync(opt.out, { recursive: true });
const page = path.join(opt.out, 'index.html');
fs.writeFileSync(page, html);
console.log(page);

if (opt.open && rows.length) {
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', page]]
    : process.platform === 'darwin' ? ['open', [page]] : ['xdg-open', [page]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
}
