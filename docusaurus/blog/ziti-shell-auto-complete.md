---
title: "Ziti Shell Auto-Complete"
seoTitle: "openziti command shell auto-complete"
seoDescription: "How to set up auto-complete for the ziti command"
date: 2023-02-22T15:47:45Z
cuid: clefun9ff000009jj6du9fwil
slug: auto-complete
authors: [KennethBingham]
image: /blogs/openziti/v1677080778065/71fdf983-8355-486e-bb8a-fb57861ea45a.png
ogimage: /blogs/openziti/v1677080756391/8f849497-c588-4a59-bf63-108bd522d8f0.png
tags: 
  - bash
  - zsh
  - autocomplete

---

This one's for the shell ninjas. The `ziti` CLI comes with auto-complete! You can use completions in any shell supported by [Cobra](https://cobra.dev/#generating-bash-completions). This post will distill the Cobra instructions with correct examples for `ziti` in BASH and ZSH.

## Install `ziti`

First, make sure you have the `ziti` CLI. You can [download the latest executable for your OS from GitHub](https://github.com/openziti/ziti/releases/latest).

## BASH

### Enable Completions in BASH

You must install `bash-completion` to enable completions for BASH. This is a standard package name for Homebrew, Apt, and Yum/DNF.

### Install `ziti` Completions for BASH

BASH completions are loaded directly into the shell's environment with the `source` command like this:

```bash
source <(ziti completion bash)
```

That's it! You're done setting up completion in your currently-running BASH shell. Now you can type `ziti` (followed by a space) and hit the TAB key to auto-complete subcommands and options.

To install this configuration permanently, add the same `source` command to your BASH configuration file, e.g., `~/.bashrc`.

### BASH `ziti` Alias

What if you want to save some typing and say `z`, instead of `ziti`, to run a command? Unfortunately, this breaks BASH completion, but it's easily fixed. You must add a completion alias to your BASH config file like this:

```bash
alias z=ziti
complete -o default -F __start_ziti z
```

## ZSH

### Enable Completions in ZSH

You must load `compinit` to enable completion in ZSH. You can run this command to test and then add the same command to your ZSH config, e.g., `~/.zshrc`to auto-configure future shells.

```bash
autoload -U compinit
compinit
```

### Install `ziti` Completions for ZSH

ZSH completions work with the `$fpath` environment variable and you must generate the completion script and install it with the correct filename in any one of the directories listed in your `$fpath`.

```bash
# assuming ~/.zsh/completion/ is in $fpath
ziti completion zsh > ~/.zsh/completion/_ziti
```

### ZSH `ziti` Alias

Good news! Shell aliases work automatically with ZSH completions.

```bash
alias z=ziti
# now you can say "z" (space) and tab auto-complete "ziti" commands!
```

## Which shell am I running?

If you didn't change your shell on purpose, you're probably running ZSH on macOS and BASH on Linux (including Windows Subsystem for Linux \[WSL\]). You can try these two commands to see if the `ps` command can tell you which shell you're using.

```bash
$ ps -p$$ -ocommand=
/usr/bin/zsh

# try this variant if the first one gave you an error
$ ps -p$$ -ocmd=
/usr/bin/zsh
```

With the command `chsh`, you may change your default shell for all future terminal sessions in macOS or Linux.

```bash
# use zsh for future shells 
chsh -s /usr/bin/zsh
```
