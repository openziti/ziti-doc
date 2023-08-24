import React from "react";
import Layout from "@theme/Layout";
import Wizard from "../components/Wizard";
import { useLocation } from "react-router-dom";


export default function Stepper() {
    var steps
    return (
        
        <div class="page-wrapper bg-img-1">
            <div class="main">
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
                            {wizard.steps.map((item, itemIndex) => (
                                <li role="tab" className={((itemIndex==0) ? 'first' : '')+" "+((itemIndex==index) ? 'current' : '')} aria-disabled="false" aria-selected="true">
                                    <a id={'#steps-'+itemIndex} href={'#steps-'+itemIndex} aria-controls="steps-">
                                        <span class="current-info audible"> </span>
                                        <div class="title">
                                            <span class="step-number">{itemIndex+1}</span>
                                            <span class="step-text">{item}</span>
                                        </div>
                                    </a>
                                </li>
                            ))}
                            </ul>
                        </div>
                        <div class="content clearfix">
                            <div>
                                <fieldset role="tabpanel" class="body current" aria-hidden="false">
                                    <div>
                                        <h2>{itemTitle}</h2>
                                    </div>
                                    <div>
                                        <ReactMarkdown children={md} linkTarget={'_blank'} />
                                    </div>
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
    )
}