#!/usr/bin/env node
// =============================================================================
// gendoc.mjs — Build the OpenZiti documentation site.
//
// This is the SINGLE source of truth for the gendoc orchestration.
// gendoc.sh and gendoc.ps1 are thin platform shims that call this file;
// do not reimplement build logic in them.
//
// Clones (or updates) the sibling doc repos into docusaurus/docs/_remotes,
// patches the imported READMEs so Docusaurus can render them, builds the SDK
// reference docs (C#, C, Swift), optionally collects stargazer data, then runs
// a Docusaurus production build.
//
// USAGE
//   node gendoc.mjs [OPTIONS]
//
// OPTIONS (short flags may be combined, e.g. -cld)
//   -g, --skip-git          Skip creating and updating the Git working copies
//   -l, --skip-linked-doc   Skip linked doc generation (doxygen/doxybook2/wget)
//   -c, --skip-clean        Skip the clean step that deletes Git working copies
//   -s, --stargazers        Also fetch stargazer data (needs gh + a token)
//   -d, --skip-docusaurus   Skip the yarn install + yarn build at the end
//   -z, --zip               Generate docs-openziti.zip after the build
//   -h, --help              Show this help and exit
//
// ENVIRONMENT VARIABLES
//   ZITI_DOC_GIT_LOC   Where sibling repos are cloned
//                      (default: docusaurus/docs/_remotes)
//   SDK_ROOT_TARGET    Where the HTML-based SDK docs (C#, Swift) are written
//                      (default: docusaurus/static/docs/reference/developer/sdk)
//   DOXYGEN            doxygen binary, forwarded to the C SDK generator
//   DOXYBOOK2          doxybook2 binary, forwarded to the C SDK generator
//   ZITI_SDK_C_BRANCH  Branch of openziti/ziti-sdk-c to document
//                      (default: updates-to-make-doxybook2-happy -- see the
//                      TEMPORARY note by SDK_C_BRANCH below)
//   ZITI_CI_STARGAZERS_READ_TOKEN | STARGAZERS_READ_TOKEN | GITHUB_TOKEN
//                      Token for the stargazers API (-s only)
//
// EXAMPLES
//   node gendoc.mjs
//   node gendoc.mjs -c -l -d          # just resolve imports for the dev server
//   node gendoc.mjs --skip-git --zip
// =============================================================================

