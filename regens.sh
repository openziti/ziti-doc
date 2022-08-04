#!/usr/bin/env bash
#
# regenerate docs in ./docs-local and run development server on localhost:8080
#

set -e -u -o pipefail

# gendoc.sh will fail unless /ziti-doc is marked safe because it's owned by a
# different EUID when running in a container and the Git working copy is not clean
#git config --global --add safe.directory /ziti-doc

# docfx must bind all interfaces inside the container or the Docker host will
# get "connection reset" when trying to connect to the development server
./gendoc.sh -wglc && docfx serve --hostname='*' --port=8080 docs-local/