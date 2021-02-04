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

commands_to_test=(doxygen mono docfx jq)

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

echo "updating dependencies by rm/checkout"
rm -r rm -rf $script_root/docfx_project/ziti-*
git clone https://github.com/netfoundry/ziti-cmd --branch main --single-branch docfx_project/ziti-cmd
git clone https://github.com/netfoundry/ziti-sdk-csharp --branch master --single-branch docfx_project/ziti-sdk-csharp
git clone https://github.com/netfoundry/ziti-sdk-c --branch main --single-branch docfx_project/ziti-sdk-c
git clone https://github.com/netfoundry/ziti-android-app --branch master --single-branch docfx_project/ziti-android-app
git clone https://github.com/netfoundry/ziti-sdk-swift --branch main --single-branch docfx_project/ziti-sdk-swift

DOC_ROOT=docs-local

if test -d "./$DOC_ROOT"; then
  # specifically using ../ziti-doc just to remove any chance to rm something unintended
  echo removing previous build at: rm -r ./$DOC_ROOT
  rm -r ./$DOC_ROOT || true
fi

pushd docfx_project
docfx build
popd

if test -f "${script_root}/docfx_project/ziti-sdk-c/Doxyfile"; then
    pushd ${script_root}/docfx_project/ziti-sdk-c
    doxygen
    CLANG_SOURCE="${script_root}/docfx_project/ziti-sdk-c/api"
    CLANG_TARGET="${script_root}/${DOC_ROOT}/api/clang"
    echo " "
    echo "Copying C SDK "
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
    SWIFT_API_TARGET="./${DOC_ROOT}/api/swift"
    mkdir -p "./${SWIFT_API_TARGET}"
    pushd ${SWIFT_API_TARGET}
    swift_tgz=$(curl -s https://api.github.com/repos/openziti/ziti-sdk-swift/releases/latest | jq -r '.assets[] | select (.name=="ziti-sdk-swift-docs.tgz") | .browser_download_url')
    echo " "
    echo "Copying Swift docs"
    echo "    from: ${swift_tgz}"
    echo "      to: ${script_root}/${SWIFT_API_TARGET}"
    #echo "     via: wget -q -O - ${swift_tgz} | tar -zxvC ${SWIFT_API_TARGET}"
    echo "     via: wget -q -O - ${swift_tgz} | tar -zxv"
    pwd
    #wget -q -O - "${swift_tgz}" | tar -zxvC "${SWIFT_API_TARGET}"
    wget -q -O - "${swift_tgz}" | tar -zxv
    find ${script_root}/${SWIFT_API_TARGET} -name EnrollmentResponse*
    popd
fi