import { spawnSync } from "node:child_process";
import {
  cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const isWin = process.platform === "win32";
const GIT = "git";
const YARN = isWin ? "yarn.cmd" : "yarn";

const scriptRoot = dirname(fileURLToPath(import.meta.url));

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

// Run a command, stream its output, and abort the whole build on failure
// (mirrors `set -euo pipefail`).
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

// Run a command and capture stdout/stderr without aborting.
function capture(cmd, args, opts = {}) {
  return spawnCompat(cmd, args, {
    encoding: "utf8", env: process.env, maxBuffer: 64 * 1024 * 1024, ...opts,
  });
}

// Is a command available on PATH?
function has(cmd) {
  const r = spawnCompat(cmd, ["--version"], { stdio: "ignore" });
  return !r.error && r.status === 0;
}

// Apply a list of [find, replace] pairs to a file. `find` may be a string
// (literal, all occurrences) or a RegExp. Replaces the sed calls the two shell
// scripts used, which needed different in-place flags on macOS vs Linux.
function patchFile(file, label, edits, { required = true } = {}) {
  console.log(`fixing ${file} to work with docusaurus`);
  if (!existsSync(file)) {
    if (required) {
      console.error(`ERROR: ${label}: file not found: ${file}`);
      process.exit(1);
    }
    console.warn(`WARN: ${label}: file not found, skipping: ${file}`);
    return;
  }
  const before = readFileSync(file, "utf8");
  let after = before;
  for (const [find, replace] of edits) {
    after = typeof find === "string" ? after.split(find).join(replace)
                                     : after.replace(find, replace);
  }
  if (after !== before) writeFileSync(file, after);
  console.log(`  ${label}: ${after === before ? "no change needed" : "fix applied"}`);
}

// =============================================================================
// ARGUMENT PARSING
// =============================================================================

const USAGE =
  "Usage: node gendoc.mjs [OPTIONS] -- see the header of gendoc.mjs for the full reference.";

const opts = {
  skipGit: false,
  skipLinkedDoc: false,
  skipClean: false,
  stargazers: false,
  skipDocusaurus: false,
  zip: false,
};

const LONG = {
  "--skip-git": "skipGit",
  "--skip-linked-doc": "skipLinkedDoc",
  "--skip-clean": "skipClean",
  "--stargazers": "stargazers",
  "--skip-docusaurus": "skipDocusaurus",
  "--zip": "zip",
};
const SHORT = {
  g: "skipGit",
  l: "skipLinkedDoc",
  c: "skipClean",
  s: "stargazers",
  d: "skipDocusaurus",
  z: "zip",
};
const ANNOUNCE = {
  skipGit: "- skipping creating and updating Git working copies",
  skipLinkedDoc: "- skipping linked doc generation",
  skipClean: "- skipping clean step that deletes Git working copies",
  stargazers: "- fetching stargazer data as well",
  skipDocusaurus: "- skipping docusaurus generation",
  zip: "- generating a zip file after build",
};

console.log("- processing opts");
for (const a of process.argv.slice(2)) {
  if (a === "-h" || a === "--help") { console.log(USAGE); process.exit(0); }

  if (LONG[a]) { opts[LONG[a]] = true; console.log(ANNOUNCE[LONG[a]]); continue; }

  // Combined short flags, matching the getopts/-glcsdz behaviour of both shims.
  if (/^-[a-z]+$/.test(a)) {
    for (const ch of a.slice(1)) {
      if (SHORT[ch]) { opts[SHORT[ch]] = true; console.log(ANNOUNCE[SHORT[ch]]); }
      else console.warn(`WARN: ignoring option: -${ch}`);
    }
    continue;
  }
  console.warn(`WARN: ignoring argument: ${a}`);
}
console.log("- done processing opts");

const remotesDir = process.env.ZITI_DOC_GIT_LOC
  || join(scriptRoot, "docusaurus", "docs", "_remotes");
const sdkRootTarget = process.env.SDK_ROOT_TARGET
  || join(scriptRoot, "docusaurus", "static", "docs", "reference", "developer", "sdk");
const docusaurusDir = join(scriptRoot, "docusaurus");

// TEMPORARY: the C SDK doc-comment fixes that make doxybook2 produce correct
// output live on a branch, not main. Drop this back to "main" (or delete the
// override) once that branch merges.
const SDK_C_BRANCH = process.env.ZITI_SDK_C_BRANCH || "updates-to-make-doxybook2-happy";

// =============================================================================
// BUILD CONFIGURATION BANNER
// =============================================================================

const line = "========================================";
console.log(line);
console.log("GENDOC CONFIGURATION");
console.log(line);
console.log(`  script root='${scriptRoot}'`);
console.log(`  ZITI_DOC_GIT_LOC='${remotesDir}'`);
console.log(`  SDK_ROOT_TARGET='${sdkRootTarget}'`);
console.log(`  ZITI_SDK_C_BRANCH='${SDK_C_BRANCH}'`);
console.log(`  SKIP_GIT=${opts.skipGit ? 1 : 0}`);
console.log(`  SKIP_LINKED_DOC=${opts.skipLinkedDoc ? 1 : 0}`);
console.log(`  SKIP_CLEAN=${opts.skipClean ? 1 : 0}`);
console.log(`  SKIP_DOCUSAURUS_GEN=${opts.skipDocusaurus ? 1 : 0}`);
console.log(`  ADD_STARGAZER_DATA=${opts.stargazers ? 1 : 0}`);
console.log(`  ZITI_GEN_ZIP=${opts.zip ? 1 : 0}`);
console.log(`  node: ${process.version}`);
console.log(`  yarn: ${capture(YARN, ["--version"]).stdout?.trim() || "not found"}`);
console.log(line);

// =============================================================================
// 1. CLONE / UPDATE THE SIBLING DOC REPOS
// =============================================================================

const REPOS = [
  ["https://github.com/openziti/ziti", "ziti-cmd"],
  ["https://github.com/openziti/ziti-sdk-csharp", "ziti-sdk-csharp"],
  ["https://github.com/openziti/ziti-sdk-c", "ziti-sdk-c", SDK_C_BRANCH],
  ["https://github.com/openziti/ziti-android-app", "ziti-android-app"],
  ["https://github.com/openziti/ziti-sdk-swift", "ziti-sdk-swift"],
  ["https://github.com/openziti/ziti-tunnel-sdk-c", "ziti-tunnel-sdk-c"],
  ["https://github.com/openziti/helm-charts", "helm-charts"],
  ["https://github.com/openziti-test-kitchen/kubeztl", "kubeztl"],
  ["https://github.com/openziti/desktop-edge-win", "desktop-edge-win"],
];

function cloneOrPull(remote, name, branch = "main") {
  const dir = join(remotesDir, name);
  if (!existsSync(dir)) {
    run(GIT, [
      "clone", remote, "--branch", branch,
      "--single-branch", dir, "--no-tags", "--depth", "1",
    ]);
    return;
  }
  // These are --single-branch clones, so an existing checkout of a DIFFERENT
  // branch has no ref to switch to and a plain `git checkout` fails. Fetch the
  // branch first when it is missing, which is what happens the first time a
  // repo is pinned to something other than main.
  if (capture(GIT, ["rev-parse", "--verify", "--quiet", branch], { cwd: dir }).status !== 0) {
    run(GIT, ["fetch", "--depth", "1", "origin", `${branch}:${branch}`], { cwd: dir });
  }
  run(GIT, ["checkout", branch], { cwd: dir });
  run(GIT, ["pull", "--ff-only"], { cwd: dir });
}

if (!opts.skipGit) {
  console.log("updating dependencies by rm/checkout");
  mkdirSync(remotesDir, { recursive: true });
  if (!opts.skipClean) {
    // Only the ziti-* clones are wiped, exactly as the shell version did --
    // helm-charts, kubeztl and desktop-edge-win are left in place.
    for (const entry of readdirSync(remotesDir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("ziti-")) {
        rmSync(join(remotesDir, entry.name), { recursive: true, force: true });
      }
    }
  }
  run(GIT, ["config", "--global", "--add", "safe.directory", process.cwd()]);
  for (const [remote, name] of REPOS) cloneOrPull(remote, name);
}

// =============================================================================
// 2. PATCH IMPORTED READMEs SO DOCUSAURUS CAN RENDER THEM
// =============================================================================
// NOTE: gendoc.ps1 never applied the docker-router fix, so the Windows and
// Linux builds produced different sites. Unifying here fixes that drift.

patchFile(
  join(remotesDir, "helm-charts", "charts", "ziti-edge-tunnel", "README.md"),
  "helm ziti-edge-tunnel",
  [
    ["<https://openziti.io>", "&lt;https://openziti.io&gt;"],
    ["<https://github.com/openziti/ziti-tunnel-sdk-c>",
     "&lt;https://github.com/openziti/ziti-tunnel-sdk-c&gt;"],
    ["sresponse\\\\s<|>$", "sresponse\\\\s&lt;|>$"],
  ],
);

patchFile(
  join(remotesDir, "helm-charts", "charts", "ziti-router", "README.md"),
  "helm ziti-router examples links",
  [[/\]\(\.?\/examples\/?\)/g,
    "](https://github.com/openziti/helm-charts/tree/main/charts/ziti-router/examples)"]],
);

