import React from "react";
import AsciinemaWidget from '../../components/AsciinemaWidget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiHorizontalSection from "../../components/OpenZitiHorizontalSection";
import OpenZitiLayout from "../../components/OpenZitiLayout";
import {H1, H2, H3, Highlight} from "../index.js";
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock'
import SlideShow from "../../components/SlideShow";
import style from "./styles.module.css";

function App() {
    const {siteConfig} = useDocusaurusContext();
    const extraH3Style = {marginBottom:"0px"}
    const slideImages = [
        {
            title: <div><H3 style={extraH3Style}>Step 1 - Process Startup</H3></div>,
            text: <p>When the Appetizer process starts, the first thing it does is create a strong identity
                for itself. This strong identity (represented by the lock icon) will then be used by the server
                listeners established <Highlight>inside</Highlight> the appetizer process. These server listeners
                listen on the OpenZiti Overlay network. There are <Highlight>NO open ports</Highlight> on the
                underlay network. These processes can <Highlight>only</Highlight> be accessed over the
                OpenZiti Network</p>,
            img: useBaseUrl("/img/appetizer/step1.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step1.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 2 - Reflect Server Connects to the OpenZiti Network</H3></div>,
            text: <p>After the process starts and bootstraps a strong identity, the <code>Reflect Server</code><span> </span>
                attaches to the overlay network by connecting to one or more routers. At this point, the
                process is ready to accept connections over the OpenZiti overlay.</p>,
            img: useBaseUrl("/img/appetizer/step2.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step2.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 3 - Reflect Client Starts</H3></div>,
            text: <p>When you run the reflect client with <code>go run clients/reflect.go</code>,
                the first thing it does is make an HTTP request to the <Highlight>public</Highlight> appetizer http
                server which is responsible for creating a temporary strong identity, useful for the demo.
                You can try that HTTP request on your own if you want at https://appetizer.openziti.io/fixthis.
                </p>,
            img: useBaseUrl("/img/appetizer/step3.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step3.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 4 - Reflect Client Attaches to the OpenZiti Network</H3></div>,
            text: <p>After your locally running <code>reflect client</code> starts and retrieves the strong
                identity, it will be ready to connect to the OpenZiti overlay. The identity will also be
                authorized to <Highlight>dial</Highlight> the <code>reflect server</code>.</p>,
            img: useBaseUrl("/img/appetizer/step4.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step4.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 5 - Client and Server Communicate Securely</H3></div>,
            text: <p>The client now <Highlight>dials</Highlight> the <code>reflect server</code> over
                the OpenZiti overlay. The <code>reflect server</code> accepts the connection, reads
                the bytes sent, and returns those bytes back to your <code>reflect client</code>.</p>,
            img: useBaseUrl("/img/appetizer/step5.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step5.svg")
        },
    ];

    const codeToCopy = `
        git clone https://github.com/openziti-test-kitchen/appetizer.git
        go run clients/reflect.go reflectService
        `;
    const trimmedCode = codeToCopy
        .trim() // Remove leading and trailing whitespaces
        .split('\n') // Split the string into an array of lines
        .map(line => line.trimLeft() + '\n'); // Trim leading spaces for each line

    const whatYouGet = <div>
            <H3 style={extraH3Style}>What You Get by Adopting an OpenZiti SDK</H3>
            <ul>
                <li>Strong identities. X509 certificates guarantee all entities on the network are who they claim to be.</li>
                <li>Segmented access. Follow the "least privileged access" model. Allow access only to exactly what is needed.</li>
                <li>Protection from port scanning. The application has no listening ports, it's "dark". It's impossible to detect and directly attack.</li>
                <li>Continuous authentication. The world is dynamic. Constant authentication is vital.</li>
                <li>End-to-end encryption. Make sure the data you intend to send is only available to the intended recipient.</li>
            </ul>
        </div>;

    return (
        <OpenZitiLayout>
            <OpenZitiHorizontalSection>
                <div style={{display:"flex"}}>
                    <img
                        src="https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/closeups/Ziggy-Chef-Closeup.png"
                        height="60px"
                        alt="Ziggy Chef"
                        style={{padding: "0 10px 0 0"}}
                    />
                    <H1>Appetizer: <span style={{display: "inline-block"}}>Taste OpenZiti</span></H1>
                    <hr/>
                </div>
                <div className={style.exampleContainer}>
                    <div className={style.explainer}>
                        <H2>See it in action!</H2>
                        <p>Experience zero trust in action for yourself! clone the golang repo, and <code>go run</code></p>
                        <CodeBlock>
                            {trimmedCode}
                        </CodeBlock>
                        {whatYouGet}
                    </div>
                    <div className={style.asciinema}>
                        <div style={{display:"flex", flexBasis: "33%"}}></div>
                        <div style={{width: "100%"}}>
                            <AsciinemaWidget fit={"width"} src="/appetizer.cast" rows={16} cols={85} loop={true} autoplay={1} preload={true} />
                        </div>
                        <div style={{display:"flex", flexBasis: "33%"}}></div>
                    </div>
                </div>
                <hr/>
                <SlideShow slides={slideImages}
                           slideTitle={<H2>Taking a Look at What's Going on</H2>}
                           slideClassName={style.defaultSlideStyle}
                           textClassName={style.slideText}
                           imgClassName={style.slideImage}
                           buttonClassName={"button button--primary"}
                />
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}

export default App;
