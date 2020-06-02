#!/bin/bash
set -e

mkdir -p ~/.ssh

echo is /usr/bin/ssh-keyscan installed???
ls -l /usr/bin/ssh-keyscan
ls -l /usr/bin/ssh-*``

echo running ssh-keyscan to add github.com to known hosts
ssh-keyscan github.com >> ~/.ssh/known_hosts

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

  #move back to master once we're this deep into the run
  ./changeToSsh.sh
  git checkout master
  git commit -m "[ci skip] publish docs from travis"
  git push

else
  echo ========= cannot publish from branch that is not master : ${GIT_BRANCH}
  echo ========= publish considered successful though no op
fi

popd