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
* `cd ziti-doc`
* remove the docs folder: `rmdir /s /q docs`
* put the docs folder back as a symlink: `mklink /j docs docfx_project\_site`
* add links in aggregatedSources to the sdks (change ZITI_ROOT) accordingly:
```
   set ZITI_ROOT=c:\git\github
   cd aggregatedSources
   mklink /j clang %ZITI_ROOT%\ziti-sdk-c\library
   mklink /j clang_example %ZITI_ROOT%\ziti-sdk-c\programs\sample_wttr
   mklink /j csharp %ZITI_ROOT%\ziti-sdk-csharp\Ziti.NET.Standard
   mklink /j csharp_example %ZITI_ROOT%\ziti-sdk-csharp\Ziti.Core.Console
```
* regenerate the docfx site: `docfx docfx_project\docfx.json`
