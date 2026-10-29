// Drives ZAC through the add-by-url lab and saves the doc screenshots.
//   node capture.mjs build        steps 3-5: signer, auth policy, services, host identity (+ JWT), policies
//   node capture.mjs identities   step 7: identities list, after alice and bob joined
//   node capture.mjs carol        step 8: auto enrollment off, carol created by hand
import { open, login, ZAC, D, shot, card, ph, toggle } from './lib.mjs';

const IDP = process.env.IDP_URL || `https://addbyurl-idp.${D}:9780/realms/acme`;
const { browser, page } = await open({ height: 1800 });
const blur = () => page.locator('body').click({ position: { x: 5, y: 1750 } });
const save = async () => { await page.getByText('Save', { exact: true }).click(); await page.waitForTimeout(2500); };
const go = async (path) => { await page.goto(ZAC + path); await page.waitForTimeout(2000); };
const snap = (name, locs) => shot(page, name, locs);

// select2 role pickers: pick an existing @entity or #attribute, or type a new #attribute
async function roles(placeholder, list) {
  for (const r of list) {
    const inp = page.locator(`input[placeholder="${placeholder}"]`);
    await inp.click(); await inp.fill(r.slice(1)); await page.waitForTimeout(1200);
    const opt = page.locator(`.tag-name.select2-results__option[title="${r}"]`);
    if (await opt.count()) await opt.first().click(); else await inp.press('Enter');
    await inp.fill(''); await page.waitForTimeout(400);
  }
}

async function signer() {
  await go('jwt-signers/create');
  await ph(page, 'Name this JWT Signer').fill('acme-idp');
  await ph(page, 'Enter issuer').fill(IDP);
  await ph(page, 'Enter audience').fill('openziti');
  await ph(page, 'Enter claims property').fill('email');
  await ph(page, 'Enter client ID').fill('openziti');
  await ph(page, 'Enter external auth URL').fill(IDP);
  for (const s of ['openid', 'profile', 'email']) {
    await ph(page, 'Enter scopes').fill(s); await ph(page, 'Enter scopes').press('Enter');
  }
  await ph(page, 'Enter endpoint URL').fill(`${IDP}/protocol/openid-connect/certs`);
  for (const t of ['USE EXTERNAL ID', 'AUTO-ENROLL TO CERT', 'AUTO-ENROLL TO TOKEN', 'SHOW MORE OPTIONS']) {
    await toggle(page, t).click();
  }
  await ph(page, 'Enter name claims selector').fill('preferred_username');
  await ph(page, 'Enter attribute claims selector').fill('groups');
  await save();
}

async function authPolicy() {
  await go('auth-policies/create');
  await ph(page, 'Name this Auth Policy').fill('acme-users');
  await toggle(page, 'CERT').click();
  await toggle(page, 'EXT JWT').click();
  const inp = page.locator('input.select2-search__field');
  await inp.click(); await inp.fill('acme-idp'); await page.waitForTimeout(1200);
  await page.locator('.tag-name.select2-results__option', { hasText: 'acme-idp' }).first().click();
  await inp.fill(''); await blur();
  await snap('zac-auth-policy', [card(page, 'Name'), card(page, 'Primary Authentication'), card(page, 'Ext JWT Options')]);
  await save();
}

async function openSigner() {
  await go('jwt-signers');
  await page.getByText('acme-idp', { exact: true }).first().click(); await page.waitForTimeout(2000);
  const more = page.locator('.form-field-toggle-container', { hasText: 'SHOW MORE OPTIONS' });
  if ((await more.innerText()).includes('OFF')) await more.locator('.toggle').click();
  await page.waitForTimeout(500);
}

async function linkPolicy() {
  await openSigner();
  await card(page, 'Auto Enrollment Options').locator('select').selectOption({ label: 'acme-users' });
  await blur();
  await snap('zac-signer-auto-enroll', [card(page, 'Auto Enrollment'), card(page, 'Auto Enrollment Options')]);
  await save();
}

