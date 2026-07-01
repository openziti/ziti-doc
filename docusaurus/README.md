# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Versions

The docs are versioned. Each version is served from a different folder, so edit the one that matches the
version you mean to change:

| Version | Edit here | Served at |
|---|---|---|
| Latest (default) | `docs/` | `/docs/openziti` (site root) |
| Active LTS (2.0.x) | `openziti_versioned_docs/version-active/` | `/docs/openziti/active` |
| Maintenance LTS (1.6.x) | `openziti_versioned_docs/version-maintenance/` | `/docs/openziti/maint` |

**Latest is the `docs/` folder** — it's the default you land on with `yarn start`, so that's where most edits
go. The other two are frozen snapshots. Version labels, paths, and the default are configured in
`docusaurus-plugin-openziti-docs.ts` (the `versions` block) with the version list in
`openziti_versions.json`.

If a config change to `docusaurus.config.ts` or `docusaurus-plugin-openziti-docs.ts` doesn't seem to take
effect — or `yarn start` reports "Duplicate routes" or "unknown versions" — you probably have stale
compiled `.js` twins from running `yarn typecheck` (`tsc` emits them next to the `.ts` source and they're
gitignored). Remove them and the `.docusaurus` cache, then restart:

```
find src -name '*.js' -o -name '*.d.ts' | git check-ignore --stdin | xargs rm -f
rm -f docusaurus.config.js docusaurus-plugin-openziti-docs.js
rm -rf .docusaurus
```

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
