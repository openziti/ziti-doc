// Step 5: one identity per client, and their rows in the identities list with the enrollment token icons.
import { identity, save, go, shot } from '../../lib/zac.mjs';

export const CLIENTS = ['dnslab-client-win', 'dnslab-client-linux', 'dnslab-client-android'];

export default async function (page) {
  for (const c of CLIENTS) { await identity(page, c, ['dnslab-clients']); await save(page); }
  // wide enough that the name and roles columns don't truncate
  const size = page.viewportSize();
  await page.setViewportSize({ width: 1440, height: size.height });
  await go(page, 'identities');
  // the client rows only, Name through Token; admin and dnslab-pihole sort around them
  const rows = page.locator('[role=row]', { hasText: 'dnslab-client-' });
  await shot(page, 'zac-client-identities', [rows.first().locator('[col-id=name]'), rows.last().locator('[col-id=token]')], 2);
  await page.setViewportSize(size);
}
