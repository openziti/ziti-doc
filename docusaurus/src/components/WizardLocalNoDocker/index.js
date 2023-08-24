import React, { Component, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import WizardNavigation from '../WizardNavigation';
import Intro from '@site/public/wizards/Local-No-Docker/_intro.md';
import Prereq from '@site/public/wizards/Local-No-Docker/_prereq.md';
import RunExpressInstall from '@site/public/wizards/Local-No-Docker/_run-express-install.md';
import StartComponents from '@site/public/wizards/Local-No-Docker/_start-components.md';
import StartController from '@site/public/wizards/Local-No-Docker/_start-controller.md';
import TestingOverLay from '@site/public/wizards/Local-No-Docker/_testing-overlay.md';
import RunService from '@site/public/wizards/Local-No-Docker/_run-service.md';
import CustomInstall from '@site/public/wizards/Local-No-Docker/_customizing-install.md';
import SourceEnvironment from '@site/public/wizards/Local-No-Docker/_sourcing-environment.md';
import NextSteps from '@site/public/wizards/Local-No-Docker/_next-steps.md';

export default function WizardLocalNoDocker(props) {
  const {
    title
  } = props;

  const [index, setIndex] = useState(0);
  let total = 10;

  function goto(indexChange) {
      let current = indexChange;
      if (current>total) current = total-1;
      if (current<0) current = 0;
      if (index!=current) setIndex(current);
  }

  function next() {
      let current = index;
      current++;
      if (current>total) current = total-1;
      if (current<0) current = 0;
      if (index!=current) setIndex(current);
      console.log(index);
  }

  function previous() {
      let current = index;
      current--;
      if (current<0) current = 0;
      if (index!=current) setIndex(current);
      console.log(index);
  }

  return (
    <div class="page-wrapper bg-img-1">
        <div class="wizard main">
            <div class="container">
                <div class="row">
                    <a class="whitez" href="/"></a>
                    <h1 class="header-title">{title}</h1>
                </div>
            </div>
            <div class="zcontainer">
                <div role="application" class="wizard clearfix vertical" id="steps-uid-0">
                    <div class="steps clearfix">
                        <ul role="tablist">
                            <WizardNavigation index="0" isCurrent={index==0} onIndexChange={goto} title="Getting Started"></WizardNavigation>
                            <WizardNavigation index="1" isCurrent={index==1} onIndexChange={goto} title="Prerequisites"></WizardNavigation>
                            <WizardNavigation index="2" isCurrent={index==2} onIndexChange={goto} title="Run expressInstall"></WizardNavigation>
                            <WizardNavigation index="3" isCurrent={index==3} onIndexChange={goto} title="Start the Components"></WizardNavigation>
                            <WizardNavigation index="4" isCurrent={index==4} onIndexChange={goto} title="Start Your Controller"></WizardNavigation>
                            <WizardNavigation index="5" isCurrent={index==5} onIndexChange={goto} title="Testing Your Overlay"></WizardNavigation>
                            <WizardNavigation index="6" isCurrent={index==6} onIndexChange={goto} title="Run Your First Service"></WizardNavigation>
                            <WizardNavigation index="7" isCurrent={index==7} onIndexChange={goto} title="Customizing the Install"></WizardNavigation>
                            <WizardNavigation index="8" isCurrent={index==8} onIndexChange={goto} title="Sourcing the Env File"></WizardNavigation>
                            <WizardNavigation index="9" isCurrent={index==9} onIndexChange={goto} title="Next Steps"></WizardNavigation>
                        </ul>
                    </div>
                    <div class="content clearfix">
                        <div>
                            <fieldset role="tabpanel" class="body current" aria-hidden="false">
                                <div className={((index==0) ? '' : 'hidden')}><Intro/></div>
                                <div className={((index==1) ? '' : 'hidden')}><Prereq/></div>
                                <div className={((index==2) ? '' : 'hidden')}><RunExpressInstall/></div>
                                <div className={((index==3) ? '' : 'hidden')}><StartComponents/></div>
                                <div className={((index==4) ? '' : 'hidden')}><StartController/></div>
                                <div className={((index==5) ? '' : 'hidden')}><TestingOverLay/></div>
                                <div className={((index==6) ? '' : 'hidden')}><RunService/></div>
                                <div className={((index==7) ? '' : 'hidden')}><CustomInstall/></div>
                                <div className={((index==8) ? '' : 'hidden')}><SourceEnvironment/></div>
                                <div className={((index==9) ? '' : 'hidden')}><NextSteps/></div>
                            </fieldset>
                        </div> 
                    </div>
                    <div class="actions clearfix">
                        <ul role="menu" aria-label="Pagination">
                            <li className={((index==0) ? 'hidden' : '')} aria-disabled="false">
                                <button onClick={previous}>Previous</button>
                            </li>
                            <li aria-hidden="false" aria-disabled="false">
                                <button onClick={next}>Next</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
