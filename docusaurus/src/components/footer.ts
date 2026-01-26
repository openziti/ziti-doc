// Footer configuration for openziti - uses plain objects for docusaurus.config.ts compatibility
export const openZitiFooter = {
    description:
        'An open source project enabling developers to embed zero trust networking directly into applications.',
    socialProps: {
        githubUrl: 'https://github.com/openziti/ziti',
        youtubeUrl: 'https://youtube.com/openziti/',
        linkedInUrl: 'https://www.linkedin.com/company/netfoundry/',
        twitterUrl: 'https://twitter.com/openziti/',
    },
    documentationLinks: [
        { href: '/docs/openziti/learn/introduction/', label: 'Getting Started' },
        { href: '/docs/openziti/reference/developer/api/', label: 'API Reference' },
    ],
    communityLinks: [
        { href: 'https://github.com/openziti/ziti', label: 'GitHub' },
        { href: 'https://openziti.discourse.group/', label: 'Discourse Forum' },
        { href: '/docs/openziti/policies/CONTRIBUTING', label: 'Contributing' },
    ],
    resourceLinks: [
        { href: 'https://blog.openziti.io', label: 'OpenZiti Tech Blog' },
        { href: 'https://netfoundry.io/', label: 'NetFoundry' },
    ],
};
