import { chromium } from 'playwright';

export const D = 'zititv.demo.openziti.org';
export const CTRL = `https://addbyurl.${D}:9580`;
export const ZAC = `${CTRL}/zac/`;

// THEME=dark turns on ZAC's dark mode, which ZAC reads from localStorage, and saves each shot as <name>-dark.png
const DARK = process.env.THEME === 'dark';

export async function open({ width = 1280, height = 900, headless = true } = {}) {
  const browser = await chromium.launch({ headless });
  const ctx = await browser.newContext({ viewport: { width, height }, ignoreHTTPSErrors: true, deviceScaleFactor: 2 });
  await ctx.addInitScript((mode) => localStorage.setItem('mode', mode), DARK ? 'dark' : 'light');
  const page = await ctx.newPage();
  return { browser, ctx, page };
}

export async function login(page) {
  await page.goto(ZAC);
  await page.fill('#Username', 'admin');
  await page.fill('#Password', 'admin-demo-pw');
  await page.press('#Password', 'Enter');
  await page.waitForURL((u) => !u.pathname.endsWith('/login'));
  await page.waitForTimeout(2000);
  return page;
}

// swap the lab's real names for the docs' example names in every text node and input value
export async function exampleNames(page) {
  await page.evaluate((d) => {
    const subs = [
      [`addbyurl-idp.${d}:9780`, 'idp.example.com:8443'],
      [`addbyurl.${d}:9580`, 'ctrl.example.com:1280'],
      [`addbyurl-ctrl.${d}:9580`, 'ctrl-pki.example.com:1280'],
      [`addbyurl-idp.${d}`, 'idp.example.com'],
      [`addbyurl-ctrl.${d}`, 'ctrl-pki.example.com'],
      [`addbyurl.${d}`, 'ctrl.example.com'],
    ];
    const fix = (s) => subs.reduce((a, [f, t]) => a.split(f).join(t), s);
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.includes(d)) n.nodeValue = fix(n.nodeValue);
    for (const el of document.querySelectorAll('input, textarea')) {
      if (el.value.includes(d)) el.value = fix(el.value);
      if (el.placeholder?.includes(d)) el.placeholder = fix(el.placeholder);
    }
  }, D);
}

// crop to the union of the given locators' boxes, after swapping in the example names
export async function shot(page, name, locs, pad = 8) {
  await exampleNames(page);
  await page.waitForTimeout(300);
  const boxes = [];
  for (const l of locs) boxes.push(await l.boundingBox());
  const x = Math.min(...boxes.map((b) => b.x)) - pad, y = Math.min(...boxes.map((b) => b.y)) - pad;
  const r = Math.max(...boxes.map((b) => b.x + b.width)) + pad, btm = Math.max(...boxes.map((b) => b.y + b.height)) + pad;
  await page.screenshot({ path: `${process.env.SHOTS || "shots"}/${name}${DARK ? "-dark" : ""}.png`, clip: { x, y, width: r - x, height: btm - y }, fullPage: true });
  console.log("shot", name + (DARK ? "-dark" : ""), Math.round(r - x), 'x', Math.round(btm - y));
}

export const card = (page, text) => page.locator('lib-form-field-container', { hasText: text }).first();
export const ph = (page, p) => page.locator(`input[placeholder="${p}"], textarea[placeholder="${p}"]`).first();
export const toggle = (page, text) => page.locator('.toggle-container, .form-field-toggle-container', { hasText: text }).locator('.toggle').first();
