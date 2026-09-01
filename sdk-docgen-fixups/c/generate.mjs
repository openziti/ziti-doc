#!/usr/bin/env node
// =============================================================================
// generate.mjs — Generate the Ziti C SDK API reference as Docusaurus-ready
// Markdown.
//
// This is the SINGLE source of truth for C SDK doc generation. generate.sh is a
// thin platform shim that calls this file; do not reimplement logic there.
//
// Pipeline: Doxygen (XML) -> doxybook2 (Markdown, using the templates and
// config in this folder) -> docusaurus/docs/reference/developer/sdk/clang.
//
// The C SDK source is read from a disposable clone under
// docusaurus/docs/_remotes/ziti-sdk-c (the same convention gendoc uses for
// every other imported repo). That clone is never modified: XML generation is
// turned on by piping an override into `doxygen -` on stdin rather than
// editing the checked-out Doxyfile.
//
// USAGE
//   node generate.mjs [OPTIONS]
//
// OPTIONS
//   --branch=BRANCH     Branch of openziti/ziti-sdk-c to read      (default: main)
//   --sdk-dir=DIR       Existing SDK clone to read instead of cloning
//   --output-dir=DIR    Where to write the generated Markdown
//   --no-clone          Never clone or pull; require --sdk-dir to already exist
//   --skip              Skip generation entirely, but still leave a placeholder
//                       index so the sidebar entry resolves and the site builds
//   -h, --help          Show this help and exit
//
// ENVIRONMENT VARIABLES
//   DOXYGEN             doxygen binary                              (default: doxygen)
//   DOXYBOOK2           doxybook2 binary                            (default: doxybook2)
//   SDK_BRANCH          Same as --branch
//
// EXIT BEHAVIOUR
//   Missing doxygen or doxybook2 is NOT a hard failure. The script warns, writes
//   the placeholder index, and exits 0. The sidebar in sidebars.ts hard-requires
//   reference/developer/sdk/clang/index, so a missing tool must degrade to a
//   thin page rather than break the whole Docusaurus build.
//
// EXAMPLES
//   node generate.mjs
//   node generate.mjs --branch=my.branch.name
//   node generate.mjs --sdk-dir=../../docusaurus/docs/_remotes/ziti-sdk-c --no-clone
//   node generate.mjs --skip
// =============================================================================

import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const isWin = process.platform === "win32";
const GIT = "git";
const DOXYGEN = process.env.DOXYGEN || "doxygen";
const DOXYBOOK2 = process.env.DOXYBOOK2 || "doxybook2";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..", "..");

const SDK_REMOTE = "https://github.com/openziti/ziti-sdk-c";

// =============================================================================
// SMALL PROCESS / FS HELPERS
// =============================================================================

// Node on Windows refuses to spawnSync a .cmd/.bat without a shell (EINVAL,
// since the CVE-2024-27980 fix). Route those through cmd.exe and quote args
// ourselves -- shell:true does NOT quote array args for us.
function spawnCompat(cmd, args, opts = {}) {
  if (isWin && /\.(cmd|bat)$/i.test(cmd)) {
    const quoted = args.map((a) =>
      /[\s"&|<>^()%!]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a,
    );
    return spawnSync(cmd, quoted, { ...opts, shell: true });
  }
  return spawnSync(cmd, args, opts);
}

// Run a command, stream its output, and abort on failure (mirrors `set -eu`).
function run(cmd, args, opts = {}) {
  const r = spawnCompat(cmd, args, { stdio: "inherit", env: process.env, ...opts });
  if (r.error) {
    console.error(`ERROR: failed to run '${cmd}': ${r.error.message}`);
    process.exit(1);
  }
  if (r.status !== 0) {
    console.error(`ERROR: '${cmd}' exited with code ${r.status}`);
    process.exit(r.status ?? 1);
  }
  return r;
}

// Is a command available on PATH? doxybook2 has no --version flag, so treat any
// exit code as success and only a spawn error (ENOENT) as missing.
function has(cmd) {
  const r = spawnCompat(cmd, ["--version"], { stdio: "ignore" });
  return !r.error;
}

function log(msg) {
  console.log(`- ${msg}`);
}

// Every .md file under dir, recursively. doxybook2 writes into per-kind
// subfolders when useFolders is on, so the fixup passes cannot be depth-1.
function walkMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

// Read, transform, write back -- but only touch the disk when the content
// actually changed, so mtimes stay stable for the Docusaurus watcher.
function editFiles(files, transform) {
  let changed = 0;
  for (const file of files) {
    const before = readFileSync(file, "utf8");
    const after = transform(before, file);
    if (after !== before) {
      writeFileSync(file, after);
      changed++;
    }
  }
  return changed;
}

// =============================================================================
// ARGUMENT PARSING
// =============================================================================

const USAGE =
  "Usage: node generate.mjs [OPTIONS] -- see the header of generate.mjs for the full reference.";

let branch = process.env.SDK_BRANCH || "main";
let sdkDir = join(repoRoot, "docusaurus", "docs", "_remotes", "ziti-sdk-c");
let outputDir = join(repoRoot, "docusaurus", "docs", "reference", "developer", "sdk", "clang");
let allowClone = true;
let skip = false;

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];

  const need = (flag) => {
    const v = argv[++i];
    if (v === undefined) {
      console.error(`Error: ${flag} requires a value`);
      process.exit(1);
    }
    return v;
  };
  const valueOf = (flag) => (a === flag ? need(flag) : a.slice(flag.length + 1));

  if (a === "--branch" || a.startsWith("--branch=")) { branch = valueOf("--branch"); continue; }
  if (a === "--sdk-dir" || a.startsWith("--sdk-dir=")) { sdkDir = valueOf("--sdk-dir"); continue; }
  if (a === "--output-dir" || a.startsWith("--output-dir=")) { outputDir = valueOf("--output-dir"); continue; }
  if (a === "--no-clone") { allowClone = false; continue; }
  if (a === "--skip") { skip = true; continue; }
  if (a === "-h" || a === "--help") { console.log(USAGE); process.exit(0); }
  console.error(`Error: unknown option '${a}'\n${USAGE}`);
  process.exit(1);
}

