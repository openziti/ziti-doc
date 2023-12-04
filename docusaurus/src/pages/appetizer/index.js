import React, { useState, useEffect, useRef} from "react";
import AsciinemaWidget from '../../components/AsciinemaWidget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiHorizontalSection from "../../components/OpenZitiHorizontalSection";
import OpenZitiLayout from "../../components/OpenZitiLayout";
import {H1, H2, H3, Highlight} from "../index.js";
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock'
import SlideShow from "../../components/SlideShow";
import Expire from "../../components/Expire";
import styles from "./styles.module.css";

function App() {
    const {siteConfig} = useDocusaurusContext();
    const extraH3Style = {marginBottom:"0px"}
    const strongId = <Highlight>strong identity</Highlight>;
    const strongIds = <Highlight>strong identities</Highlight>;
    const slideImages = [
        {
            title: <div><H3 style={extraH3Style}>Step 1 - Reflect Server Strong Identity</H3></div>,
            text: (<><p>When the Appetizer process starts, it first creates a {strongId} for
                itself. This strong identity (represented by the lock icon) is authorized to "bind" the reflect service,
                creating a listener. The reflect server is then listening on the overlay and able to accept incoming
                connections from other {strongIds}, authorized to participate in the
                OpenZiti network.</p></>),
            img: useBaseUrl("/img/appetizer/step1.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step1.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 2 - Reflect Server Connects to the OpenZiti Network</H3></div>,
            text: (<><p>Now the&nbsp;<code>reflect server</code>&nbsp;is ready to connect to the overlay network. The OpenZiti SDK
                locates any/all routers it's authorized to connect to and using the {strongId} created in step 1, it
                attaches to the overlay network. Since it is authorized to "bind" the reflect service, other
                {strongIds} which are authorized to access this service can do so. Following the principle of
                <Highlight>least privileged access</Highlight>, only {strongIds} authorized to
                access this service will be allowed to. Other {strongIds}, not authorized to connect
                to this service, won't be allowed to access it.</p></>),
            img: useBaseUrl("/img/appetizer/step2.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step2.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 3 - Reflect Client Strong Identity</H3></div>,
            text: (<>
                <p>
                    Your&nbsp;<code>reflect client</code>&nbsp;also needs a {strongId}. You won't be able to connect to the
                   &nbsp;<code>reflect server</code>&nbsp;if you're not authenticated to the OpenZiti overlay, and
                    you can't authenticate to the overlay without a {strongId}! The Appetizer exposes a public
                    endpoint (one not protected by OpenZiti) which creates {strongIds} authorized to connect to
                    the reflect server. The first time you run the reflect client, it will automatically make an HTTP
                    request to retrieve a {strongId} for your use, authorized to communicate to the reflect server.
                </p>
            </>),
            img: useBaseUrl("/img/appetizer/step3.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step3.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 4 - Reflect Client Connects to the OpenZiti Network</H3></div>,
            text: (<><p>Your&nbsp;<code>reflect client</code>&nbsp;now has it's own {strongId} and can connect to the
                OpenZiti overlay! Both reflect client and reflect server established connections to routers deployed on
                the public, open internet. By making outbound connections to edge routers in this way,
                absolutely <Highlight>no inbound firewall holes</Highlight> are needed. The reflect server also
                has <Highlight>no listening ports</Highlight> on the IP-based, underlay network. It only listens for
                connections exclusively on the overlay network! This gives the reflect server and any server adopting
                an OpenZiti SDK, total protection <Highlight>from port scanning</Highlight>.
            </p></>),
            img: useBaseUrl("/img/appetizer/step4.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step4.svg")
        },
        {
            title: <div><H3 style={extraH3Style}>Step 5 - Client and Server Communicate Securely</H3></div>,
            text: (<>
                <p>The&nbsp;<code>reflect client</code>&nbsp;now securely dials the&nbsp;<code>reflect server</code>
                    &nbsp;over the OpenZiti overlay. The client can connect and the server can accept the connections because
                    both are now <Highlight>authenticated</Highlight> and <Highlight>authorized</Highlight>. The
                    client sends bytes to the server, which are reflected back to your locally running reflect
                    client. When the client initiates a connection, <Highlight>end to end encryption</Highlight> is then
                    negotiated as well, further ensuring the security of the connection!
                </p>
                <span style={{paddingTop: "5px"}}>With the connection established, the OpenZiti overlay can now monitor
                    the connection and apply <Highlight>continual authorization</Highlight> as well. As soon as either
                    {strongId} is unauthorized, the connection is terminated.
                </span>
            </>),
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


    const [items, setItems] = useState([
        /*
        <div className={styles.messagebox}>
            <p className={styles.messageName}>randomizer_1235</p>
            <p className={styles.messageText}>here we go</p>
        </div>
         */
    ]);
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    const uniqueId = generateUniqueId();
    // Function to add a new item to the list
    const getCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    const newToast = (who, when, what) => {
        return <div className={styles.toast}>
            <div className={styles.toastHeader}>
                <p>{who}</p>
                <small>{when}</small>
            </div>
            <div className={styles.toastBody}>
                <p>{what}</p>
            </div>
        </div>;
    }

    const notifyHandler = (event) => {
        const parts = event.data.split(':');
        const who = parts[0];
        const what = parts.slice(1).join(':');
        const when = getCurrentTime();

        const toast = newToast(who, when, what);

        setItems(prevItems => {
            const newItem = <Expire key={generateUniqueId()} delay="20000" className={styles.chatBubbles}>
                {toast}
            </Expire>;
            return [newItem, ...prevItems];
        });

    };

    useEffect(() => {
        //const source = new EventSource("http://ziti-edge-controller:18000/sse");
        const source = new EventSource(`https://appetizer.openziti.io/sse`);
        source.addEventListener('notify', notifyHandler, true);
    }, []);

    const [liveMessageVisible, setLiveMessageVisible] = useState(true);
    const [liveMsgText, setLiveMsgText] = useState("Hide Live Messages!");
    const showLiveMessages = () => {
        setLiveMessageVisible(!liveMessageVisible);
        if (!liveMessageVisible) {
            setLiveMsgText("Hide Live Messages!");
        } else {
            setLiveMsgText("Show Live Messages!");
        }
    };

    return (
        <div>
            <div className={styles.liveMsgContainerContainer} style={{ minHeight: "100px", maxHeight: "450px" }}>
                {liveMessageVisible && (
                    <div className={`${styles.liveMsgContainer} ${styles.bgImg1}`}>
                        <span className={styles.msgSpan}>👆 live "Reflect" messages will display here</span>
                        <div className={`${styles.pageWrapper}`}>
                            {items.map((item, index) => item ) }
                        </div>
                    </div>
                )}
            </div>
        <OpenZitiLayout>
            <OpenZitiHorizontalSection>
                <div style={{display:"flex", paddingBottom: "10px"}}>
                    <div style={{display: "flex", flexGrow: 1}}>
                        <img
                            src="https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/closeups/Ziggy-Chef-Closeup.png"
                            height="60px"
                            alt="Ziggy Chef"
                            style={{padding: "0 10px 0 0"}}
                        />
                        <H1>Appetizer: <span style={{display: "inline-block"}}>Taste OpenZiti</span></H1>
                    </div>
                </div>
                <div className={styles.exampleContainer}>
                    <div className={styles.explainer}>
                        <p>If you have go installed, it's as simple as clone the repo, and&nbsp;<code>go run</code>&nbsp;and you
                        can experience application embedded zero trust in action 👇.</p>
                        <CodeBlock>
                            {trimmedCode}
                        </CodeBlock>
                        {whatYouGet}
                    </div>
                    <div className={`${styles.asciinema}`}>
                        <div style={{display:"flex", flexBasis: "33%"}}></div>
                        <div style={{width: "100%", position: "relative"}}>
                            <div style={{display: "flex", position: "absolute", right: "5px", zIndex:1, top: "5px",  alignItems:"center"}}>
                                <button className={"button button--primary"} onClick={showLiveMessages}>{liveMsgText}</button>
                            </div>
                            <AsciinemaWidget fit={"width"} src="/appetizer.cast" loop={true} autoplay={1} preload={true} />
                        </div>
                        <div style={{display:"flex", flexBasis: "33%"}}></div>
                    </div>
                </div>
                <hr/>
                <SlideShow slides={slideImages}
                           slideTitle={<H2>Taking a Closer Look</H2>}
                           slideClassName={styles.defaultSlideStyle}
                           textClassName={styles.slideText}
                           imgClassName={styles.slideImage}
                           buttonClassName={"button button--primary"}
                />
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
        </div>
    );
}

export default App;