patchFile(
  join(remotesDir, "ziti-cmd", "dist", "docker-images", "ziti-router", "README.md"),
  "docker ziti-router broken link",
  [["/docs/guides/deployments/linux/router/deploy/",
    "/guides/deployments/10-linux/20-router/10-deploy.mdx"]],
);

// =============================================================================
// 3. SDK REFERENCE DOCS
// =============================================================================

if (!opts.skipClean) {
  if (existsSync(sdkRootTarget)) {
    console.log(`SDK_ROOT_TARGET exists. removing previous build at: ${sdkRootTarget}`);
    rmSync(sdkRootTarget, { recursive: true, force: true });
  } else {
    console.log(`SDK_ROOT_TARGET [${sdkRootTarget}] does not exist`);
  }
}

// The C SDK used to emit Doxygen HTML here. It now emits Markdown under docs/,
// so anything left at this path is stale -- and actively harmful: Docusaurus
// copies static/ verbatim into build/, so a stale index.html at
// docs/reference/developer/sdk/clang/ SHADOWS the Markdown route at the exact
// same URL and you silently get the old Doxygen site instead. Always remove it,
// even under --skip-clean, because --skip-clean is precisely when a stale tree
// from an older checkout survives.
const staleClangHtml = join(sdkRootTarget, "clang");
if (existsSync(staleClangHtml)) {
  console.log(`removing stale Doxygen HTML that would shadow the Markdown route: ${staleClangHtml}`);
  rmSync(staleClangHtml, { recursive: true, force: true });
}

// The C SDK generator owns its own tool checks and degrades to a placeholder
// page when doxygen/doxybook2 are missing, so neither is required here.
const cSdkGenerator = join(scriptRoot, "sdk-docgen-fixups", "c", "generate.mjs");

