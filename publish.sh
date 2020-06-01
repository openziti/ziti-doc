#!/bin/bash
set -e
./gendoc.sh docs

ziti-ci configure-git
git add docs docfx_project/ziti-*
git commit -m "[ci skip] publish docs from travis"
git push