// =============================================================================
// PLACEHOLDER
// =============================================================================

// sidebars.ts references reference/developer/sdk/clang/index by id. If we bail
// out for any reason -- --skip, a missing tool -- that id still has to resolve
// or the entire site build dies with "These sidebar document ids do not exist".
function writePlaceholder(reason) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    join(outputDir, "index.md"),
    [
      "---",
      "title: Ziti C SDK",
      "---",
      "",
      "# Ziti C SDK",
      "",
      "The generated API reference is not available in this build.",
      "",
      `Reason: ${reason}`,
      "",
      `Browse the headers directly at [${SDK_REMOTE}](${SDK_REMOTE}/tree/${branch}/includes/ziti),`,
      "or regenerate locally with `node sdk-docgen-fixups/c/generate.mjs`.",
      "",
    ].join("\n"),
  );
  console.log(`- wrote placeholder index to: ${outputDir}`);
}

if (skip) {
  writePlaceholder("generation was skipped for this build (--skip)");
  process.exit(0);
}

const missing = [DOXYGEN, DOXYBOOK2].filter((c) => !has(c));
if (missing.length > 0) {
  console.warn("");
  console.warn("WARNING: C SDK reference docs will NOT be generated.");
  console.warn("The commands below must be on the PATH:");
  for (const c of missing) console.warn(` * ${c}`);
  console.warn("");
  console.warn("  doxygen:   https://www.doxygen.nl/download.html");
  console.warn("  doxybook2: https://github.com/matusnovak/doxybook2/releases");
  console.warn("");
  writePlaceholder(`\`${missing.join("`, `")}\` not found on the PATH`);
  process.exit(0);
}

// =============================================================================
// 1. SYNC THE SDK CLONE
// =============================================================================

if (existsSync(sdkDir)) {
  if (allowClone) {
    log(`updating existing ziti-sdk-c clone at ${sdkDir}`);
    run(GIT, ["checkout", branch], { cwd: sdkDir });
    run(GIT, ["pull", "--ff-only"], { cwd: sdkDir });
  } else {
    log(`using existing ziti-sdk-c clone at ${sdkDir} (--no-clone)`);
  }
} else if (allowClone) {
  log(`cloning ziti-sdk-c (${branch}) into ${sdkDir}`);
  mkdirSync(dirname(sdkDir), { recursive: true });
  run(GIT, [
    "clone", SDK_REMOTE, "--branch", branch,
    "--single-branch", "--no-tags", "--depth", "1", sdkDir,
  ]);
} else {
  console.error(`ERROR: --no-clone was passed but no SDK clone exists at: ${sdkDir}`);
  process.exit(1);
}

const doxyfile = join(sdkDir, "Doxyfile");
if (!existsSync(doxyfile)) {
  console.error(`ERROR: C SDK Doxyfile not found at: ${doxyfile}`);
  process.exit(1);
}

// =============================================================================
// 2. DOXYGEN -> XML
// =============================================================================

// Append the overrides to the SDK's own Doxyfile and feed the result to
// `doxygen -` on stdin. Later assignments win in a Doxyfile, so this needs no
// edit to the checked-out file. HTML and LaTeX are turned off because doxybook2
// consumes only the XML, and the old HTML pipeline this replaces is gone.
log("generating Doxygen XML (without modifying the SDK's Doxyfile)");
const xmlDir = join(sdkDir, "xml");
rmSync(xmlDir, { recursive: true, force: true });