if (!opts.skipLinkedDoc) {
  if (!has("wget")) {
    console.error("");
    console.error("The commands listed below are required to be on the path for this");
    console.error("script to function properly. Please ensure they are on the path and");
    console.error("then try again.");
    console.error(" * wget");
    console.error("");
    process.exit(1);
  }

  console.log("==================================================");
  const csharpSource = join(remotesDir, "ziti-sdk-csharp", "docs");
  const csharpTarget = join(sdkRootTarget, "csharp");
  console.log("Copying csharp SDK docs");
  console.log(`    from: ${csharpSource}`);
  console.log(`      to: ${csharpTarget}`);
  mkdirSync(csharpTarget, { recursive: true });
  cpSync(csharpSource, csharpTarget, { recursive: true });

  // The C SDK reference is native Markdown under docs/, not HTML under static/,
  // so it does not use SDK_ROOT_TARGET like the C#/Swift SDKs do. All of the
  // logic lives in generate.mjs; this is only the call site.
  console.log("");
  console.log("Generating C SDK doc (doxygen -> doxybook2 -> Markdown)");
  // --branch matters even with --no-clone: the generator uses it to build the
  // absolute GitHub URLs it rewrites the SDK README's sibling links into.
  run(process.execPath, [
    cSdkGenerator,
    "--sdk-dir", join(remotesDir, "ziti-sdk-c"),
    "--branch", SDK_C_BRANCH,
    "--no-clone",
  ]);

  const swiftProj = join(remotesDir, "ziti-sdk-swift", "CZiti.xcodeproj", "project.pbxproj");
  if (existsSync(swiftProj)) {
    const swiftTarget = join(sdkRootTarget, "swift");
    const swiftTgz =
      "https://github.com/openziti/ziti-sdk-swift/releases/latest/download/ziti-sdk-swift-docs.tgz";
    mkdirSync(swiftTarget, { recursive: true });
    console.log("");
    console.log("Copying Swift docs");
    console.log(`    from: ${swiftTgz}`);
    console.log(`      to: ${swiftTarget}`);
    // The shell version piped wget into tar. Node has no shell pipe here, so
    // buffer the tarball and hand it to tar on stdin instead.
    const dl = capture("wget", ["-q", "-O", "-", swiftTgz], { encoding: "buffer" });
    if (dl.error || dl.status !== 0 || !dl.stdout?.length) {
      console.error(`ERROR: failed to download Swift docs from ${swiftTgz}`);
      process.exit(1);
    }
    run("tar", ["-xz"], { cwd: swiftTarget, input: dl.stdout, stdio: ["pipe", "inherit", "inherit"] });
  }
} else {
  // sidebars.ts hard-requires reference/developer/sdk/clang/index, so skipping
  // linked-doc generation must still leave that page behind or the whole
  // Docusaurus build fails on a missing sidebar document id.
  console.log("");
  console.log("Skipping C SDK doc generation; writing placeholder so the sidebar resolves");
  run(process.execPath, [cSdkGenerator, "--skip"]);
}

// =============================================================================
// 4. STARGAZER DATA (opt-in)
// =============================================================================
// Collection lives in gh-stats.sh; there is no JS port, so run it under bash
// rather than keeping two collectors in sync.

if (opts.stargazers) {
  const haveToken = process.env.ZITI_CI_STARGAZERS_READ_TOKEN
    || process.env.STARGAZERS_READ_TOKEN
    || process.env.GITHUB_TOKEN;

  if (!has("gh")) {
    console.log("gh CLI not installed, skipping stargazer data");
  } else if (!has("bash")) {
    console.log("bash not found (needed to run gh-stats.sh), skipping stargazer data");
  } else if (!haveToken && capture("gh", ["auth", "status"]).status !== 0) {
    console.log("no stargazer token and gh is not logged in, skipping stargazer data");
  } else {
    console.log("collecting stargazer data before building the site...");
    run("bash", [join(scriptRoot, "gh-stats.sh")]);
  }
}

// =============================================================================
// 5. DOCUSAURUS BUILD
// =============================================================================

if (!opts.skipDocusaurus) {
  console.log(`running 'yarn install' in ${docusaurusDir}`);
  run(YARN, ["install", "--frozen-lockfile"], { cwd: docusaurusDir });
  console.log(`running 'yarn build' in ${docusaurusDir}`);
  run(YARN, ["build"], { cwd: docusaurusDir });
  console.log("");

  if (opts.zip) {
    const outDir = join(docusaurusDir, "openziti");
    console.log(`generating docs into ${outDir}`);
    run(YARN, ["build", "--out-dir=openziti"], { cwd: docusaurusDir });
    run(GIT, ["checkout", "docusaurus.config.ts"], { cwd: docusaurusDir });
    console.log(`zipping build directory: ${outDir}`);
    // `zip` is not on a stock Windows box; tar ships with Windows 10+ and every
    // Linux/macOS box, and can write a zip via -a.
    run("tar", ["-a", "-c", "-f", join(scriptRoot, "docs-openziti.zip"), "-C", outDir, "."]);
  }
}

console.log("");
console.log("------------------------");
console.log("gendoc complete");
