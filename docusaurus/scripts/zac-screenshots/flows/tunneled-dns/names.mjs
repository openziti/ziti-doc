// The lab's real names (network aliases, see flow.ps1) and the docs' example names they show as in the shots.
const D = 'zititv.demo.openziti.org';

export default [
  [`tdns.${D}:9580`, 'ctrl.example.com:8441'],
  [`tdns-ctrl.${D}:9580`, 'ctrl.example.com:8441'],
  [`tdns.${D}`, 'ctrl.example.com'],
  [`tdns-ctrl.${D}`, 'ctrl.example.com'],
];
