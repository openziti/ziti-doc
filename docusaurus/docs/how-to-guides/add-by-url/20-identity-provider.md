---
sidebar_label: 2. Identity provider (Keycloak)
---

# Step 2: Set up the identity provider

![Keycloak and its users highlighted: the acme realm, with groups the tokens carry.](/img/add-by-url/step-02-identity-provider.svg)

Users sign in to the IdP, and the controller creates their identities from its tokens. The tokens must carry an
audience the controller accepts and the user's groups. This step builds the IdP that sends them.

The lab runs Keycloak in Docker at `idp.example.com`, with the same Let's Encrypt certificate as the controller:

```text
docker run \
  --detach \
  --name kc-acme \
  --publish 8443:8443 \
  --volume /opt/ziti/le:/le:ro \
  --env KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  --env KC_BOOTSTRAP_ADMIN_PASSWORD=admin-demo-pw \
  --env KC_HTTPS_CERTIFICATE_FILE=/le/fullchain.pem \
  --env KC_HTTPS_CERTIFICATE_KEY_FILE=/le/privkey.pem \
  --env KC_HOSTNAME=https://idp.example.com:8443 \
  quay.io/keycloak/keycloak:26.0 \
  start-dev
```

`start-dev` is for the lab only. For production, see the
[Keycloak server guides](https://www.keycloak.org/guides#server).

## Create the realm, groups, and users

The lab realm is `acme`, with two groups and three users. `alice` is in `engineering`, `bob` is in `hr`, and
`carol` is in no group. `carol` will be used in step 8, where the administrator creates her identity by hand. Each
password is `<user>-demo-pw`.

The commands below use Keycloak's admin CLI, `kcadm.sh`, inside the container.

1. Define a shell function for `kcadm.sh` and sign in as the Keycloak admin:

   ```text
   kcadm() { docker exec kc-acme /opt/keycloak/bin/kcadm.sh "$@"; }

   kcadm config credentials \
     --server http://localhost:8080 \
     --realm master \
     --user admin \
     --password admin-demo-pw
   ```

2. Create the realm and the two groups. `-i` prints the new object's ID, which the group membership commands need:

   ```text
   kcadm create realms \
     -s realm=acme \
     -s enabled=true

   ENG=$(kcadm create groups -r acme -i -s name=engineering)
   HR=$(kcadm create groups -r acme -i -s name=hr)
   ```

3. Create `alice` and put her in `engineering`:

   ```text
   ALICE=$(kcadm create users -r acme -i \
     -s username=alice \
     -s enabled=true \
     -s email=alice@acme.example \
     -s emailVerified=true \
     -s firstName=Alice \
     -s lastName=Acme)

   kcadm set-password -r acme \
     --username alice \
     --new-password alice-demo-pw

   kcadm update users/$ALICE/groups/$ENG -r acme -n \
     -s realm=acme \
     -s userId=$ALICE \
     -s groupId=$ENG
   ```

4. Create `bob` and put him in `hr`:

   ```text
   BOB=$(kcadm create users -r acme -i \
     -s username=bob \
     -s enabled=true \
     -s email=bob@acme.example \
     -s emailVerified=true \
     -s firstName=Bob \
     -s lastName=Acme)

   kcadm set-password -r acme \
     --username bob \
     --new-password bob-demo-pw

   kcadm update users/$BOB/groups/$HR -r acme -n \
     -s realm=acme \
     -s userId=$BOB \
     -s groupId=$HR
   ```

5. Create `carol` with no group:

   ```text
   kcadm create users -r acme \
     -s username=carol \
     -s enabled=true \
     -s email=carol@acme.example \
     -s emailVerified=true \
     -s firstName=Carol \
     -s lastName=Acme

   kcadm set-password -r acme \
     --username carol \
     --new-password carol-demo-pw
   ```

## Create the client

The tunnelers sign in through `openziti`, a public client with PKCE and the tunneler callback URL. The client has two
mappers that put the audience and the user's groups in the token.

1. Create the `openziti` client:

   ```text
   CID=$(kcadm create clients -r acme -i \
     -s clientId=openziti \
     -s publicClient=true \
     -s standardFlowEnabled=true \
     -s directAccessGrantsEnabled=false \
     -s 'redirectUris=["http://localhost:20314/auth/callback"]' \
     -s 'attributes={"pkce.code.challenge.method":"S256"}')
   ```

2. Add an **Audience** mapper that adds `openziti` to the access token:

   ```text
   kcadm create clients/$CID/protocol-mappers/models -r acme \
     -s name=openziti-audience \
     -s protocol=openid-connect \
     -s protocolMapper=oidc-audience-mapper \
     -s 'config."included.client.audience"=openziti' \
     -s 'config."access.token.claim"=true' \
     -s 'config."id.token.claim"=false'
   ```

3. Add a **Group Membership** mapper named `groups`, with **Full group path** turned off, so the token carries
   `engineering` instead of `/engineering`:

   ```text
   kcadm create clients/$CID/protocol-mappers/models -r acme \
     -s name=groups \
     -s protocol=openid-connect \
     -s protocolMapper=oidc-group-membership-mapper \
     -s 'config."claim.name"=groups' \
     -s 'config."full.path"=false' \
     -s 'config."access.token.claim"=true' \
     -s 'config."id.token.claim"=true' \
     -s 'config."userinfo.token.claim"=true'
   ```

## Done when

- The browser opens `https://idp.example.com:8443/realms/acme/.well-known/openid-configuration` with no certificate
  warning
- `alice` is in `engineering`
- `bob` is in `hr`
- `carol` is in no group
- The `openziti` client has the `openziti-audience` and `groups` mappers
