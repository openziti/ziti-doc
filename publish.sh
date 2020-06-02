#!/bin/bash
set -e

cat /mountedSsh/known_hosts >> ~/.ssh/known_hosts

pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo $pub_script_root

pushd $pub_script_root

curl -s https://api.github.com/repos/netfoundry/ziti-ci/releases/latest \
  | grep browser_download_url \
  | cut -d ":" -f2,3 \
  | tr -d \" \
  | wget -i - -O ziti-ci
chmod +x ziti-ci
mv ziti-ci /usr/bin

if [ "${GIT_BRANCH}" == "master" ]
then
  echo on master branch - publish can proceed

  ./gendoc.sh docs

  ziti-ci configure-git
  git add docs docfx_project/ziti-*
  git commit -m "[ci skip] publish docs from travis"
  git push

else
  echo ========= cannot publish from branch that is not master : ${GIT_BRANCH}
  echo ========= publish considered successful though no op
fi

popd