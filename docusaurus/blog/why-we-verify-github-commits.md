---
title: "Why We Verify GitHub Commits"
date: 2024-05-24T16:00:14Z
cuid: clwkvbmet00000ak6d5z5btad
slug: why-we-verify-github-commits
authors: [KennethBingham]
image: "@site/blogs/openziti/v1716320888402/f7bcebeb-a9e6-4094-8e6c-fac73ce8a9c5.png"
tags: 
  - github
  - git
  - sdlc
  - gpg

---

Assigning the author on a commit is an essential feature of Git that allows you to send a commit on behalf of someone 
while preserving their authorship. I speculate this was the norm when the Linux Kernel authors, who also 
created Git, still received many contributions via email.

<!-- truncate -->

GitHub automatically links the commit to the attributed author's and committer's GitHub profile(s). By default, there's no visible indication that a commit was attributed.

## Attribution with Git

First, we can see that bob@example.com is the currently-configured author email.

```bash
$ git config --local user.name
Bob

$ git config --local user.email
bob@example.com
```

Next, Bob configures Git to impersonate a known email address.

```bash
git config --local user.name bot
git config --local user.email github-actions[bot]@users.noreply.github.com
```

Next, Bob makes the commit locally and inspects the metadata.

```bash
git commit -am "who sent this commit?"
git log -1 --format=fuller
```

```text
commit 114550a026fb4a106ad3911b2c585eda16d8dbfe (HEAD -> main, origin/main, origin/HEAD)
Author:     github-actions[bot] <github-actions[bot]@users.noreply.github.com>
AuthorDate: Tue May 21 09:52:06 2024 -0400
Commit:     github-actions[bot] <github-actions[bot]@users.noreply.github.com>
CommitDate: Tue May 21 09:52:06 2024 -0400

    who sent this commit?
```

In the above example, Bob specifies the committer and author metadata of the next commit to match a known email address before pushing it to GitHub, which displays the commit as if that bot had sent it.

![](/blogs/openziti/v1716492848880/f969b51e-be03-4a7a-923e-f3250601dc69.png)

Bob can also update the author and committer metadata on the last commit (`HEAD`, or any commit during a rebase) and push it to GitHub.

```bash
GIT_COMMITTER_NAME="github-actions[bot]"
GIT_COMMITTER_EMAIL="${GIT_COMMITTER_NAME}@users.noreply.github.com"
export GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL

git commit \
--amend \
--no-edit \
--no-gpg-sign \
--author "${GIT_COMMITTER_NAME} <${GIT_COMMITTER_EMAIL}>"
```

## How can I protect the sauce?

While you can't disable attribution in GitHub, there are some things you can do.

### Require Verified Commits

A verified commit is authenticated by GitHub. GitHub [lets you require verified commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification). Once enabled, GitHub will not accept unverified commits in the specified branches.

Commits can be marked "verified" in several ways:

1. The easiest way is to edit files in the GitHub UI. This allows GitHub to authenticate the commit with the browser session and sign the commit with [their web flow key](https://github.com/web-flow.gpg).
    
2. The most useful way is to sign commits locally with the `git` CLI and a GPG key. This allows GitHub and anyone to verify the signature on the commit.
    
    ```bash
    git verify-commit -v HEAD
    ```
    
    ```text
    tree 550accc6ea105ed9e407db481c99d45d3cb32cb1
    parent 408720459f8985dd01d4e36857d8e42f988539f9
    author Kenneth Bingham <kenneth.bingham@netfoundry.io> 1716477976 -0400
    committer Kenneth Bingham <kenneth.bingham@netfoundry.io> 1716477976 -0400
    
    document rolling back downstream
    gpg: Signature made Thu 23 May 2024 11:26:17 AM EDT
    gpg:                using RSA key 1EB5E833014594E4EDB0317331709281860130B6
    gpg:                issuer "kenneth.bingham@netfoundry.io"
    gpg: Good signature from "Kenneth Bingham <kenneth.bingham@netfoundry.io>"         
    [ultimate]
    Primary key fingerprint: F52F 87DD 444E 337F FA40  951A F3FC 641E F53D D900
         Subkey fingerprint: 1EB5 E833 0145 94E4 EDB0  3173 3170 9281 8601 30B6
    ```
    

### Enable Vigilant Mode

[Vigilant mode](https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits) changes the way your commits are presented on GitHub.com.

Without vigilant mode, unverified commits do not have any verification status badge, so there's no visual difference between those sent by the committer and those attributed to another author.

With vigilant mode, all of your commits have a badge ("verified," "unverified," or "partially verified"). This raises awareness about the significance of verified commits and serves as a visual warning that a commit was not authenticated by GitHub.

## What Doesn't this Prevent?

### Hasty Review

Requiring verified commits is not a substitute for a careful review of contributions. A malicious or otherwise unwanted commit can indeed be verified.

### A Compromised GitHub Account

Intruders can impersonate you and send verified malicious commits if your GitHub account is compromised.

### The Long Game

A patient actor can build credibility for their GitHub account and infiltrate a project. This may yield an opportunity to introduce verified malicious commits.

Reference: [The xz backdoor timeline](https://boehs.org/node/everything-i-know-about-the-xz-backdoor)
