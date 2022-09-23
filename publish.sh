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
  | wget -q -i - -O ziti-ci
chmod +x ziti-ci
mv ziti-ci /usr/bin

if [ "${GIT_BRANCH}" == "main" ]
then
  echo on main branch - publish can proceed

  ./gendoc.sh
  ./gendoc.sh -dc

  echo "configuring git..."
  ziti-ci configure-git
  #git add docs docfx_project/ziti-*

  #move back to main once we're this deep into the run
  if [[ "$(git config --get remote.origin.url | cut -b1-3)" == "htt" ]]; then
    echo changing git repo from https to git so that we can push...
    ./changeToSsh.sh
  fi
  git checkout main
# branch protection disallows this  git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from travis" && git push

  echo "cloning actual github pages now to push docs into"
  git clone https://github.com/openziti/openziti.github.io.git
#  git clone git@github.com:openziti/openziti.github.io.git

  # clean the old site to remove any pages/etc that are no longer around
  rm -r openziti.github.io/*

  # copy all the docs-local into the publish site
  cp -r docs-local/* openziti.github.io/
  mv docusaurus/build openziti.github.io/docusaurus

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

  # copy the known hosts to root... since this is running in a container it's running as the root user
  # and the git commit command is looking for known_hosts at /root/.ssh/known_hosts - although ~/.ssh
  # is at /github/home instead - go figure... /root/.ssh might not exist either so make it just in case
  mkdir -p /root/.ssh
  cp $HOME/.ssh/known_hosts /root/.ssh/known_hosts

  echo __________________________________________________________________________
  git status
  git config user.name ziti-ci
  git config user.email ziti-ci@netfoundry.io
  git config core.sshCommand "ssh -i ${pub_script_root}/github_deploy_key"

  echo "showing the git config"
  git config --get remote.origin.url
  git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from CI" && git push

  echo __________________________________________________________________________
else
  echo ========= cannot publish from branch that is not main : ${GIT_BRANCH}
  echo ========= publish considered successful though no op
fi

popd