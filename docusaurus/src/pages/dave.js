import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiLayout from "../components/OpenZitiLayout";
import {WhatIsOpenZiti} from "../components/SharedComponents";
import Link from '@docusaurus/Link';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from "./index.module.css"
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import StepperWizard from '../components/StepperWizard';
import TunnelerOverviewMd from '../../docs/learn/quickstarts/network/_local-no-docker-part1.md';
import Head from '@docusaurus/Head';



export function Highlight(props) {
    const { children } = props;
    return (
        <span style={{color: "var(--ifm-color-primary)"}}> {children}</span>
    );
}
export function H1(props) {
    const {children, id} = props;
    return (
        <p id={id} className={styles.h1}>{children}</p>
    );
}
export function H2(props) {
    const {children} = props;
    return (
        <p className={styles.h2}>{children}</p>
    );
}
export function H3(props) {
    const {children,style} = props;
    return (
        <h3 className={styles.h3} style={style}>{children}</h3>
    );
}

export default function Home() {
    const {siteConfig} = useDocusaurusContext();
    const exampleStyle = {
        color: "white",
        backgroundColor: "DodgerBlue",
        padding: "20px",
        fontFamily: "Arial"
        
    };
    

    return (

        <OpenZitiLayout>
            <Head>
            <script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
            <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com"></link>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
            <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Russo+One&display=swap" rel="stylesheet"></link>
           </Head>

            <StepperWizard><div className="main">
            <div className="container">
                <div className="row">
                    <a className="whitez" href="index.html"></a>
                    <h1 className="header-title">Everything Local (Not Docker)</h1>
                </div>
            </div>
            
            <div className="zcontainer">
                <form method="POST" id="signup-form" className="signup-form" action="#">
                    <div>
                        <h3>Getting Started</h3>
                        <fieldset>
                            <h2><span className="numberhide">1.</span>Getting Started</h2>
                            <p className="desc">Running the latest version of Ziti locally is as simple as running this one
                                command:
                            </p>
                            <pre className='prettyprint'>
                                source /dev/stdin "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"; expressInstall</pre>
                            <h4>... This script will perform an 'express' install of Ziti which does the following:</h4>
                            <ul>
                                <li className="desc">download the latest version of the Ziti components (<code>ziti</code>,
                                    <code>ziti-controller</code>, <code>ziti-edge-router</code>,
                                    <code>ziti-tunnel</code>)
                                </li>
                                <li className="desc">extract the components into a predefined location:
                                    ~/.ziti/quickstart/$(hostname -s)
                                </li>
                                <li className="desc">create a full PKI for you to explore
                                </li>
                                <li className="desc">create a controller configuration using default values and the PKI
                                    created above
                                </li>
                                <li className="desc">create an edge-router configuration using default values and the PKI
                                    created above
                                </li>
                                <li className="desc">add helper functions and environment variables to your shell (<a
                                        href="https://get.openziti.io/quick/ziti-cli-functions.sh"
                                        target="_blank">explore the script to see all</a>)
                                </li>
                            </ul>
                            <p className="desc">Now latest version of Ziti has been downloaded and added to your path, it's
                                time to start your controller and edge router.</p>
                        </fieldset>

                        <h3>Start Your Edge Router</h3>
                        <fieldset>
                            <h2><span className="numberhide">4.</span> Start Your Edge Router</h2>
                            <p className="desc">Now that the controller is ready, you can start the edge router created with
                                the 'express' process. You can start this router locally by running:
                            </p>
                            <pre className='prettyprint'>
                                startRouter</pre>
                            <p className="desc">Example output:</p>
                            <pre className='prettyprint'>
                                $ startRouter
                                Express Edge Router started as process id: 1296. log located at: /home/vagrant/.ziti/quickstart/bullseye/bullseye-edge-router.log</pre>
                            <h4>If you would like to stop your Controller or Router at any point you can do so with the
                                following commands:</h4>
                            <pre className='prettyprint'>
                                stopRouter 
                                stopController </pre>
                        </fieldset>
                        
                    </div>
                </form>
            </div>
        </div>
        </StepperWizard>

        </OpenZitiLayout>
    );
}
