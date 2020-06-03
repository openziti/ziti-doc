#!/bin/bash
set -e

mkdir -p ~/.ssh

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
  if [[ "$(git config --get remote.origin.url | cut -b1-3)" == "htt" ]]; then
    echo changing git repo from https to git so that we can push...
    ./changeToSsh.sh
  fi
  git checkout master
  git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from travis" && git push

  echo "cloning actual github pages now to push docs into"
  git clone https://github.com/openziti/openziti.github.io.git
#  git clone git@github.com:openziti/openziti.github.io.git
  cp -r docs/* openziti.github.io/
  cd openziti.github.io
  git add *
  if [[ "$(git config --get remote.origin.url | cut -b1-3)" == "htt" ]]; then
    echo changing git repo from https to git so that we can push...
    ../changeToSsh.sh
  fi

  echo Configuring git 
  git config user.name ziti-ci
  git config user.email ziti-ci@netfoundry.io
  git config core.sshCommand "ssh -i /doc/github_deploy_key"

  git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from travis" && git push
else
  echo ========= cannot publish from branch that is not master : ${GIT_BRANCH}
  echo ========= publish considered successful though no op
fi

popd