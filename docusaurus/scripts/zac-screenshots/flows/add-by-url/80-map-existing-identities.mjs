// Step 8: auto enrollment off, and carol created by hand with her external ID.
import { openSigner } from './signer.mjs';
import { identity, save, shot, card, toggle } from '../../lib/zac.mjs';

export default async function (page) {
  await openSigner(page);
  for (const t of ['AUTO-ENROLL TO CERT', 'AUTO-ENROLL TO TOKEN']) await toggle(page, t).click();
  await save(page);
  await identity(page, 'carol', ['engineering'], { authPolicy: 'acme-users', externalId: 'carol@acme.example' });
  await shot(page, 'zac-carol', [card(page, 'Identity Name'), card(page, 'Identity Attributes'), card(page, 'Auth Policy')]);
  await save(page);
}
