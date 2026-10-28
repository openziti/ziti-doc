---
sidebar_label: 2. Identity provider (Keycloak)
---

# Step 2: Set up the identity provider

![Keycloak and its users highlighted: the acme realm, with groups the tokens carry.](/img/add-by-url/step-02-identity-provider.svg)

The lab runs Keycloak in Docker at `idp.example.com`, with the same Let's Encrypt certificate as the controller:

```bash
docker run -d --name kc-acme -p 8443:8443 -v /opt/ziti/le:/le:ro \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin-demo-pw \
  -e KC_HTTPS_CERTIFICATE_FILE=/le/fullchain.pem -e KC_HTTPS_CERTIFICATE_KEY_FILE=/le/privkey.pem \
  -e KC_HOSTNAME=https://idp.example.com:8443 \
  quay.io/keycloak/keycloak:26.0 start-dev
```

`start-dev` is for the lab only. For production, see the
[Keycloak server guides](https://www.keycloak.org/guides#server).

## Create the realm, groups, and users

The lab realm is `acme`, with two groups and three users. `alice` is in `engineering`, `bob` is in `finance`, and
`carol` is in no group. Each password is `<user>-demo-pw`. Run `kcadm.sh` inside the container:

```bash
K="docker exec kc-acme /opt/keycloak/bin/kcadm.sh"
$K config credentials --server http://localhost:8080 --realm master --user admin --password admin-demo-pw

$K create realms -s realm=acme -s enabled=true
ENG=$($K create groups -r acme -s name=engineering -i)
FIN=$($K create groups -r acme -s name=finance -i)

for u in alice:$ENG bob:$FIN carol:; do
  name=${u%%:*}; group=${u#*:}
  id=$($K create users -r acme -i -s username=$name -s enabled=true \
    -s email=$name@acme.example -s emailVerified=true -s firstName=${name^} -s lastName=Acme)
  $K set-password -r acme --username $name --new-password $name-demo-pw
  if [ -n "$group" ]; then
    $K update users/$id/groups/$group -r acme -s realm=acme -s userId=$id -s groupId=$group -n
  fi
done
```

## Create the client

The tunnelers sign in through `openziti`, a public client with PKCE and the tunneler callback URL. It has two Keycloak
mappers. An **Audience** mapper adds `openziti` to the access token. A **Group Membership** mapper named `groups`, with
**Full group path** turned off, sends `engineering` instead of `/engineering`:

```bash
CID=$($K create clients -r acme -i \
  -s clientId=openziti -s publicClient=true -s standardFlowEnabled=true -s directAccessGrantsEnabled=false \
  -s 'redirectUris=["http://localhost:20314/auth/callback"]' \
  -s 'attributes={"pkce.code.challenge.method":"S256"}')

$K create clients/$CID/protocol-mappers/models -r acme \
  -s name=openziti-audience -s protocol=openid-connect -s protocolMapper=oidc-audience-mapper \
  -s 'config={"included.client.audience":"openziti","access.token.claim":"true","id.token.claim":"false"}'

$K create clients/$CID/protocol-mappers/models -r acme \
  -s name=groups -s protocol=openid-connect -s protocolMapper=oidc-group-membership-mapper \
  -s 'config={"claim.name":"groups","full.path":"false","access.token.claim":"true","id.token.claim":"true","userinfo.token.claim":"true"}'
```

## Done when

- The browser opens `https://idp.example.com:8443/realms/acme/.well-known/openid-configuration` with no certificate
  warning
- `alice` is in `engineering`
- `bob` is in `finance`
- `carol` is in no group
- The `openziti` client has the `openziti-audience` and `groups` mappers