const doxyConfig = [
  readFileSync(doxyfile, "utf8"),
  "GENERATE_XML   = YES",
  "XML_OUTPUT     = xml",
  "GENERATE_HTML  = NO",
  "GENERATE_LATEX = NO",
  // Deliberately NOT setting MARKDOWN_ID_STYLE = GITHUB. It does silence the
  // "unable to resolve reference" warnings for the SDK README's own in-page
  // anchors ("#dialing-a-service"), but it makes the rendered page worse:
  // doxybook2 cannot map an intra-page section ref to a URL, so it emits a
  // literal "[dial (access)]" with no target. Left alone, Doxygen emits an
  // empty link and the 4b pass below unwraps it to clean prose instead.
  "",
].join("\n");

run(DOXYGEN, ["-"], { cwd: sdkDir, input: doxyConfig, stdio: ["pipe", "inherit", "inherit"] });

if (!existsSync(xmlDir)) {
  console.error(`ERROR: doxygen reported success but produced no XML at: ${xmlDir}`);
  process.exit(1);
}

// =============================================================================
// 2b. SANITIZE THE XML
// =============================================================================
// doxybook2 v1.5.0 segfaults on a <memberdef> that has an empty <name> and a
// <type> containing a <ref> back to its own compound. Doxygen emits exactly
// that for an anonymous union, and the C SDK has one in `struct tag`
// (includes/ziti/model_support.h). An anonymous member has no name to render,
// so dropping the memberdef costs nothing -- <listofallmembers> already omits
// it, and the named union fields are emitted as siblings in their own right.
//
// Revisit if doxybook2 ever fixes this upstream:
// https://github.com/matusnovak/doxybook2/issues
log("sanitizing Doxygen XML (dropping anonymous members doxybook2 crashes on)");

const xmlFiles = readdirSync(xmlDir)
  .filter((f) => f.endsWith(".xml"))
  .map((f) => join(xmlDir, f));

let dropped = 0;
editFiles(xmlFiles, (text) =>
  text.replace(/[ \t]*<memberdef\b[\s\S]*?<\/memberdef>\n?/g, (block) => {
    if (!/<name\s*\/>|<name>\s*<\/name>/.test(block)) return block;
    dropped++;
    return "";
  }),
);
log(`  dropped ${dropped} anonymous member definition(s)`);

// =============================================================================
// 3. DOXYBOOK2 -> MARKDOWN
// =============================================================================

log("converting XML to Markdown with doxybook2");
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

run(DOXYBOOK2, [
  "-i", xmlDir,
  "-o", outputDir,
  "-c", join(scriptDir, "doxybook2.json"),
  "-t", join(scriptDir, "templates"),
]);

// The XML is a build artifact inside a clone that other gendoc steps also read
// from. Drop it so a later `git pull --ff-only` in that clone stays clean.
rmSync(xmlDir, { recursive: true, force: true });

// =============================================================================
// 4. POST-PROCESSING
// =============================================================================
// Each pass below works around a specific doxybook2 output defect. They are
// deliberately narrow: a broad rewrite would silently mangle SDK prose.

const mdFiles = walkMarkdown(outputDir);
log(`post-processing ${mdFiles.length} generated Markdown files`);

// 4a. The SDK README links to sibling files that are not part of the generated
//     set, so a relative link would 404. Point them at the repo instead.
const readmeLinks = new Map([
  ["BUILD.md", `${SDK_REMOTE}/blob/${branch}/BUILD.md`],
  ["vcpkg.json", `${SDK_REMOTE}/blob/${branch}/vcpkg.json`],
]);
const readmes = mdFiles.filter((f) => /(README_8md|index)\.md$/.test(f));
let n = editFiles(readmes, (text) => {
  let out = text;
  for (const [from, to] of readmeLinks) {
    out = out.split(`(${from})`).join(`(${to})`);
  }
  return out;
});
log(`  rewrote sibling-repo README links in ${n} file(s)`);

// 4b. doxybook2 emits [name]() for cross-references it could not resolve.
//     Docusaurus' broken-link checker flags every one, so unwrap them to text.
n = editFiles(mdFiles, (text) => text.replace(/\[([^\]]*)\]\(\)/g, "$1"));
log(`  stripped unresolved empty links in ${n} file(s)`);

// 4c. doxybook2 prefixes every image with its local images/ folder, including
//     images that were already absolute URLs.
n = editFiles(mdFiles, (text) => text.replace(/\(images\/(https?:\/\/[^)]+)\)/g, "($1)"));
log(`  un-prefixed absolute image URLs in ${n} file(s)`);

