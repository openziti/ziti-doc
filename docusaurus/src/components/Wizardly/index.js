import React, { Component, useState } from 'react';

export default function Wizardly(props) {
    return (
        <div id="Wizardly">
            <div class="wizardmodal">
                <div class="page-wrapper bg-img-1"></div>
                <div class="page-wrapper">
                    <div class="wizard main">
                        <div class="container">
                            <div class="row">
                                <div class="whitez"></div>
                                <h1 id="WizardTitle" class="header-title"></h1>
                            </div>
                        </div>
                        <div class="zcontainer">
                            <div role="application" class="wizard clearfix vertical" id="steps-uid-0">
                                <div class="steps clearfix">
                                    <ul id="WizardTabs" role="tablist"></ul>
                                </div>
                                <div class="content clearfix">
                                    <div>
                                        <fieldset id="WizardContents" role="tabpanel" class="body current" aria-hidden="false"></fieldset>
                                    </div> 
                                </div>
                                <div class="actions clearfix">
                                    <ul role="menu" aria-label="Pagination">
                                        <li>
                                            <button id="WizardPreviousButton" onClick={window['WizardPrev']}>Previous</button>
                                        </li>
                                        <li >
                                            <button id="WizardNextButton" onClick={window['WizardNext']}>Next</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="openWizard" onClick={window['ShowWizard']}>Show As Wizard</div>
        </div>
    )
}
