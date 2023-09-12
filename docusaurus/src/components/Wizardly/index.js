import React, { Component, useState } from 'react';

export default function Wizardly(props) {
    return (
        <div id="Wizardly">
            <div className={'wizardmodal'}>
                <div className={'page-wrapper bg-img-1'}></div>
                <div className={'page-wrapper'}>
                    <div className={'wizard main'}>
                        <div className={'container'}>
                            <div className={'row'}>
                                <div className={'whitez'}></div>
                                <h1 id="WizardTitle" className={'header-title'}></h1>
                                <div className={'wizardclose'}></div>
                            </div>
                        </div>
                        <div className={'zcontainer'}>
                            <div role="application" className={'wizard clearfix vertical'} id="steps-uid-0">
                                <div className={'steps clearfix'}>
                                    <ul id="WizardTabs" role="tablist"></ul>
                                </div>
                                <div className={'content clearfix'}>
                                    <div>
                                        <fieldset id="WizardContents" role="tabpanel" className={'body current'} aria-hidden="false"></fieldset>
                                    </div> 
                                </div>
                                <div className={'actions clearfix'}>
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
            <div className={'openWizard'} onClick={window['ShowWizard']}>Show As Wizard</div>
        </div>
    )
}
