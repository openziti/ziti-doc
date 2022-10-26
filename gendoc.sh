#!/bin/bash -eu

shopt -s expand_aliases

function clone_or_pull {
  remote=$1
  dir="${ZITI_DOC_GIT_LOC}/${2}"
  if [ -d "${dir}" ]; then
    pushd "${dir}"
    git pull
    popd
  else
    git clone "${remote}" --branch main --single-branch "${dir}"
  fi
}

set -e

script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "$script_root"

SKIP_GIT=""
SKIP_LINKED_DOC=""
SKIP_CLEAN=""
WARNINGS_AS_ERRORS=""
ZITI_DOC_GIT_LOC="${script_root}/docfx_project"
DOC_ROOT_TARGET="${script_root}/docs-local/api"
: ${ZITI_DOCUSAURUS:=false}
: ${WEB_HOST:=gh_pages}

echo "- processing opts"

while getopts ":gwlcdfV" opt; do
  case ${opt} in
    g ) # skip git
      echo "- skipping git cleanup"
      SKIP_GIT="yes"
      ;;
    l ) # skip linked doc gen
      echo "- skipping linked doc generation"
      SKIP_LINKED_DOC="yes"
      ;;
    c ) # skip clean steps
      echo "- skipping clean step"
      SKIP_CLEAN="yes"
      ;;
    w ) # process option t
      echo "- treating warnings as errors"
      WARNINGS_AS_ERRORS="--warningsAsErrors"
      ;;
    d ) # docusaurus
      echo "- building docusaurus"
      ZITI_DOCUSAURUS="true"
      ZITI_DOC_GIT_LOC="${script_root}/docusaurus/_remotes"
      DOC_ROOT_TARGET="${script_root}/docusaurus/static/api"
      echo "- building docusaurus to ${ZITI_DOC_GIT_LOC}"
      ;;
    f ) # docfx
    #\? ) echo "Usage: cmd [-h] [-t]"
      echo "this would have been docfx"
      ;;
    V ) WEB_HOST=vercel
      ;;
    *)
      ;;
  esac
done

echo "- done processing opts"

# if in Docfx mode, not Docusaurus mode, then make sure the required programs are available 
if [[ "${ZITI_DOCUSAURUS}" == false ]]; then
  if [[ -z "${DOCFX_EXE:-}" ]]; then
      shopt -s expand_aliases
      if [[ -f "~/.bash_aliases" ]]; then
        source "${HOME}/.bash_aliases"
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
  if ! [[ -z "${missing_requirements:-}" ]]; then
      echo " "
      echo "The commands listed below are required to be on the path for this script to function properly."
      echo "Please ensure the commands listed are on the path and then try again."
      printf "\n${missing_requirements}"
      echo " "
      echo "If any of these commands are declared as aliases (docfx is a common one) ensure your alias is"
      echo "declared inside of ~/.bash_aliases - or modify this script to add the aliases you require"
      exit 1
  fi
fi

if [[ ! "${SKIP_GIT}" == "yes" ]]; then
  echo "updating dependencies by rm/checkout"
  mkdir -p "${ZITI_DOC_GIT_LOC}"
  if [[ ! "${SKIP_CLEAN}" == "yes" ]]; then
    rm -rf ${ZITI_DOC_GIT_LOC}/ziti-*
  fi
  git config --global --add safe.directory $(pwd)
  clone_or_pull "https://github.com/openziti/ziti" "ziti-cmd"
  clone_or_pull "https://github.com/openziti/ziti-sdk-csharp" "ziti-sdk-csharp"
  clone_or_pull "https://github.com/openziti/ziti-sdk-c" "ziti-sdk-c"
  clone_or_pull "https://github.com/openziti/ziti-android-app" "ziti-android-app"
  clone_or_pull "https://github.com/openziti/ziti-sdk-swift" "ziti-sdk-swift"
fi

if [[ ! "${SKIP_CLEAN}" == "yes" ]]; then
if test -d "${DOC_ROOT_TARGET}"; then
  # specifically using ../ziti-doc just to remove any chance to rm something unintended
  echo removing previous build at: rm -r "${DOC_ROOT_TARGET}"
  rm -r "${DOC_ROOT_TARGET}" || true
