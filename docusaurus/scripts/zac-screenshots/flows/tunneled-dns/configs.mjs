// The lab's configs as ZAC form values. verify.sh checks that ZAC stored the same JSON the pages' CLI tabs create.
export const DNS = [
  { type: 'intercept.v1', name: 'dnslab-dns-intercept', shot: 'zac-dns-intercept',
    protocols: ['tcp', 'udp'], addresses: ['192.168.1.53'], ports: '53' },
  { type: 'host.v1', name: 'dnslab-dns-host', shot: 'zac-dns-host',
    forwardProtocol: ['tcp', 'udp'], address: '127.0.0.1', port: 53 },
];

export const WEB = [
  { type: 'intercept.v1', name: 'dnslab-web-intercept',
    protocols: ['tcp'], addresses: ['*.home.lan'], ports: '8443' },
  { type: 'host.v1', name: 'dnslab-web-host', shot: 'zac-web-host',
    protocol: 'tcp', forwardAddress: '*.home.lan', forwardPort: '8443' },
];
