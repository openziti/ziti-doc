# Starting With Services

Once you have your zero trust overlay network in place and you want to start using it, you'll be wondering where to begin. You can start 
in a few different directions. Depending on your experience and what you're looking to do you'll have numerous directions to go in.

This page will hopefully give you some insight into some of the choices you can make.

## Zero Trust Application Access

OpenZiti is really about embedding zero trust directly into your applications. If you are a developer, you might want to start with 
your favorite language and start your OpenZiti journey with "zero trust application access". This means you'll take an SDK and embed it 
into an application you write! It's probably best to explore the best SDK for your language and find samples for that SDK to use. 
[The landing page](/) has links to all the SDKs to choose from.  

## Zero Trust Host Access

If you're not a developer, or if you have an application which you can't (or don't want to) change you can start with "zero trust host 
access". For this, you will install an [OpenZiti tunneler](/reference/tunnelers/index.mdx) on your "clients" and on your "servers" and 
provide access to your services using these executables. If this sounds like a good place to start, follow the
[Your First Service](/learn/quickstarts/services/ztha.md) quickstart.
