---
title: "zrok Permission Modes"
date: 2024-03-28T15:38:17Z
cuid: clubeftvl000208jtghim4481
slug: zrok-permission-modes
authors: [MichaelQuigley]
image: /blog/v1710955657342/eeab3265-3689-45b5-983b-83b06ee7fdb7.png
tags: 
  - security
  - networking
  - permissions
  - access-control
  - zrok

---

zrok is a powerful platform for sharing. The latest releases of zrok allow you to get granular about which other zrok accounts are allowed to privately access your shares.

In all current zrok versions, the `zrok share private` command will allocate an ephemeral share. The allocated share is accessible by any user on that zrok service instance (zrok.io, for example) as long as they know the share token. This model is now referred to as the "open permission mode". This will remain the default behavior for a while still (probably until the `v0.5` release of zrok).

As of `v0.4.26`, zrok provides a `--closed` option to the `zrok share` (and `zrok reserve`) commands, which by default restricts access to the share to only environments owned by the zrok account that created the share. We call this the "closed permission mode".

Along with `--closed`, the `zrok share` and `zrok reserve` commands include a `--access-grant` option, which allows you to specify which additional zrok accounts are allowed to access the share. For example:

```plaintext
# allocate a closed, private, ephemeral share
$ zrok share private --closed --backend-mode web /home/public_html

# allocate a closed, private, reserved share
$ zrok reserve --closed --backend-mode web --unique-name public \
    /home/public_html

# allocate a closed, private, ephemeral share granting access to 
# additional users

$ zrok share private --closed --access-grant user@somewhere.com \
    --access-grant anotheruser@somewhereelse.com --backend-mode web \
    /home/public_html
```

The closed permission mode allows you to control which users are allowed to access your shares using `zrok access private`. This applies to both public and private shares. When you create a public share, it is *also* a private share and can be accessed using `zrok access private`.

If you happen to create a share (ephemeral or reserved) and you need to either add or remove users to the grant list, you can use the new `zrok modify share` command:

```plaintext
# add additional users to a share
$ zrok modify share --add-access-grant user2@zrok.io \
    --add-access-grant user3@zrok.io \
    4qzdf22h67qn

# remove a user from a share
$ zrok modify share --remove-access-grant user@somewhere.com \
    4qzdf22h67qn
```

Keep in mind that for now, `--remove-access-grant` does not *terminate* any established `zrok access private` listeners, it just prevents the user from creating new listeners. This behavior will be updated in a future release.

If you'd like to see a video tour of these features, I did a [zrok Office Hours](https://www.youtube.com/playlist?list=PLMUj_5fklasLuM6XiCNqwAFBuZD1t2lO2) video on it a few weeks ago:

%[https://www.youtube.com/watch?v=xQ2uHxuaAb0&pp=ygUdenJvayBvZmZpY2UgaG91cnMgcGVybWlzc2lvbnM%3D] 

This is just a preview of the permission mode functionality to come. You might notice that there isn't currently a way to *list* the access grants on a share. We wanted to get the basic closed permission mode out in the wild as quickly as possible, and improving the user experience around share metadata (including the access grants) is a little bit of a bigger job. It's coming. We suspect that simply adding `--closed` to a `zrok share` or `zrok reserve` command is probably what most users are looking for.now

If you run into any issues or need assistance, feel free to reach out on the the [OpenZiti Discourse](https://openziti.discourse.group/c/zrok/24). There's a great community there to help you.

It always means a lot to the folks working on zrok when you're take a minute to drop a star on the [zrok's GitHub repository](https://github.com/openziti/zrok). It helps us to know that the work we're doing on zrok is important to you.
