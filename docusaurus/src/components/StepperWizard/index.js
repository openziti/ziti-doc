import React from 'react';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import Wizard from '../Wizard';

export default function StepperWizard(props) {
  const {
  } = props;
  useKeyboardNavigation();
  return (
    <div class="bg-img-1">
      <div class="main">
          <div class="container">
              <div class="row">
                  <div class="whitez"></div>
                  <h1 class="header-title">OpenZiti: Quick Starts</h1>
              </div>
          </div>
          <div class="zcontainer">
            <div>
                <fieldset>
                    <h2 className="mt20">Get Started - Build a Network</h2>
                    <p class="desc">Ziti make zero trust easy but you'll need an overlay network in order to start on your zero trust journey. We recommend you start with a simple network. Once you understand the basic concepts it can make more sense to move on to more complex network topologies.
                    </p>
                    <h4>Choose what sort of network you want to build.</h4>
                    <div class="row">
                        <div class="builderbox"><a class="builderbutton local" href="/stepper#EverythingLocal" target='_blank'></a><span class="buildertext">Everything Local<br/><span class="gray">Not Docker</span></span></div>
                        <div class="builderbox"><a class="builderbutton docker" href="/stepper#LoveDocker" target='_blank'></a><span class="buildertext">Everything Local<br/><span class="gray">I Love Docker</span></span></div>
                        <div class="builderbox"><a class="builderbutton compose" href="/stepper#DockerCompose" target='_blank'></a><span class="buildertext">Everything Local<br/><span class="gray">Docker Compose</span></span></div>
                        <div class="builderbox"><a class="builderbutton server" href="/stepper#HostAnywhere" target='_blank'></a><span class="buildertext">Host It Anywhere<br/><span class="gray">I have a server</span></span></div>
                    </div>
                </fieldset>
            </div>
          </div>
      </div>
  </div>
  );
}
