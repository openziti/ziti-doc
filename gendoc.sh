#!/bin/bash

echo $(alias)

shopt -s expand_aliases

if [[ "" = "$DOCFX_EXE" ]]; then
    shopt -s expand_aliases
    if [[ -f "~/.bash_aliases" ]]; then
    	source ~/.bash_aliases
	fi
else
    alias docfx="mono $DOCFX_EXE"
fi

commands_to_test=(doxygen mono docfx)

echo $(alias)

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

pushd docfx_project
pwd
docfx build
popd

if test -f "${script_root}/docfx_project/ziti-sdk-c/Doxyfile"; then
    pushd ${script_root}/docfx_project/ziti-sdk-c
    doxygen
    echo " "
    echo "Copying "
    echo "    from: ${script_root}/docfx_project/ziti-sdk-c/api ${script_root}/docs/api/clang"
    echo "      to: ${script_root}/docs/api/clang"
    cp -r ${script_root}/docfx_project/ziti-sdk-c/api ${script_root}/docs/api/clang

    echo " "
    echo "Removing"
    echo "    ${script_root}/docfx_project/ziti-sdk-c/api"
    rm -rf ${script_root}/docfx_project/ziti-sdk-c/api
    popd
else
    echo "ERROR: CSDK Doxyfile not located"
fi

