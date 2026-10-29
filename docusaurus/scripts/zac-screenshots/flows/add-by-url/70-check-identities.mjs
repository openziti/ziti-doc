// Step 7: the identities list, after alice and bob joined.
import { go, shot } from '../../lib/zac.mjs';

export default async function (page) {
  await go(page, 'identities');
  // Name through Type columns, header down to bob
  const head = (c) => page.locator(`[role=columnheader][col-id=${c}]`);
  const bob = page.locator('[role=row]', { hasText: 'bob' }).first().locator('[col-id=type]');
  await shot(page, 'zac-identities', [head('name'), head('type'), bob], 2);
}
