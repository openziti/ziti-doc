---
title: "The zrok OAuth Public Frontend"
date: 2023-10-20T13:42:46Z
cuid: clnynuz3f000909l01il80lcy
slug: the-zrok-oauth-public-frontend
authors: [MichaelQuigley]
image: /blog/v1697044959110/120ae30d-9a5b-470f-b7ca-7689135f300a.png
tags: 
  - proxy
  - security
  - oauth
  - developer
  - networking

---

With the `v0.4.7` release we now support authenticating users of your public `zrok` shares using either Google or GitHub. This new authentication capability is in addition to the basic HTTP authentication functionality that was available in previous releases.

Here's an overview of where this new capability fits into the `zrok` architecture:

![](/blog/v1697129004226/c7204767-10dd-4d17-854f-3a25bea604b4.png)

The golden-colored boxes represent the *frontend* components where these new capabilities are implemented. This new authentication feature is primarily focused on authenticating anonymous users from the internet, requiring that they authenticate with Google or GitHub and potentially limiting allowed users to specific email address domains.

Future releases will incorporate other identity providers and potentially the ability to extend `zrok` to incorporate non-stock identity providers. These authentication features will grow to provide richer facilities for controlling which users are allowed to access your public resources.

OAuth authentication for private shares will be addressed through another mechanism, in an upcoming release.

## Using OAuth with Public Shares

The `zrok share public` command now includes new flags, which allow you to specify that the share should require OAuth authentication:

```plaintext
$ zrok share public
Error: accepts 1 arg(s), received 0
Usage:
  zrok share public <target> [flags]

Flags:
  -b, --backend-mode string               The backend mode {proxy, web, caddy} (default "proxy")
      --basic-auth stringArray            Basic authentication users (<username:password>,...)
      --frontends stringArray             Selected frontends to use for the share (default [public])
      --headless                          Disable TUI and run headless
  -h, --help                              help for public
      --insecure                          Enable insecure TLS certificate validation for <target>
      --oauth-check-interval duration     Maximum lifetime for OAuth authentication; reauthenticate after expiry (default 3h0m0s)
      --oauth-email-domains stringArray   Allow only these email domains to authenticate via OAuth
      --oauth-provider string             Enable OAuth provider [google, github]

Global Flags:
  -p, --panic     Panic instead of showing pretty errors
  -v, --verbose   Enable verbose logging
```

The `--oauth-provider` flag enables OAuth for the share using the specified provider. In version `v0.4.7` we currently support `google` and `github` for authentication. Future releases will incorporate additional providers and capabilities.

The `--oauth-email-domains` flag accepts a comma-separated list of authenticated email address domains that are allowed to access the share.

The `--oauth-check-interval` flag specifies how frequently the authentication must be checked and potentially re-authenticated.

Given this, the following command will create a public share using the `web` backend mode, and require that the user authenticate with a GitHub account that has an email address within the `zrok.io` domain:

```plaintext
$ zrok share public --backend-mode web --oauth-provider github --oauth-email-domains zrok.io ~/public
```

Requiring OAuth authentication for a public `zrok` share can be as simple as adding `--oauth-provider` to your `zrok share public` command line.

## Self-hosting the OAuth Frontend

There is a [complete guide to setting up the OAuth frontend](https://docs.zrok.io/docs/guides/self-hosting/oauth/configuring-oauth/) available in the self-hosting section of the [documentation](https://docs.zrok.io/).

The most recent `zrok` Office Hours video includes a full tour through setting up the OAuth public frontend in a local development environment. This should also provide the details needed to set this up in a self-hosted environment.

%[https://www.youtube.com/watch?v=mVQEizam4Uc] 

As always, reach out to us through the Discourse forum or GitHub!

And we always appreciate a star on the [zrok Repository](https://github.com/openziti/zrok)!
