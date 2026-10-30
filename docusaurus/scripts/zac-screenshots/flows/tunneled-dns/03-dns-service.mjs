// Step 3: the dnslab-dns service and its two configs.
import { serviceWithConfigs, save } from '../../lib/zac.mjs';
import { DNS } from './configs.mjs';

export default async function (page) {
  await serviceWithConfigs(page, 'dnslab-dns', ['dnslab-dns'], DNS);
  await save(page);
}
