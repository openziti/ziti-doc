// Step 9: the dnslab-web wildcard service and its two policies.
import { serviceWithConfigs, save, policy } from '../../lib/zac.mjs';
import { WEB } from './configs.mjs';

export default async function (page) {
  await serviceWithConfigs(page, 'dnslab-web', ['dnslab-web'], WEB);
  await save(page);
  await policy(page, 'dnslab-web-bind', 'Bind', ['#dnslab-web'], ['#dnslab-hosts']);
  await policy(page, 'dnslab-web-dial', 'Dial', ['#dnslab-web'], ['#dnslab-clients']);
}
