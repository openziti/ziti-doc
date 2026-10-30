// Step 5: the bind policy for the host and a dial policy per group.
import { policy } from '../../lib/zac.mjs';

export default async function (page) {
  await policy(page, 'acme-host-bind', 'Bind', ['@eng-wiki', '@hr-portal'], ['#host']);
  await policy(page, 'engineering-dial', 'Dial', ['@eng-wiki'], ['#engineering'], 'zac-dial-policy');
  await policy(page, 'hr-dial', 'Dial', ['@hr-portal'], ['#hr']);
}
