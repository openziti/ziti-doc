#!/bin/bash -eu

shopt -s expand_aliases

function clone_or_pull {
  remote=$1
  dir="${ZITI_DOC_GIT_LOC}/${2}"
  if [[ -n ${3:-} ]]; then
    local BRANCH="${3}"
  else
    local BRANCH="main"
  fi
  if [ -d "${dir}" ]; then
    pushd "${dir}"
    git fetch
    git checkout "${BRANCH}"
    git pull
    popd
  else
    git clone "${remote}" --branch "${BRANCH}" --single-branch "${dir}" --depth 1
  fi
}

set -e

script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "$script_root"

: ${SKIP_GIT:=no}
: ${SKIP_LINKED_DOC:=no}
: ${SKIP_CLEAN:=no}
ZITI_DOC_GIT_LOC="${script_root}/docusaurus/_remotes"
DOC_ROOT_TARGET="${script_root}/docusaurus/static/docs/reference/developer/sdk"
: ${ZITI_DOCUSAURUS:=yes}

echo "- processing opts"

while getopts ":glc" OPT; do
  case ${OPT} in
    g ) # skip git
      echo "- skipping creating and updating Git working copies"
      SKIP_GIT="yes"
      ;;
    l ) # skip linked doc gen
      echo "- skipping linked doc generation"
      SKIP_LINKED_DOC="yes"
      ;;
    c ) # skip clean steps
      echo "- skipping clean step that deletes Git working copies"
      SKIP_CLEAN="yes"
      ;;
    *)
      echo "WARN: ignoring option ${OPT}" >&2
      ;;
  esac
done

echo "- done processing opts"

if [[ "${SKIP_GIT}" == no ]]; then
  echo "updating dependencies by rm/checkout"
  mkdir -p "${ZITI_DOC_GIT_LOC}"
  if [[ "${SKIP_CLEAN}" == no ]]; then
    rm -rf ${ZITI_DOC_GIT_LOC}/ziti-*
  fi
  git config --global --add safe.directory $(pwd)
  clone_or_pull "https://github.com/openziti/ziti" "ziti-cmd"
  clone_or_pull "https://github.com/openziti/ziti-sdk-csharp" "ziti-sdk-csharp"
  clone_or_pull "https://github.com/openziti/ziti-sdk-c" "ziti-sdk-c"
  clone_or_pull "https://github.com/openziti/ziti-android-app" "ziti-android-app"
  clone_or_pull "https://github.com/openziti/ziti-sdk-swift" "ziti-sdk-swift"
  clone_or_pull "https://github.com/openziti/ziti-tunnel-sdk-c" "ziti-tunnel-sdk-c"
  clone_or_pull "https://github.com/openziti/helm-charts" "helm-charts"
fi

if [[ "${SKIP_CLEAN}" == no ]]; then
  if test -d "${DOC_ROOT_TARGET}"; then
    # specifically using ../ziti-doc just to remove any chance to rm something unintended
    echo removing previous build at: rm -r "${DOC_ROOT_TARGET}"
    rm -r "${DOC_ROOT_TARGET}" || true
  fi
fi

if [[ "${SKIP_LINKED_DOC}" == no ]]; then

  commands_to_test=(doxygen wget)

  # verify all the commands required in the automation exist before trying to run the full suite
  for cmd in "${commands_to_test[@]}"; do
    # checking all commands are on the path before continuing...
    result="$(type ${cmd} &>/dev/null && echo "Found" || echo "Not Found")"

    if [[ "Not Found" == "${result}" ]]; then
        missing_requirements+=" * ${cmd}\n"
    fi
  done

  # are requirements ? if yes, stop here and help 'em out
  if [[ -n "${missing_requirements:-}" ]]; then
      echo " "
      echo "The commands listed below are required to be on the path for this script to function properly."
      echo "Please ensure the commands listed are on the path and then try again."
      printf "\n${missing_requirements}"
      echo " "
      echo "If any of these commands are declared as aliases ensure your alias is"
      echo "declared inside of ~/.bash_aliases - or modify this script to add the aliases you require"
      exit 1
  fi

  if [[ "${ZITI_DOCUSAURUS}" == yes ]]; then
    echo "=================================================="
    #echo "csharp: building the c# sdk docs"
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
      swift_tgz="https://github.com/openziti/ziti-sdk-swift/releases/latest/download/ziti-sdk-swift-docs.tgz"
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

pushd ${ZITI_DOC_GIT_LOC}/..
echo "running 'yarn install' in ${PWD}"
yarn install --frozen-lockfile
echo "running 'yarn build' in ${PWD}"
yarn build
popd

