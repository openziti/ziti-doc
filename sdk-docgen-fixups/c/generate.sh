#!/bin/bash -eu
#
# Generates the Ziti C SDK's API reference as Docusaurus-ready Markdown.
#
# Pipeline: Doxygen (XML) -> doxybook2 (Markdown, using the fixups in
# this folder) -> docusaurus/docs/reference/developer/sdk/clang.
#
# The C SDK source is read from a disposable clone under
# docusaurus/docs/_remotes/ziti-sdk-c (same convention gendoc.sh uses for
# every other imported repo). That clone is never modified: XML generation
# is turned on by piping an override into `doxygen -` on stdin rather than
# editing the checked-out Doxyfile.
#
# Requires `doxygen` and `doxybook2` on the PATH. Set DOXYBOOK2 to override
# the doxybook2 binary path.

script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
repo_root="$( cd "${script_root}/../.." >/dev/null 2>&1 && pwd )"
DOXYBOOK2="${DOXYBOOK2:-doxybook2}"

SDK_REMOTE="https://github.com/openziti/ziti-sdk-c"
SDK_BRANCH="${SDK_BRANCH:-main}"
SDK_CLONE_DIR="${repo_root}/docusaurus/docs/_remotes/ziti-sdk-c"
OUTPUT_DIR="${repo_root}/docusaurus/docs/reference/developer/sdk/clang"

echo "- syncing ziti-sdk-c (read-only) into ${SDK_CLONE_DIR}"
mkdir -p "$(dirname "${SDK_CLONE_DIR}")"
if [ -d "${SDK_CLONE_DIR}" ]; then
  pushd "${SDK_CLONE_DIR}" >/dev/null
  git checkout "${SDK_BRANCH}"
  git pull --ff-only
  popd >/dev/null
else
  git clone "${SDK_REMOTE}" --branch "${SDK_BRANCH}" --single-branch "${SDK_CLONE_DIR}" --no-tags --depth 1
fi

echo "- generating Doxygen XML (without modifying the SDK's Doxyfile)"
pushd "${SDK_CLONE_DIR}" >/dev/null
(cat Doxyfile; echo "GENERATE_XML = YES"; echo "XML_OUTPUT = xml") | doxygen -
popd >/dev/null

echo "- converting XML to Markdown with doxybook2"
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"
"${DOXYBOOK2}" \
  -i "${SDK_CLONE_DIR}/xml" \
  -o "${OUTPUT_DIR}" \
  -c "${script_root}/doxybook2.json" \
  -t "${script_root}/templates"

echo "- patching stray README links to sibling repo files that aren't part of the generated set (BUILD.md, vcpkg.json)"
for f in "${OUTPUT_DIR}/README_8md.md" "${OUTPUT_DIR}/index.md"; do
  if [ -f "${f}" ]; then
    sed -i "s|(BUILD.md)|(${SDK_REMOTE}/blob/${SDK_BRANCH}/BUILD.md)|g" "${f}"
    sed -i "s|(vcpkg.json)|(${SDK_REMOTE}/blob/${SDK_BRANCH}/vcpkg.json)|g" "${f}"
  fi
done

echo "- stripping empty cross-reference links doxybook2 couldn't resolve, e.g. [name]()"
find "${OUTPUT_DIR}" -maxdepth 1 -name '*.md' -print0 \
  | xargs -0 sed -i -E 's/\[([^]]*)\]\(\)/\1/g'

echo "- fixing doxybook2 mis-prefixing absolute image URLs with the local images/ path"
find "${OUTPUT_DIR}" -maxdepth 1 -name '*.md' -print0 \
  | xargs -0 sed -i -E 's#\(images/(https?://[^)]+)\)#(\1)#g'

echo "- done. Output written to: ${OUTPUT_DIR}"
