// Opens the acme-idp signer with SHOW MORE OPTIONS on. 30-ext-jwt-signer and 80-map-existing-identities share it.
import { go } from '../../lib/zac.mjs';

export async function openSigner(page) {
  await go(page, 'jwt-signers');
  await page.getByText('acme-idp', { exact: true }).first().click(); await page.waitForTimeout(2000);
  const more = page.locator('.form-field-toggle-container', { hasText: 'SHOW MORE OPTIONS' });
  if ((await more.innerText()).includes('OFF')) await more.locator('.toggle').click();
  await page.waitForTimeout(500);
}
