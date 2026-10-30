// Step 4: the bind policy for the Pi-hole's tunneler and the dial policy for the clients.
import { policy } from '../../lib/zac.mjs';

export default async function (page) {
  await policy(page, 'dnslab-dns-bind', 'Bind', ['#dnslab-dns'], ['#dnslab-hosts'], 'zac-dns-bind-policy');
  await policy(page, 'dnslab-dns-dial', 'Dial', ['#dnslab-dns'], ['#dnslab-clients']);
}