fi
fi

if [[ "${ZITI_DOCUSAURUS}" == "false" ]]; then
  pushd ${ZITI_DOC_GIT_LOC}
  docfx build ${WARNINGS_AS_ERRORS}
  popd
else
  if [[ ${WEB_HOST} == vercel ]]; then
    sed -E -i "s|(baseUrl:).*,|\1 '/',|" ${ZITI_DOC_GIT_LOC}/../docusaurus.config.js
  fi
  pushd ${ZITI_DOC_GIT_LOC}/..
  echo "running 'yarn install' in ${PWD}"
  yarn install --frozen-lockfile
  echo "running 'yarn build' in ${PWD}"
  yarn build
  popd
fi

if [[ ! "${SKIP_LINKED_DOC}" == "yes" ]]; then

  if [[ "${ZITI_DOCUSAURUS}" == "true" ]]; then
    echo "=================================================="
    #echo "charp: building the c# sdk docs"
    #cp -r "${script_root}/docfx_project/templates" "${ZITI_DOC_GIT_LOC}/ziti-sdk-csharp/"
    #docfx build -f "${ZITI_DOC_GIT_LOC}/ziti-sdk-csharp/docfx.json"
  #
    CSHARP_SOURCE="${ZITI_DOC_GIT_LOC}/ziti-sdk-csharp/docs"
    CSHARP_TARGET="${DOC_ROOT_TARGET}/csharp"
    echo "Copying csharp SDK docs"
    echo "    from: ${CSHARP_SOURCE}"
    echo "      to: ${CSHARP_TARGET}"
    echo " "
    mkdir -p "${CSHARP_TARGET}"
    cp -r "${CSHARP_SOURCE}/"* "${CSHARP_TARGET}"
  fi

  if test -f "${ZITI_DOC_GIT_LOC}/ziti-sdk-c/Doxyfile"; then
      pushd "${ZITI_DOC_GIT_LOC}/ziti-sdk-c"
      doxygen
      CLANG_SOURCE="${ZITI_DOC_GIT_LOC}/ziti-sdk-c/api"
      CLANG_TARGET="${DOC_ROOT_TARGET}/clang"
      echo " "
      echo "Copying C SDK doc"
      echo "    from: ${CLANG_SOURCE}"
      echo "      to: ${CLANG_TARGET}"
    echo " "
      mkdir -p "${CLANG_TARGET}"
      cp -r "${CLANG_SOURCE}/"* "${CLANG_TARGET}"

      echo " "
      echo "Removing"
      echo "    ${ZITI_DOC_GIT_LOC}/ziti-sdk-c/api"
      rm -rf "${ZITI_DOC_GIT_LOC}/ziti-sdk-c/api"
      popd
  else
      echo "ERROR: CSDK Doxyfile not located"
  fi

  if test -f "${ZITI_DOC_GIT_LOC}/ziti-sdk-swift/CZiti.xcodeproj/project.pbxproj"; then
      SWIFT_API_TARGET="${DOC_ROOT_TARGET}/swift"
      mkdir -p "${SWIFT_API_TARGET}"
      pushd "${SWIFT_API_TARGET}"
      swift_tgz=$(curl -s https://api.github.com/repos/openziti/ziti-sdk-swift/releases/latest | jq -r '.assets[] | select (.name=="ziti-sdk-swift-docs.tgz") | .browser_download_url')
      echo " "
      echo "Copying Swift docs"
      echo "    from: ${swift_tgz}"
      echo "      to: ${SWIFT_API_TARGET}"
      echo " "
      echo "     via: wget -q -O - ${swift_tgz} | tar -zxv"
      pwd
      #wget -q -O - "${swift_tgz}" | tar -zxvC "${SWIFT_API_TARGET}"
      wget -q -O - "${swift_tgz}" | tar -zxv
      find "${SWIFT_API_TARGET}" -name "EnrollmentResponse*"
      popd
  fi
fi
