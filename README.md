# Building this Project

## Prerequisite

* [docfx](https://dotnet.github.io/docfx/) needs to be on your path
* Windows - Tested to build in windows at this time - mac/linux to come in the future

## Building the Doc

Right now docfx and github aren't 100% in alignment. Github offers [github pages](https://pages.github.com/)
which this project uses. Github has a few options for where you can put your doc - specifically /docs is used.

The best/easiest thing to do in order to build these docs is to clone the repository and then rm the docs
folder and replace it with a link.  Here are the steps to make that happen.

* start a plain 'cmd' or powershell shell. Do _NOT_ use a "Developer Command Prompt for VS 201x". There is
a bug in docfx as of Oct 11 that will cause docfx to fail.
* clone the repo: `git clone git@github.com:nf-dev/ziti-doc.git`
* clone all necessary referenced repositories and ensure they are at the same level as ziti-doc. For example this
  project refers to the clang and csharp sdk.  In order for the doc to build correctly the folder that contains this
  checkout needs both `ziti-sdk-c` and `ziti-sdk-csharp` at the same level such as: `ls -1 %GITHUB_ROOT%` would produce something
  like:

```ls -1 %GITHUB_ROOT% | sort
NetFoundry.github.io
nf-dev.github.io
ziti-cmd
ziti-doc
ziti-doc-pre-move
ziti-edge
ziti-sdk-c
ziti-sdk-csharp
ziti-sdk-jvm
```

* regenerate the docfx site: `docfx %GITHUB_ROOT%\ziti-doc\docfx_project\docfx.json`
