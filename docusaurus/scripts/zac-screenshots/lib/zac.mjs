// Drives ZAC with Playwright and saves cropped screenshots. Nothing here knows about a particular flow.
//   CTRL_URL   the controller ZAC runs on, e.g. https://ctrl.zititv.demo.openziti.org:9580 (from network.sh)
//   THEME      light or dark; dark turns on ZAC's dark mode and saves each shot as <name>-dark.png
//   SHOTS      the directory the shots go to
import { chromium } from 'playwright';

export const CTRL = process.env.CTRL_URL;
export const ZAC = `${CTRL}/zac/`;
const DARK = process.env.THEME === 'dark';

export async function open({ width = 1280, height = 1800, headless = true } = {}) {
  const browser = await chromium.launch({ headless });
  const ctx = await browser.newContext({ viewport: { width, height }, ignoreHTTPSErrors: true, deviceScaleFactor: 2 });
  // ZAC reads its theme from localStorage
  await ctx.addInitScript((mode) => localStorage.setItem('mode', mode), DARK ? 'dark' : 'light');
  const page = await ctx.newPage();
  return { browser, ctx, page };
}

export async function login(page, user = 'admin', password = process.env.ZITI_PWD || 'admin-demo-pw') {
  await page.goto(ZAC);
  await page.fill('#Username', user);
  await page.fill('#Password', password);
  await page.press('#Password', 'Enter');
  await page.waitForURL((u) => !u.pathname.endsWith('/login'));
  await page.waitForTimeout(2000);
}

// [from, to] text swaps applied before every shot, so the lab's real names show as the docs' example names
let subs = [];
export const setNames = (list) => { subs = list; };

async function exampleNames(page) {
  if (!subs.length) return;
  await page.evaluate((subs) => {
    const fix = (s) => subs.reduce((a, [f, t]) => a.split(f).join(t), s);
    const hit = (s) => subs.some(([f]) => s.includes(f));
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (hit(n.nodeValue)) n.nodeValue = fix(n.nodeValue);
    for (const el of document.querySelectorAll('input, textarea')) {
      if (hit(el.value)) el.value = fix(el.value);
      if (el.placeholder && hit(el.placeholder)) el.placeholder = fix(el.placeholder);
    }
  }, subs);
}

// crop to the union of the given locators' boxes, after swapping in the example names
export async function shot(page, name, locs, pad = 8) {
  await exampleNames(page);
  await page.waitForTimeout(300);
  const boxes = [];
  for (const l of locs) boxes.push(await l.boundingBox());
  const x = Math.min(...boxes.map((b) => b.x)) - pad, y = Math.min(...boxes.map((b) => b.y)) - pad;
  const r = Math.max(...boxes.map((b) => b.x + b.width)) + pad, btm = Math.max(...boxes.map((b) => b.y + b.height)) + pad;
  const file = name + (DARK ? '-dark' : '');
  await page.screenshot({ path: `${process.env.SHOTS || 'shots'}/${file}.png`, clip: { x, y, width: r - x, height: btm - y }, fullPage: true });
  console.log('shot', file, Math.round(r - x), 'x', Math.round(btm - y));
}

// ZAC form fields
export const card = (page, text) => page.locator('lib-form-field-container', { hasText: text }).first();
export const ph = (page, p) => page.locator(`input[placeholder="${p}"], textarea[placeholder="${p}"]`).first();
export const toggle = (page, text) => page.locator('.toggle-container, .form-field-toggle-container', { hasText: text }).locator('.toggle').first();

export const go = async (page, path) => { await page.goto(ZAC + path); await page.waitForTimeout(2000); };
export const save = async (page) => { await page.getByText('Save', { exact: true }).click(); await page.waitForTimeout(2500); };
// click empty space to close dropdowns before a shot
export const blur = (page) => page.locator('body').click({ position: { x: 5, y: 1750 } });

// select2 role pickers: pick an existing @entity or #attribute, or type a new #attribute
export async function roles(page, placeholder, list) {
  for (const r of list) {
    const inp = page.locator(`input[placeholder="${placeholder}"]`);
    await inp.click(); await inp.fill(r.slice(1)); await page.waitForTimeout(1200);
    const opt = page.locator(`.tag-name.select2-results__option[title="${r}"]`);
    if (await opt.count()) await opt.first().click(); else await inp.press('Enter');
    await inp.fill(''); await page.waitForTimeout(400);
  }
}

// a service with a new intercept.v1 (tcp/80 on `address`) and host.v1 (127.0.0.1:port) config
export async function service(page, name, address, port) {
  await go(page, 'services/advanced/create');
  await ph(page, 'Name this Service').fill(name);
  const cfg = card(page, 'Add Configurations');
  await cfg.locator('select.form-field-dropdown').first().selectOption('intercept.v1');
  await page.waitForTimeout(1000);
  await ph(page, 'New Config Name').fill(`${name}.intercept`);
  await ph(page, '80 120-125 443 8080').fill('80');
  await cfg.locator('label', { hasText: /^ADDRESSES$/i }).locator('xpath=following::input[1]').fill(address);
  await cfg.locator('input.checkbox').first().check();
  await page.getByText('Create and Attach').click(); await page.waitForTimeout(2500);
  await cfg.locator('select.form-field-dropdown').first().selectOption('host.v1');
  await page.waitForTimeout(1000);
  await ph(page, 'New Config Name').fill(`${name}.host`);
  await cfg.locator('select.jsonEntry').first().selectOption('tcp');
  await ph(page, 'host.name').fill('127.0.0.1');
  await cfg.locator('input[type=number]').first().fill(String(port));
  await page.getByText('Create and Attach').click(); await page.waitForTimeout(2500);
  await save(page);
}

// fills the identity form and leaves it unsaved, so the caller can take a shot first
export async function identity(page, name, attrs, { authPolicy, externalId } = {}) {
  await go(page, 'identities/create');
  await ph(page, 'Name this identity').fill(name);
  await roles(page, 'Add attributes to group Identities', attrs.map((a) => `#${a}`));
  if (authPolicy) await card(page, 'Auth Policy').locator('select').selectOption({ label: authPolicy });
  if (externalId) await ph(page, 'Optional External ID').fill(externalId);
  await blur(page);
}

// downloads an identity's enrollment JWT from the identities list
export async function identityJwt(page, name, path) {
  await go(page, 'identities');
  const row = page.locator('[role=row]', { hasText: name }).first();
  const [dl] = await Promise.all([page.waitForEvent('download'), row.locator('[col-id=token] span.cert').click()]);
  await dl.saveAs(path);
}

// fills a service policy and saves it; `shotName` takes a shot of the form first
export async function policy(page, name, type, svcs, ids, shotName) {
  await go(page, 'service-policies/create');
  await ph(page, 'Name this service policy').fill(name);
  await page.locator('select.form-field-dropdown').first().selectOption(type);
  await roles(page, 'Select service attributes', svcs);
  await roles(page, 'Select identity attributes', ids);
  await blur(page); await page.waitForTimeout(1000);
  if (shotName) await shot(page, shotName, [card(page, 'Service Policy Name'), card(page, 'Select Identity Attributes'), card(page, 'Type')]);
  await save(page);
}
