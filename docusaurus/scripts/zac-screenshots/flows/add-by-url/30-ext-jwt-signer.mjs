// Step 3: the acme-idp signer, the acme-users auth policy, and the signer's enrollment auth policy.
import { IDP } from './names.mjs';
import { openSigner } from './signer.mjs';
import { go, save, blur, shot, card, ph, toggle } from '../../lib/zac.mjs';

export default async function (page) {
  await go(page, 'jwt-signers/create');
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
  await save(page);

  await go(page, 'auth-policies/create');
  await ph(page, 'Name this Auth Policy').fill('acme-users');
  await toggle(page, 'CERT').click();
  await toggle(page, 'EXT JWT').click();
  const inp = page.locator('input.select2-search__field');
  await inp.click(); await inp.fill('acme-idp'); await page.waitForTimeout(1200);
  await page.locator('.tag-name.select2-results__option', { hasText: 'acme-idp' }).first().click();
  await inp.fill(''); await blur(page);
  await shot(page, 'zac-auth-policy', [card(page, 'Name'), card(page, 'Primary Authentication'), card(page, 'Ext JWT Options')]);
  await save(page);

  await openSigner(page);
  await card(page, 'Auto Enrollment Options').locator('select').selectOption({ label: 'acme-users' });
  await blur(page);
  await shot(page, 'zac-signer-auto-enroll', [card(page, 'Auto Enrollment'), card(page, 'Auto Enrollment Options')]);
  await save(page);
}
