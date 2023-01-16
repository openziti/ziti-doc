#!/bin/bash
set -eu

mkdir -p ~/.ssh

echo running ssh-keyscan to add github.com to known hosts
mkdir -p ~/.ssh
ssh-keyscan github.com >> ~/.ssh/known_hosts
chmod -R u=rwX,go-rwx ~/.ssh/

pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "publish script located in: $pub_script_root"

cd $pub_script_root

if [ "${GIT_BRANCH:-}" == "main" ]; then
  echo on main branch - publish can proceed

  ./gendoc.sh  # clone and build companion microsites and build Docusaurus

  wget https://github.com/netfoundry/ziti-ci/releases/latest/download/ziti-ci  # fetch latest release
  install ./ziti-ci /usr/local/bin/  # set executable bit and copy to executable search path

  echo "configuring git..."
  ziti-ci configure-git  # writes key from env var $gh_ci_key to file ./github_deploy_key
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

  # recursively clean all visible files (ignore hidden files like .git/)
  rm -rf ./openziti.github.io/*

  # copy Docusaurus build output dir to the publish site dir
  cp -rT ./docusaurus/build/ ./openziti.github.io/

  cd ./openziti.github.io/
  
  echo 'Creating CNAME file for custom github pages domain. see https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages#cname-errors'
  cat "docs.openziti.io" > CNAME
  
  git add -A
  if [[ "$(git config --get remote.origin.url | cut -b1-3)" == "htt" ]]; then
    echo changing git repo from https to git so that we can push...
    ../changeToSsh.sh
  fi

  GH_KEY="${pub_script_root}/github_deploy_key"
  if test -f "${GH_KEY}"; then
    echo "git push should succeed: ${GH_KEY} exists..."
  else
    echo "${GH_KEY} DID NOT exist???"
  fi

  # copy the known hosts to root... since this is running in a container it's running as the root user
  # and the git commit command is looking for known_hosts at /root/.ssh/known_hosts - although ~/.ssh
  # is at /github/home instead - go figure... /root/.ssh might not exist either so make it just in case
  if [[ ${EUID} -eq 0 ]]; then
    mkdir -p /root/.ssh
    cp "${HOME}/.ssh/known_hosts" /root/.ssh/known_hosts
    chown -R root:root /root/.ssh/
    chmod -R u=rwX,go-rwx /root/.ssh/
  fi

  echo __________________________________________________________________________
  git status
  git config user.name ziti-ci
  git config user.email ziti-ci@netfoundry.io
  git config core.sshCommand "ssh -i ${GH_KEY}"

  echo "showing the git config"
  git config --get remote.origin.url
  # push unless there are no differences
  git diff-index --quiet HEAD || git commit -m "[ci skip] publish docs from CI" && git push

  echo __________________________________________________________________________
else
  echo ========= cannot publish from branch that is not main : ${GIT_BRANCH}
  echo ========= publish considered successful though no op
fi

