#!/bin/bash
set -e
./gendoc.sh docs

ziti-ci configure-git
git add docs
git commit -m "[ci skip] publish docs from travis"
git push

