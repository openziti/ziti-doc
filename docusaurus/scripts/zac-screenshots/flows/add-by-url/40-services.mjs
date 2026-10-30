// Step 4: the two services and the acme-host identity, whose JWT host.sh enrolls.
import { service, identity, identityJwt, save } from '../../lib/zac.mjs';

export default async function (page) {
  await service(page, 'eng-wiki', 'eng-wiki.acme.ziti', 9781);
  await service(page, 'hr-portal', 'hr-portal.acme.ziti', 9782);
  await identity(page, 'acme-host', ['host']); await save(page);
  await identityJwt(page, 'acme-host', process.env.HOST_JWT || 'acme-host.jwt');
}
