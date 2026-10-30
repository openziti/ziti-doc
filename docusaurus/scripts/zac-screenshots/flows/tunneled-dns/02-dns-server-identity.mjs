// Step 2: the dnslab-pihole identity, whose JWT host.sh enrolls.
import { identity, identityJwt, save, shot, card } from '../../lib/zac.mjs';

export default async function (page) {
  await identity(page, 'dnslab-pihole', ['dnslab-hosts']);
  await shot(page, 'zac-pihole-identity', [card(page, 'Identity Name'), card(page, 'Identity Attributes')]);
  await save(page);
  await identityJwt(page, 'dnslab-pihole', '/work/dnslab-pihole.jwt');
}
