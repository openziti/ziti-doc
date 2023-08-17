import React, { Component, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import wizards from "../../../public/wizards/wizards.json";

export default function Wizard(props) {
    const {
      hash
    } = props;

    const [md, setMd] = useState("");
    const [index, setIndex] = useState(0);

    let title = "";
    let wizard;
    let total = 0;
    let lastIndex = -1;
    let itemTitle = "";

    for (let i=0; i<wizards.length; i++) {
      if (wizards[i].hash==hash) {
          wizard = wizards[i];
          title = wizard.name;
          total = wizard.steps.length;
          break;
      }
    }

    function next() {
        let current = index;
        current++;
        if (current>total) current = total-1;
        if (current<0) current = 0;
        if (index!=current) setIndex(current);
    }

    function previous() {
        let current = index;
        current--;
        if (current<0) current = 0;
        if (index!=current) setIndex(current);
    }

    if (wizard && wizard.steps && wizard.steps.length>index) {
      let item = wizard.steps[index];
      itemTitle = item;
      let url = useBaseUrl("/wizards/"+wizard.name+"/"+(index+1)+" - "+item+".md");
      fetch(url).then((response) => {
        if (index!=lastIndex) {
            lastIndex = index;
            response.text().then((val) => {
                setMd(val);
            });
        }
      }); 
    }

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
