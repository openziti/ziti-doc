import React from "react";
import AsciinemaWidget from '../../src/components/AsciinemaWidget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import {H1} from "./index";
import Link from '@docusaurus/Link';
import styles from "./index.module.css";
import OpenZitiLayout from "../components/OpenZitiLayout";
import SideBySide from "../components/SideBySide";

export function H2(props) {
    const {children} = props;
    return (
        <p className={styles.h2}>{children}</p>
    );
}

function App() {
    const {siteConfig} = useDocusaurusContext();
    const exampleStyle = {
        color: "white",
        backgroundColor: "DodgerBlue",
        padding: "20px",
        fontFamily: "Arial"
    };


    return (
        <OpenZitiLayout>
            <OpenZitiHorizontalSection>
                <div className={styles.getStartedRow}>
                    <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column"}}>
                        <div className={styles.getStartedBoxes}>
                            <H1>Get a Taste of OpenZiti as an Appetizer</H1>

                            <div style={{display: 'flex'}}>
                                <div style={{flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <p>
                                            Check out how easy it is to start up an application and connect to an
                                            existing OpenZiti network.
                                            <ul>
                                                <li>Clone the appetizer client application
                                                    <br/>
                                                    <code>git clone
                                                        https://github.com/openziti-test-kitchen/appetizer.git`</code>
                                                </li>
                                                <li>Run the client application
                                                    <br/>
                                                    <code>go run clients/reflect.go reflectService</code>
                                                </li>
                                            </ul>
                                        </p>
                                        <div style={{display: 'flex', justifyContent: 'center'}}>
                                            <Link className="button button--primary"
                                                  to="https://appetizer-staging.openziti.io/">
                                                <p>Try the Demo</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div style={{flex: 3}}>
                                    <p>
                                        <AsciinemaWidget fit={false} src="/appetizer.cast" rows={15} cols={87}
                                                         loop={true} autoplay={1} preload={true}/>
                                    </p>
                                </div>
                            </div>

                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>
                            <H1>What's Really Going on Here?</H1>
                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>
                            <SideBySide
                                text="Initially, the VPS is provisioned for hosting the appetizer server and providing
                                        access to the internet."
                                imagePath="/img/Appetizer-demo-step1-light.svg"
                                altText="Appetizer Demo Architecture"
                            />
                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>
                            <SideBySide
                                text={`An OpenZiti network is created and the appetizer demo is 'zitified'. OpenZiti
                                        is baked into the application by using an
                                        <a href='/docs/reference/developer/sdk/\'>OpenZiti SDK</a>`}
                                imagePath="/img/Appetizer-demo-step2-light.svg"
                                altText="Appetizer Demo Architecture"
                            />

                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>

                            <SideBySide
                                text="The client application (Reflect Client in this example) is started, which also has
                                        OpenZiti baked in via an SDK. If no identity token is provided, one is requested
                                        from the controller."
                                imagePath="/img/Appetizer-demo-step3-light.svg"
                                altText="Appetizer Demo Architecture"
                            />

                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>

                            <SideBySide
                                text="The client application uses an identity token to enroll with the network and be given
                                        access to the appetizer server. An identity token is automatically retrieved
                                        from the appetizer server if not explicitly provided during the reflect client
                                        start up. An identity JSON file is generated during enrollment and the end to
                                        end zero trust network is fully configured."
                                imagePath="/img/Appetizer-demo-step4-light.svg"
                                altText="Appetizer Demo Architecture"
                            />

                        </div>
                    </div>
                </div>
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}

export default App;
