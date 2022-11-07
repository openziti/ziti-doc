import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiLayout from "../components/OpenZitiLayout";
import Link from '@docusaurus/Link';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from "./index.module.css"
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";

export function Highlight(props) {
    const { children } = props;
    return (
        <span style={{color: "var(--ifm-color-primary)", fontWeight: "bold"}}> {children}</span>
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
        <h3 style={style}>{children}</h3>
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
            <OpenZitiHorizontalSection style={{fontSize:"large", padding: "0px"}}>
                <H1>About OpenZiti</H1>
                <p>OpenZiti is taking application and API security to the  to making secure connectivity simple and accessible by <Highlight>replacing
                    infrastructure with software</Highlight>. The world is software, your network security needs to
                    react with the speed of software; it needs to be software. OpenZiti is bringing ground-breaking,
                    zero trust networking principles directly inside applications through SDKs but OpenZiti isn't just
                    for developers. The project also provides everything you'll need on your zero trust journey.
                </p>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection style={{fontSize:"large", padding: "0px"}}>
                <H2>Who is OpenZiti For?</H2>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <p>Software is for <Highlight>everyone</Highlight> - that's why its eating the world. Is OpenZiti for:
                            developers, operators, security professionals, businesses, home users, you name it! OpenZiti
                            provides all the tooling needed to run your own zero trust overlay network. If you would rather
                            not maintain your own network, you can let NetFoundry manage the network for you. Head over to
                            <Link to={"https://netfoundry.io/pricing/"}> the NetFoundry Console</Link> and learn more.</p>
                    </div>
                </div>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection style={{fontSize:"large", padding: "0px"}}>
                <div className={styles.whoziticontainer}>
                    <div className={styles.whozitititlelogo}>
                        <h2 style={{display:"flex", paddingRight: "10px", margin: "0px"}}>OpenZiti</h2>
                        <img src={"/img/github.svg"} style={{display:"flex", alignItems:"center", height: "75px"}}/>
                    </div>
                    <div className={styles.whozitibullets}>
                        <div style={{display:"flex", flexDirection: "column"}}>
                            <p>Host everything yourself</p>
                            <p>Some people learn best by <Highlight>doing</Highlight></p>
                            <p>Fully configurable - you're running it all after all!</p>
                        </div>
                        <div className={styles.indexCtas}>
                            <Link className="button button--primary" to="#build-a-network">
                                <p>Get OpenZiti</p>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className={styles.whoziticontainer}>
                    <div className={styles.whozitititlelogo}>
                        <h2 style={{display:"flex", paddingRight: "10px", margin: "0px"}}>ZEDS</h2>
                        <img src={"/img/zeds.png"} style={{display:"flex", alignItems:"center", height: "75px"}}/>
                    </div>
                    <div className={styles.whozitibullets}>
                        <div style={{display:"flex", flexDirection: "column"}}>
                            <p><Highlight>No installation necessary</Highlight>! Just sign up and go!</p>
                            <p>Easiest path for SDK-only solutions</p>
                            <p>No network customization</p>
                        </div>
                        <div style={{display:"flex", alignItems:"center"}}>
                            <div className={styles.indexCtas}>
                                <Link className="button button--primary" to="https://zeds.openziti.org/">
                                    <p>Get ZEDS!</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.whoziticontainer}>
                    <div className={styles.whozitititlelogo}>
                        <h2 style={{display:"flex", paddingRight: "10px", margin: "0px"}}>CloudZiti</h2>
                        <img src={"/img/nf.svg"} style={{display:"flex", alignItems:"center", width: "75px"}}/>
                    </div>
                    <div className={styles.whozitibullets}>
                        <div style={{display:"flex", flexDirection: "column"}}>
                            <p>Easy to get started, fully customizable</p>
                            <p><Highlight>Managed and supported</Highlight> by NetFoundry</p>
                            <p>OpenZiti with none of the maintenance</p>
                        </div>
                        <div style={{display:"flex", alignItems:"center"}}>
                            <div className={styles.indexCtas}>
                                <Link className="button button--primary" to="https://netfoundry.io/pricing/">
                                    <p>Try CloudZiti</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection style={{backgroundColor:"var(--ifm-background-surface-color-dark)"}}>
                <div style={{display:"flex", flexDirection: "column", alignItems:"center"}}>
                <div style={{display:"flex", flexDirection: "row", alignItems:"center"}}>
                    <div style={{fontSize:"large", display:"flex", flexDirection: "column", maxWidth: 900}}>
                        <H1>Solving the <Highlight>challenge</Highlight> of network security with <Highlight>software</Highlight></H1>
                    </div>
                    <img src={useBaseUrl("img/appsicon.png")} width="360px" style={{minWidth: "200px", paddingLeft: "20px", paddingTop: "75px", paddingBottom: "75px"}}/>
                </div>
                </div>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection style={{fontSize:"large"}}>
                <H1>OpenZiti Provides</H1>

                <p>OpenZiti makes it easy to embed zero trust, programmable networking directly into your app. Deploy your
                    own zero trust, high performance network using any Internet connection! Say goodbye to your outmoded VPN.
                </p>

                <div style={{display:"flex", flexWrap: "wrap", justifyContent:"center"}}>
                    <ul style={{maxWidth: "800px"}}>
                        <li className={styles.cardz}>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <H3 style={{minWidth: "250px", margin: "0px"}}>
                                    <Link to="/docs/introduction/openziti-is-software#fabric">The OpenZiti Fabric</Link>
                                </H3>
                            </div>
                            <p>a scalable, pluggable, overlay networking mesh with built-in smart routing</p>
                        </li>
                        <li className={styles.cardz}>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <H3 style={{minWidth: "250px", margin: "0px"}}>
                                    <Link to="/docs/introduction/openziti-is-software#edge">The OpenZiti Edge</Link>
                                </H3>
                            </div>
                            <p>the components providing secure, zero trust entry points into the overlay network</p>
                        </li>
                        <li className={styles.cardz}>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <H3 style={{minWidth: "250px", margin: "0px"}}>
                                    <Link to="/docs/introduction/openziti-is-software#sdks">The OpenZiti SDKs</Link>
                                </H3>
                            </div>
                            <p>allows developers to embed zero trust principles directly into applications</p>
                        </li>
                        <li className={styles.cardz}>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <H3 style={{minWidth: "250px", margin: "0px"}}>
                                    <Link to="/docs/core-concepts/clients/tunnelers/">OpenZiti Tunneling Applications</Link>
                                </H3>
                            </div>
                            <p>not all apps can be recompiled with zero trust principles built in. For those situations, these components provide the bridge from classic underlay networks to the overlay</p>
                        </li>
                    </ul>
                </div>

            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection style={{backgroundColor: "var(--background-color-1)"}}>
                <H1 id="build-a-network">Get Started - Build a Network!</H1>
                <p>Ziti make zero trust easy but you'll need an overlay network in order to start on your zero trust
                    journey. We recommend you start with a simple network. Once you understand the basic concepts it can make
                    more sense to move on to more complex network topologies. Choose what sort of network you want to build.
                </p>
                <div style={{display:"flex", flexWrap: "wrap", alignItems:"center", alignContent: "center", alignSelf:"center"}}>
                    <a className="btn-hover sdkbutton-button"
                       href={useBaseUrl("docs/quickstarts/network/local-no-docker")}>
                        <div className="sdkbutton-text">Everything Local<br/>(Not Docker)</div>
                    </a>
                    <a className="btn-hover sdkbutton-button"
                       href={useBaseUrl("docs/quickstarts/network/local-with-docker")}>
                        <div className="sdkbutton-text">Everything Local<br/>(I love Docker)</div>
                    </a>
                    <a className="btn-hover sdkbutton-button"
                       href={useBaseUrl("docs/quickstarts/network/local-docker-compose")}>
                        <div className="sdkbutton-text">Everything Local<br/>(Docker Compose)</div>
                    </a>
                    <a className="btn-hover sdkbutton-button"
                       href={useBaseUrl("docs/quickstarts/network/hosted")}>
                        <div className="sdkbutton-text">Host It Myself<br/>(I have a server)</div>
                    </a>
                </div>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection>
                <H1>I Have a Network! What's Next?</H1>
                <p>
                    Fantastic! Now that you have a <Link to="/docs/introduction/intro">OpenZiti Network</Link> all
                    setup and ready to go, the next step is learning about all of the pieces which go into it. There's a lot to learn and
                    <Link to={"/docs/introduction/intro"}> our docs</Link> are there to help you understand any extra details you need help
                    ironing out. If the docs aren't complete or aren't helpful, we love seeing issues filed for how to improve
                    them! Or, if you're feeling up for it, we'd love to see any PRs to make the docs better you wish to
                    contribute! You'll find a more extensive list of the <Link to={"/docs/quickstarts/network/"}> quickstarts
                we have here.</Link>
                </p>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection>
                <H1>Get Started With an SDK</H1>
                <p>The OpenZiti project offers numerous SDKs to start with. Pick your favorite language and follow
                    along with a simple tutorial! If your favorite language is not shown, perhaps you can use the C SDK and
                    integrate via <a href="https://en.wikipedia.org/wiki/Foreign_function_interface">FFI.</a></p>
                <div className="col-lg-12">
                    <div className="centerrow buttonrow">
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-c/tree/main/programs">
                            <img src={useBaseUrl("img/clang-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">C Lang</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/sdk-golang/tree/main/example">
                            <img src={useBaseUrl("img/golang-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">Go</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-py/tree/main/sample">
                            <img src={useBaseUrl("img/python-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">Python</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-swift">
                            <img src={useBaseUrl("img/swift-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">Swift</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-jvm/tree/main/samples">
                            <img src={useBaseUrl("img/kotlin-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">Android</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-jvm/tree/main/samples">
                            <img src={useBaseUrl("img/java-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">Java</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-nodejs">
                            <img src={useBaseUrl("img/nodejs.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">NodeJS</div>
                        </a>
                        <a className="sdkbutton-button"
                           href="https://github.com/openziti/ziti-sdk-csharp">
                            <img src={useBaseUrl("img/csharp-logo.svg")} className="sdkbutton-image"/>
                            <div className="sdkbutton-text">C# (.NET)</div>
                        </a>
                    </div>
                </div>
            </OpenZitiHorizontalSection>
            <OpenZitiHorizontalSection>
                <H1>Not Ready to Go Fully App-Embedded?</H1>
                <p>
                    That's ok - zero trust adoption is a journey! Get started with a couple of very simple examples which
                    will get you familiar with the technology overall. These samples will leverage one of the
                    <Link to="/docs/core-concepts/clients/choose"> tunneling apps</Link>.
                </p>
                <div className="col-lg-12">
                    <div className="centerrow buttonrow sdkbuttons">
                        <a className="sdkbutton-button"
                           href={useBaseUrl("docs/quickstarts/services/ztha")}>
                            <img src="https://ziti.dev/wp-content/uploads/2020/02/codealt.png"
                                 className="sdkbutton-image"/>
                            <div className="sdkbutton-text">Simple Webapp</div>
                        </a>
                    </div>
                </div>
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}
