// Signs in to ZAC once and runs a flow's page modules in order.
//   node run.mjs <flow> <page> [page...]     e.g. node run.mjs add-by-url 30-ext-jwt-signer 40-services
// Each page module is flows/<flow>/<page>.mjs and default-exports async (page) => {}. A flow's names.mjs, if it has
// one, default-exports the [from, to] swaps that turn the lab's names into the docs' example names.
import { existsSync } from 'node:fs';
import { open, login, setNames } from './lib/zac.mjs';

const [flow, ...pages] = process.argv.slice(2);
if (!flow || !pages.length) { console.error('usage: node run.mjs <flow> <page> [page...]'); process.exit(2); }
const dir = new URL(`./flows/${flow}/`, import.meta.url);
if (existsSync(new URL('names.mjs', dir))) setNames((await import(new URL('names.mjs', dir))).default);

const { browser, page } = await open();
try {
  await login(page);
  for (const p of pages) {
    console.log(`${flow}/${p}`);
    await (await import(new URL(`${p}.mjs`, dir))).default(page);
  }
} finally {
  await browser.close();
}