async function service(name, port) {
  await go('services/advanced/create');
  await ph(page, 'Name this Service').fill(name);
  const cfg = card(page, 'Add Configurations');
  await cfg.locator('select.form-field-dropdown').first().selectOption('intercept.v1');
  await page.waitForTimeout(1000);
  await ph(page, 'New Config Name').fill(`${name}.intercept`);
  await ph(page, '80 120-125 443 8080').fill('80');
  await cfg.locator('label', { hasText: /^ADDRESSES$/i }).locator('xpath=following::input[1]').fill(`${name}.acme.ziti`);
  await cfg.locator('input.checkbox').first().check();
  await page.getByText('Create and Attach').click(); await page.waitForTimeout(2500);
  await cfg.locator('select.form-field-dropdown').first().selectOption('host.v1');
  await page.waitForTimeout(1000);
  await ph(page, 'New Config Name').fill(`${name}.host`);
  await cfg.locator('select.jsonEntry').first().selectOption('tcp');
  await ph(page, 'host.name').fill('127.0.0.1');
  await cfg.locator('input[type=number]').first().fill(String(port));
  await page.getByText('Create and Attach').click(); await page.waitForTimeout(2500);
  await save();
}

async function identity(name, attrs, { authPolicy, externalId } = {}) {
  await go('identities/create');
  await ph(page, 'Name this identity').fill(name);
  await roles('Add attributes to group Identities', attrs.map((a) => `#${a}`));
  if (authPolicy) await card(page, 'Auth Policy').locator('select').selectOption({ label: authPolicy });
  if (externalId) await ph(page, 'Optional External ID').fill(externalId);
  await blur();
}

async function hostJwt() {
  await go('identities');
  const row = page.locator('[role=row]', { hasText: 'acme-host' }).first();
  const [dl] = await Promise.all([page.waitForEvent('download'), row.locator('[col-id=token] span.cert').click()]);
  await dl.saveAs(process.env.HOST_JWT || 'acme-host.jwt');
}

async function policy(name, type, svcs, ids, shotName) {
  await go('service-policies/create');
  await ph(page, 'Name this service policy').fill(name);
  await page.locator('select.form-field-dropdown').first().selectOption(type);
  await roles('Select service attributes', svcs);
  await roles('Select identity attributes', ids);
  await blur(); await page.waitForTimeout(1000);
  if (shotName) await snap(shotName, [card(page, 'Service Policy Name'), card(page, 'Select Identity Attributes'), card(page, 'Type')]);
  await save();
}

await login(page);
switch (process.argv[2]) {
  case 'build':
    await signer();
    await authPolicy();
    await linkPolicy();
    await service('eng-wiki', 9781);
    await service('hr-portal', 9782);
    await identity('acme-host', ['host']); await save();
    await hostJwt();
    await policy('acme-host-bind', 'Bind', ['@eng-wiki', '@hr-portal'], ['#host']);
    await policy('engineering-dial', 'Dial', ['@eng-wiki'], ['#engineering'], 'zac-dial-policy');
    await policy('hr-dial', 'Dial', ['@hr-portal'], ['#hr']);
    break;
  case 'identities': {
    await go('identities');
    // Name through Type columns, header down to bob
    const head = (c) => page.locator(`[role=columnheader][col-id=${c}]`);
    const bob = page.locator('[role=row]', { hasText: 'bob' }).first().locator('[col-id=type]');
    await shot(page, 'zac-identities', [head('name'), head('type'), bob], 2);
    break;
  }
  case 'carol':
    await openSigner();
    for (const t of ['AUTO-ENROLL TO CERT', 'AUTO-ENROLL TO TOKEN']) await toggle(page, t).click();
    await save();
    await identity('carol', ['engineering'], { authPolicy: 'acme-users', externalId: 'carol@acme.example' });
    await snap('zac-carol', [card(page, 'Identity Name'), card(page, 'Identity Attributes'), card(page, 'Auth Policy')]);
    await save();
    break;
  default:
    console.error('usage: node capture.mjs build|identities|carol'); process.exitCode = 2;
}
await browser.close();
