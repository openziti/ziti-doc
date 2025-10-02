---
title: "zrok with the Power of Caddy"
date: 2023-09-08T15:24:23Z
cuid: clmaqzvmg000808l2b8ij7yw8
slug: zrok-with-the-power-of-caddy
authors: [MichaelQuigley]
image: "@site/blogs/openziti/v1694020472308/0ab25cb6-f4ef-4227-b487-5bc6a0b5c621.png"
tags: 
  - security
  - networking
  - peer-to-peer
  - openziti
  - zrok

---

It's that time again... we've just dropped a new `zrok` release! This time the marquee features are based on 
Caddy (https://caddyserver.com/). Caddy is a powerful Swiss Army Knife for serving and proxying HTTP resources, 
and we've integrated that power into the `zrok` ecosystem.

<!-- truncate -->

# The Open-ended Caddyfile

`zrok` provides a new `caddy` backend mode, which allows you to utilize the full capabilities of Caddy in the `zrok` environment. This power is exposed through a Caddy feature called a `Caddyfile`. A `Caddyfile` is an expressive, powerful mechanism for configuring the different features available in Caddy.

Let's look at an example of a `Caddyfile`:

```apache
http:// {
	bind {{ .ZrokBindAddress }}
	reverse_proxy 127.0.0.1:3000
}
```

This example `Caddyfile` provides a simple reverse proxy implementation that works very much like the `proxy` backend mode. `zrok` will automatically rewrite the `{{ .ZrokBindAddress }}` token in the `bind` statement with the correct address for your share. This happens automatically when `zrok` loads the `Caddyfile` you specify as the target for the `caddy` backend mode.

This example `Caddyfile` is located at `etc/caddy/simple_reverse_proxy.Caddyfile` in the `zrok` repository on GitHub ([https://github.com/openziti/zrok](https://github.com/openziti/zrok)). We can run this example from an enabled `zrok` environment like this:

```plaintext

$ zrok share public --backend-mode caddy etc/caddy/simple_reverse_proxy.Caddyfile 
[   0.069]    INFO main.(*sharePublicCommand).run: access your zrok share at the following endpoints:
 https://3s9fddkilbi6.share.zrok.io
2023/09/06 18:12:43.582	INFO	admin	admin endpoint started	{"address": "localhost:2019", "enforce_origin": false, "origins": ["//localhost:2019", "//[::1]:2019", "//127.0.0.1:2019"]}
2023/09/06 18:12:43.583	WARN	http.auto_https	server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server	{"server_name": "srv0", "http_port": 80}
2023/09/06 18:12:43.583	INFO	tls.cache.maintenance	started background certificate maintenance	{"cache": "0xc000166c00"}
2023/09/06 18:12:43.584	INFO	tls	cleaning storage unit	{"description": "FileStorage:/home/michael/.local/share/caddy"}
2023/09/06 18:12:43.584	INFO	tls	finished cleaning storage units
2023/09/06 18:12:43.636	INFO	http.log	server running	{"name": "srv0", "protocols": ["h1", "h2", "h3"]}
2023/09/06 18:12:43.636	INFO	autosaved config (load with --resume flag)	{"file": "/home/michael/.config/caddy/autosave.json"}
[   0.127]    INFO sdk-golang/ziti.(*listenerManager).createSessionWithBackoff: {session token=[2a9ca2d1-21c2-4516-8b03-ffdd789283e6]} new service session
```

Notice that we've used `--backend-mode caddy` and the target of our share is the path to our `Caddyfile`.

`zrok` logs the ephemeral share URL: `https://3s9fddkilbi6.share.zrok.io`

If we access the URL with `curl`, we get the following result:

```bash
$ curl https://3s9fddkilbi6.share.zrok.io
Invalid Host header
```

In my environment, the "upstream" target specified in the `Caddyfile` is `127.0.0.1:3000`, which corresponds to my local `npm` development server. Evidently this `npm` development server does not like to have a reverse proxy in front of it. If we rewrite the `Host` header hiding the fact that it's being proxied, we might get a different result.

Caddy supports a `header_up` directive nested within the `reverse_proxy` statement, which allows for "upstream" (traffic on its way to the proxied "backend") header rewriting. Let's try setting the `Host` header to make it look like the server is being accessed from `localhost:3000`:

```apache
http:// {
	bind {{ .ZrokBindAddress }}
	reverse_proxy 127.0.0.1:3000 {
	    header_up Host localhost:3000
	}
}
```

If we restart our share and `curl` the new URL, we get:

```plaintext
$ curl http://e52lx23k7qgq.share.zrok.io
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="zrok ui"/>
...
```

This works! Now the `npm` development server thinks it's being accessed from `localhost:3000`.

Header rewriting is the first Caddy capability we've added that goes beyond the built-in `--backend-mode proxy` in `zrok`. But there are tons and tons of other things we can do with the `caddy` backend mode.

Let's look at a more complex example...

## Multiple Upstream Backends

There are many reasons why you might want to utilize multiple upstream backends with a `zrok` share. You might want:

* to distribute load across multiple backends, horizontally scaling the workload between multiple systems
    
* to aggregate multiple microservice backends into a single combined API
    
* to enforce additional security or performance constraints on the shared resources
    
* to provide fault tolerance, allowing one or more backends to fail before the shared service becomes unavailable
    

Let's take a look at a simple example using the `caddy` backend mode to route traffic to two different backends:

```apache
http:// {
    # Bind to the zrok share
	bind {{ .ZrokBindAddress }}

    # Handle paths starting with `/zrok/*`
    # This will also strip the `/zrok/` from the path before sending to the backend
	handle_path /zrok/* {
	    reverse_proxy https://zrok.io {
	        header_up Host zrok.io
	    }
	}

	# All other traffic goes to localhost:3000
	reverse_proxy /* 127.0.0.1:3000 {
		header_up Host localhost:3000
	}
}
```

Just like the first example, we bind our configuration to `{{ .ZrokBindAddress }}`. But in this case, we've added a second `reverse_proxy` statement. The new `reverse_proxy` statement is wrapped in a `handle_path` block. Wrapping the `reverse_proxy` statement with the `handle_path` causes Caddy to strip the `/zrok` path prefix before sending the request upstream to the backend. And like before, we're replacing the `Host` header to direct the traffic to the correct website instance (`zrok.io`).

We've qualified the existing `reverse_proxy` statement with `/*` to direct all other traffic to the backend at `localhost:3000`.

Let's see what happens when we send some traffic to this new Caddyfile. We'll share it using `zrok share`:

```plaintext
$ zrok share public --backend-mode caddy etc/caddy/multiple_upstream.Caddyfile 
[   0.296] WARNING zrok/endpoints/proxy.NewCaddyfileBackend: etc/caddy/multiple_upstream.Caddyfile [4] (): Caddyfile input is not formatted; run 'caddy fmt --overwrite' to fix inconsistencies
[   0.296]    INFO main.(*sharePublicCommand).run: access your zrok share at the following endpoints:
 https://u7cncngzhohb.share.zrok.io
2023/09/07 18:10:20.324	INFO	admin	admin endpoint started	{"address": "localhost:2019", "enforce_origin": false, "origins": ["//localhost:2019", "//[::1]:2019", "//127.0.0.1:2019"]}
2023/09/07 18:10:20.324	WARN	http.auto_https	server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server	{"server_name": "srv0", "http_port": 80}
2023/09/07 18:10:20.325	INFO	tls.cache.maintenance	started background certificate maintenance	{"cache": "0xc0005ff880"}
2023/09/07 18:10:20.325	INFO	tls	cleaning storage unit	{"description": "FileStorage:/home/michael/.local/share/caddy"}
2023/09/07 18:10:20.325	INFO	tls	finished cleaning storage units
2023/09/07 18:10:20.549	INFO	http.log	server running	{"name": "srv0", "protocols": ["h1", "h2", "h3"]}
2023/09/07 18:10:20.550	INFO	autosaved config (load with --resume flag)	{"file": "/home/michael/.config/caddy/autosave.json"}
[   0.549]    INFO sdk-golang/ziti.(*listenerManager).createSessionWithBackoff: {session token=[c16288b6-401e-4e0c-bacf-1661c5badd59]} new service session
```

If we curl our new share URL, `https://u7cncngzhohb.share.zrok.io`, we get this:

```plaintext
$ curl https://u7cncngzhohb.share.zrok.io
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="zrok ui"/>
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
...
```

And we can see that this is a response from our development `npm` server running on `localhost:3000`.

If we access a path starting with `/zrok`, we get this:

```plaintext
$ curl https://u7cncngzhohb.share.zrok.io/zrok/
<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta id="siteViewport" name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' />

	<!-- This site is optimized with the Yoast SEO plugin v20.12 - https://yoast.com/wordpress/plugins/seo/ -->
	<title>Home - zrok</title>
...
```

This is the HTML from the `zrok.io` website.

Be sure to check out the Caddy [reference documentation](https://caddyserver.com/docs/caddyfile) for even more possibilities for the `caddy` backend mode!

# Improved Web and File Sharing

`zrok` provides a `web` backend mode for sharing files. In this mode, `zrok` behaves as if it is a traditional web server hosting static content on a filesystem. You can use this mode to share arbitrary files like documents, or code, or binaries. When sharing a tree of files like this, `zrok` provides a handy user interface to navigate the tree and download files.

Alternatively, if the tree of files contains `index.html` in any of the folders, the built-in file browser is suppressed, and the `index.html` is returned instead. This mimics the behavior of a traditional web server like Apache or nginx. This means you can use `--backend-mode web` to serve arbitrary directories containing files, and you can also use it to host static websites.

`I`n the new `v0.4.6` release of `zrok`, the `--backend-mode web` sharing mode has been improved to utilize Caddy for this function.

Here's what it looks like:

![](/blogs/openziti/v1694111195934/b31243c9-c793-4873-9319-506aec9e312b.gif)

Caddy gives `zrok` a much nicer-looking file server experience. Built-in searching. Better MIME types. All together this makes for a much smoother and nicer experience.

There's a longer format "office hours" video dedicated to this new integration with Caddy. Check it out for a more leisurely stroll through these features, along with a little `zrok` debugging:

%[https://youtu.be/zgP9wLSESl4]

# Conclusion

Bringing Caddy into `zrok` is a powerful new capability enabling lots of new sharing features. The new `web` backend mode implementation is just the first of many user experience and quality-of-life improvements we have planned for `zrok` users.

Before we're done with the Caddy integration, we plan on enhancing the `zrok access` functionality to allow you to use the powerful HTTPS certificate management and request routing capabilities on the frontend side of `zrok`. Imagine aggregating multiple `zrok` shares into a single `zrok access` command with fault-tolerance and failover capabilities!

And stay tuned for the new "`zrok` Drives" features. We're pretty excited about the doors that are going to open when it's released!
