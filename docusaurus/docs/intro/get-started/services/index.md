# Starting With Services

Once you have your zero trust overlay network in place and you want to start using it, you'll be wondering where to begin. You can start 
in a few different directions. Depending on your experience and what you're looking to do you'll have numerous directions to go in.

This page will hopefully give you some insight into some of the choices you can make.

## Zero Trust Host Access

The fastest way to start using your network is with "zero trust host access." Install an [OpenZiti tunneler](../../../how-to-guides/tunnelers/index.mdx) on your clients and servers and provide access to your services - no code changes required. This is how most deployments start and is a fully supported production model. Follow the [Your First Service](../../../intro/get-started/services/ztha.md) quickstart to get going.

## Zero Trust Application Access

For the strongest security posture, you can embed an OpenZiti SDK directly into your application. The application holds its own cryptographic identity and communicates over the overlay without trusting the host network. Explore the SDKs for your language on [the landing page](/).
