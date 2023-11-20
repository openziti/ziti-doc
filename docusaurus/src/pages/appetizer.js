import React from "react";
import AsciinemaWidget from '../../src/components/AsciinemaWidget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import {H1} from "./index";
import Link from '@docusaurus/Link';
import styles from "./index.module.css";
import OpenZitiLayout from "../components/OpenZitiLayout";

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

                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>
                            <div style={{display: 'flex'}}>
                                <div style={{flex: 2}}>
                                    <p>
                                        Watch here as we start up a client server on a local device. There is a reflect
                                        server,
                                        hosted by OpenZiti, that simply echoes back the content that is sent. The real
                                        magic
                                        here is, we are able to start up this client side server without even having
                                        prior
                                        authorization to access the network. This client side server is designed to
                                        automatically provision an identity from the network controller if one is not
                                        provided.
                                    </p>

                                </div>
                                <div style={{flex: 4}}>
                                    <p>
                                        <AsciinemaWidget fit={false} src="/appetizer.cast" rows={15} loop={true}
                                                         autoplay={1}
                                                         preload={true}/>
                                    </p>
                                </div>
                            </div>
                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>
                            <div style={{display: 'flex'}}>
                                <div style={{flex: 2}}>
                                    <p>
                                        The architectural drawing shows how there is a zero trust network allowing
                                        two devices to connect over the OpenZiti network. There is the server host,
                                        this is a virtual private server which has OpenZiti baked into the application
                                        by utilizing the OpenZiti SDK. On the other hand, there is the client device,
                                        this is the device connecting to the Appetizer demo application (like the
                                        Reflect Demo above). The client device also has OpenZiti baked into the
                                        application via an SDK. By utilizing the SDK on both endpoints, the traffic is
                                        encrypted before it ever leaves the application.
                                    </p>
                                </div>

                                <div style={{flex: 4}}>
                                    <img src="/img/Appetizer-demo-arch.svg" alt="Appetizer Demo Architecture"
                                         style={{display: "flex", alignItems: "center", height: "300px"}}/>
                                </div>

                            </div>
                            <div style={{display: 'flex', flexBasis: "100%", height: 10}}></div>
                            <div style={{display: 'flex'}}>
                                <Link className="button button--primary" to="https://appetizer-staging.openziti.io/">
                                    <p>Try the Demo</p>
                                </Link>
                            </div>


                        </div>
                    </div>
                </div>
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}

export default App;
