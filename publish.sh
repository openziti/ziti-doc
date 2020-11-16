#!/bin/bash
set -e

mkdir -p ~/.ssh

echo running ssh-keyscan to add github.com to known hosts
mkdir -p ~/.ssh
ssh-keyscan github.com >> ~/.ssh/known_hosts
chmod -R 600 ~/.ssh
chmod -R 600 ~/.ssh/*

pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "publish script located in: $pub_script_root"

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

  echo "configuring git..."
  ziti-ci configure-git
  git add docs docfx_project/ziti-*

  #move back to master once we're this deep into the run
  if [[ "$(git config --get remote.origin.url | cut -b1-3)" == "htt" ]]; then
    echo changing git repo from https to git so that we can push...
    ./changeToSsh.sh
  fi
  git checkout master
# branch protection disallows this  git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from travis" && git push

  echo "cloning actual github pages now to push docs into"
  git clone https://github.com/openziti/openziti.github.io.git
#  git clone git@github.com:openziti/openziti.github.io.git

  # clean the old site to remove any pages/etc that are no longer around
  rm -r openziti.github.io/*

  # copy all the docs into the publish site
  cp -r docs/* openziti.github.io/
  cd openziti.github.io
  git add *
  if [[ "$(git config --get remote.origin.url | cut -b1-3)" == "htt" ]]; then
    echo changing git repo from https to git so that we can push...
    ../changeToSsh.sh
  fi

  GH_KEY="${pub_script_root}/github_deploy_key"
  if test -f "${GH_KEY}"; then
    echo "git push should succeed: ${pub_script_root}/github_deploy_key exists..."
  else
    echo "${GH_KEY} DID NOT exist???"
  fi

  #echo "chmod'ing ${pub_script_root}/github_deploy_key to 600"
  #chmod 600 ${pub_script_root}/github_deploy_key
  #ssh -Tv -i ${pub_script_root}/github_deploy_key git@github.com
  #cp ${pub_script_root}/github_deploy_key ~/.ssh/id_rsa
  #chmod 600 ~/.ssh/id_rsa
  #echo "checking id_rsa exists:"
  #ls -l ~/.ssh/id_rsa

  #mkdir -p /root/.ssh
  #cp ${pub_script_root}/github_deploy_key /root/.ssh/id_rsa
  #chmod 600 /root/.ssh/id_rsa
  #echo "checking /root/.ssh/* now"
  #ls /root/.ssh/*

  #ssh -Tv git@github.com

  echo __________________________________________________________________________
  git config user.name ziti-ci
  git config user.email ziti-ci@netfoundry.io
  git config core.sshCommand "ssh -i ${pub_script_root}/github_deploy_key"

  echo "showing the git config"
  git config --get remote.origin.url

  #git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from CI" && git push
else
  echo ========= cannot publish from branch that is not master : ${GIT_BRANCH}
  echo ========= publish considered successful though no op
fi

popd