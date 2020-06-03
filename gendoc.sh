#!/bin/bash

shopt -s expand_aliases

if [[ "" = "$DOCFX_EXE" ]]; then
    shopt -s expand_aliases
    if [[ -f "~/.bash_aliases" ]]; then
    	source ~/.bash_aliases
	fi
else
    alias docfx="mono $DOCFX_EXE"
fi

commands_to_test=(doxygen mono docfx aws)

# verify all the commands required in the automation exist before trying to run the full suite
for cmd in "${commands_to_test[@]}"
do
    # checking all commands are on the path before continuing...
    result="$(type ${cmd} &>/dev/null && echo "Found" || echo "Not Found")"

    if [ "Not Found" = "${result}" ]; then
        missing_requirements="${missing_requirements}    * ${cmd}\n"
    fi
done

# are requirements ? if yes, stop here and help 'em out
if ! [[ "" = "${missing_requirements}" ]]; then
    echo " "
    echo "The commands listed below are required to be on the path for this script to function properly."
    echo "Please ensure the commands listed are on the path and then try again."
    printf "\n${missing_requirements}"
    echo " "
    echo "If any of these commands are declared as aliases (docfx is a common one) ensure your alias is"
    echo "declared inside of ~/.bash_aliases - or modify this script to add the aliases you require"
    exit 1
fi

set -e

script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo $script_root

echo "updating git submodules if needed"
git submodule update --init
git submodule update --remote --merge

if [ "$1" == "" ]; then
  DOC_ROOT=docs-local
else
  sed -i "s/docs-local/$1/g" docfx_project/docfx.json
  DOC_ROOT=$1
fi

# specifically using ../ziti-doc just to remove any chance to rm something unintended
echo removing previous build at: rm $(pwd)/../ziti-doc/${DOC_ROOT}
rm -r $(pwd)/../ziti-doc/${DOC_ROOT}

pushd docfx_project
docfx build
popd

if test -f "${script_root}/docfx_project/ziti-sdk-c/Doxyfile"; then
    pushd ${script_root}/docfx_project/ziti-sdk-c
    doxygen
    CLANG_SOURCE="${script_root}/docfx_project/ziti-sdk-c/api"
    CLANG_TARGET="${script_root}/${DOC_ROOT}/api/clang"
    echo " "
    echo "Copying "
    echo "    from: ${CLANG_SOURCE}"
    echo "      to: ${CLANG_TARGET}"
    mkdir -p ${CLANG_TARGET}
    cp -r ${script_root}/docfx_project/ziti-sdk-c/api ${CLANG_TARGET}

    echo " "
    echo "Removing"
    echo "    ${script_root}/docfx_project/ziti-sdk-c/api"
    rm -rf ${script_root}/docfx_project/ziti-sdk-c/api
    popd
else
    echo "ERROR: CSDK Doxyfile not located"
fi

if test -f "${script_root}/docfx_project/ziti-sdk-swift/CZiti.xcodeproj/project.pbxproj"; then
    pushd ${script_root}/docfx_project/ziti-sdk-swift
    swift_sdk_rev_short=$(git status | head -1 | cut -d " " -f4)
    popd
    S3_SWIFT_BUCKET="s3://ziti-sdk-swift/ziti-sdk-swift-docs-${swift_sdk_rev_short}.tgz"
    SWIFT_API_TARGET="./${DOC_ROOT}/api/swift"
    echo " "
    echo "Copying Swift docs"
    echo "    from: ${S3_SWIFT_BUCKET}"
    echo "      to: ${script_root}/${DOC_ROOT}/api/clang"
    echo "     via: tar xvf ziti-sdk-swift-docs-${swift_sdk_rev_short}.tgz -C ${SWIFT_API_TARGET}"
    aws s3 cp ${S3_SWIFT_BUCKET} .
    mkdir -p "./${DOC_ROOT}/api/swift"
    tar xvf ziti-sdk-swift-docs-${swift_sdk_rev_short}.tgz -C ${SWIFT_API_TARGET}
    rm ziti-sdk-swift-docs-${swift_sdk_rev_short}.tgz
fi


