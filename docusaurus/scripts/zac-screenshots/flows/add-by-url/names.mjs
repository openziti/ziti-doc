// The lab's real names (network aliases, see flow.ps1) and the docs' example names they show as in the shots.
export const D = 'zititv.demo.openziti.org';
export const IDP = `https://addbyurl-idp.${D}:9780/realms/acme`;

export default [
  [`addbyurl-idp.${D}:9780`, 'idp.example.com:8443'],
  [`addbyurl.${D}:9580`, 'ctrl.example.com:1280'],
  [`addbyurl-ctrl.${D}:9580`, 'ctrl-pki.example.com:1280'],
  [`addbyurl-idp.${D}`, 'idp.example.com'],
  [`addbyurl-ctrl.${D}`, 'ctrl-pki.example.com'],
  [`addbyurl.${D}`, 'ctrl.example.com'],
];
