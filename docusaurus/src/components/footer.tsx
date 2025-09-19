import {defaultNetFoundryFooterProps, defaultSocialProps} from "@openclint/docusaurus-shared/ui";
import React from "react";

export const openZitiFooter = {
    ...defaultNetFoundryFooterProps(),
    description:
        'An open source project enabling developers to embed zero trust networking directly into applications.',
    socialProps: {
        ...defaultSocialProps,
        githubUrl: 'https://github.com/openziti/ziti',
        youtubeUrl: 'https://youtube.com/openziti/',
        linkedInUrl: 'https://www.linkedin.com/in/netfoundry/',
        twitterUrl: 'https://twitter.com/openziti/',
    },
    documentationLinks: [
        <a href="/docs/openziti/learn/quickstarts/services/ztha">Getting Started</a>,
        <a href="/docs/openziti/reference/developer/api/">API Reference</a>,
        <a href="/docs/openziti/reference/developer/sdk/">SDK Integration</a>,
    ],
    communityLinks: [
        <a href="https://github.com/openziti/ziti">GitHub</a>,
        <a href="https://openziti.discourse.group/">Discourse Forum</a>,
        <a href="/policies/CONTRIBUTING">Contributing</a>,
    ],
    resourceLinks: [
        <a href="https://blog.openziti.io">OpenZiti Tech Blog</a>,
        <a href="https://netfoundry.io/">NetFoundry</a>,
    ],
}