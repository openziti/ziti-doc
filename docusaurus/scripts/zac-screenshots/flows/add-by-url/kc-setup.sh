#!/usr/bin/env bash
# Runs inside the Keycloak container: step 2's realm, users, groups and client, as in 20-identity-provider.md.
set -euo pipefail
KC_PWD=admin-demo-pw
kcadm() { /opt/keycloak/bin/kcadm.sh "$@"; }
kcadm config credentials --server http://localhost:8080 --realm master --user admin --password $KC_PWD
kcadm create realms -s realm=acme -s enabled=true
ENG=$(kcadm create groups -r acme -i -s name=engineering)
HR=$(kcadm create groups -r acme -i -s name=hr)
for u in alice:$ENG bob:$HR carol:; do
  name=${u%%:*}; group=${u#*:}
  id=$(kcadm create users -r acme -i -s username="$name" -s enabled=true -s email="$name@acme.example" \
    -s emailVerified=true -s firstName="${name^}" -s lastName=Acme)
  kcadm set-password -r acme --username "$name" --new-password "$name-demo-pw"
  [[ -n $group ]] && kcadm update "users/$id/groups/$group" -r acme -n -s realm=acme -s userId="$id" -s groupId="$group"
done
CID=$(kcadm create clients -r acme -i -s clientId=openziti -s publicClient=true -s standardFlowEnabled=true \
  -s directAccessGrantsEnabled=false -s 'redirectUris=["http://localhost:20314/auth/callback"]' \
  -s 'attributes={"pkce.code.challenge.method":"S256"}')
kcadm create "clients/$CID/protocol-mappers/models" -r acme -s name=openziti-audience -s protocol=openid-connect \
  -s protocolMapper=oidc-audience-mapper -s 'config."included.client.audience"=openziti' \
  -s 'config."access.token.claim"=true' -s 'config."id.token.claim"=false'
kcadm create "clients/$CID/protocol-mappers/models" -r acme -s name=groups -s protocol=openid-connect \
  -s protocolMapper=oidc-group-membership-mapper -s 'config."claim.name"=groups' -s 'config."full.path"=false' \
  -s 'config."access.token.claim"=true' -s 'config."id.token.claim"=true' -s 'config."userinfo.token.claim"=true'
echo "keycloak: realm acme ready"
