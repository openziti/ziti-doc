#!/usr/bin/env bash
# Checks what steps 2-5 and 9 promise, for the objects made by the CLI tabs (verify.sh cli) or by ZAC (verify.sh zac):
# the Pi-hole identity may bind both services and has a terminator on each, and every client may dial both.
# After the CLI run it saves the configs; after the ZAC run it fails unless ZAC stored the same config data.
set -euo pipefail
by=${1:?usage: verify.sh cli|zac}
fail() { echo "verify $by: $*" >&2; exit 1; }

configs() {
  ziti edge list configs 'name contains "dnslab-"' -j | jq -S '[.data[] | {name, data}] | sort_by(.name)'
}
if [[ $by == cli ]]; then
  configs >/work/cli-configs.json
else
  configs >/work/zac-configs.json
  # every field the CLI sets, ZAC sets the same; extra fields ZAC adds are printed for review
  jq -n --slurpfile c /work/cli-configs.json --slurpfile z /work/zac-configs.json '
    [range(0; $c[0] | length) as $i | $c[0][$i] as $a | $z[0][$i] as $b
     | {name: $a.name, same: ($a.name == $b.name and ($a.data | to_entries | all(. as $e | $b.data[$e.key] == $e.value))),
        extra: ($b.data | with_entries(select(.key as $k | $a.data | has($k) | not))) }]' | tee /work/compare.json
  jq -e 'length == 4 and all(.same)' /work/compare.json >/dev/null || fail "ZAC's configs differ from the CLI's"
fi

for s in dnslab-dns dnslab-web; do
  ziti edge policy-advisor services -q "$s" dnslab-pihole | tee /dev/stderr | grep -q 'OKAY.*Bind' \
    || fail "dnslab-pihole may not bind $s"
  for c in win linux android; do
    ziti edge policy-advisor services -q "$s" "dnslab-client-$c" | grep -q 'OKAY.*Dial' \
      || fail "dnslab-client-$c may not dial $s"
  done
  for _ in $(seq 1 30); do
    [[ $(ziti edge list terminators "service.name=\"$s\"" -j | jq '.data | length') -ge 1 ]] && continue 2
    sleep 1
  done
  fail "no terminator for $s"
done
echo "verify $by: dnslab-pihole binds and hosts both services; all three clients may dial both"