// 4d. Repoint anchors for members whose name Markdown eats.
//
//     doxybook2 links to members as "#<kind>-<name>", assuming the heading
//     "### define __FILENAME__" slugs to "define-__filename__". It does not:
//     Docusaurus parses the heading as Markdown first, so __FILENAME__ becomes
//     <strong>FILENAME</strong> and the id ends up "define-filename".
//
//     An explicit {#id} does NOT rescue this -- Docusaurus reads the id off the
//     already-parsed heading, by which point the underscores are gone -- so the
//     fix has to go the other way: point the links at the id Docusaurus really
//     emits. Only emphasis-wrapped names diverge; everything else already
//     agrees, so this rewrites nothing it does not have to.
const MEMBER_KINDS = [
  "define", "function", "variable", "typedef", "enum", "property",
  "signal", "slot", "event", "friend", "union", "struct", "class",
];
const memberHeading = new RegExp(`^#{2,6}\\s+(${MEMBER_KINDS.join("|")})\\s+(\\S+)\\s*$`);

// name -> the text Markdown actually renders for it
function asRendered(name) {
  const m = name.match(/^(\*\*|__)(.+)\1$/);
  return m ? m[2] : name;
}

const anchorFixes = new Map();
for (const file of mdFiles) {
  let inFence = false;
  for (const rawLine of readFileSync(file, "utf8").split("\n")) {
    // C code samples are full of "#define ...", so never scan inside a fence.
    if (/^\s*```/.test(rawLine)) { inFence = !inFence; continue; }
    if (inFence) continue;

    const m = rawLine.match(memberHeading);
    if (!m) continue;
    const [, kind, name] = m;
    const from = `${kind}-${name.toLowerCase()}`;
    const to = `${kind}-${asRendered(name).toLowerCase()}`;
    if (from !== to) anchorFixes.set(from, to);
  }
}

n = editFiles(mdFiles, (text) => {
  let out = text;
  for (const [from, to] of anchorFixes) out = out.split(`#${from})`).join(`#${to})`);
  return out;
});
log(`  repointed ${anchorFixes.size} Markdown-mangled anchor(s) in ${n} file(s)`);

// 4e. Drop anchors that point at a page rather than a heading on it.
//     doxybook2 appends "#file-errors.h" / "#dir-ziti" when linking to a file
//     or directory page, but those pages carry the name in their H1 title and
//     have no such heading, so Docusaurus flags every one as a broken anchor.
//     The link itself is correct -- only the fragment is bogus.
n = editFiles(mdFiles, (text) =>
  text.replace(/(\]\([^)]*?)#(?:file|dir)-[^)]*\)/g, "$1)"));
log(`  dropped page-level anchors doxybook2 invents in ${n} file(s)`);

// 4f. doxybook2 writes every cross-reference relative to the OUTPUT ROOT
//     ("Classes/structziti__options.md") but, with useFolders on, the file
//     doing the referencing sits one level down. Docusaurus resolves Markdown
//     links relative to the containing file, so "Files/ziti_8h.md" ends up
//     hunting for "Files/Classes/..." and fails the build outright. Walk each
//     link back up by the file's own depth.
const LINK_ROOTS = ["Classes", "Files", "Modules", "Namespaces", "Pages", "Examples", "images"];
const rootLink = new RegExp(`\\]\\((${LINK_ROOTS.join("|")})/`, "g");

n = editFiles(mdFiles, (text, file) => {
  const depth = relative(outputDir, file).split(sep).length - 1;
  if (depth === 0) return text; // index.md at the root is already correct
  return text.replace(rootLink, `](${"../".repeat(depth)}$1/`);
});
log(`  re-based root-relative cross-references in ${n} file(s)`);

// =============================================================================
// 5. SIDEBAR STRUCTURE
// =============================================================================
// sidebars.ts pulls this tree in with {type:'autogenerated'}. Without folders
// that is one flat list of ~150 structs and headers -- a wall nobody browses.
// doxybook2's useFolders groups them; these _category_.yml files order and
// label the groups, per the repo convention of never hand-editing sidebars.ts.

const CATEGORY_ORDER = [
  ["Modules", 10, "Modules"],
  ["Classes", 20, "Structs & Types"],
  ["Files", 30, "Header Files"],
  ["Namespaces", 40, "Namespaces"],
  ["Examples", 50, "Examples"],
  ["Pages", 60, "Related Pages"],
];

let categories = 0;
for (const [folder, position, label] of CATEGORY_ORDER) {
  const dir = join(outputDir, folder);
  if (!existsSync(dir)) continue;
  writeFileSync(
    join(dir, "_category_.yml"),
    `position: ${position}\nlabel: "${label}"\ncollapsed: true\n`,
  );
  categories++;
}
log(`wrote ${categories} _category_.yml file(s)`);

console.log(`- done. Output written to: ${outputDir}`);
