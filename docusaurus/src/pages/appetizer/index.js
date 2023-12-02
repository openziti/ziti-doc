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

const BaseURL = "<http://localhost:8000>";




function App() {
    const {siteConfig} = useDocusaurusContext();
    const extraH3Style = {marginBottom:"0px"}
    const slideImages = [
        {
            title: <div><H3 style={extraH3Style}>Step 1 - Process Startup</H3></div>,
            text: <p>When the Appetizer process starts, the first thing it does is create a strong identity
                for itself. This strong identity (represented by the lock icon) will then be used by the server
                listeners established <Highlight>inside</Highlight> the appetizer process. An important point
                is that this server listeners on the OpenZiti Overlay network. It doesn't rely on firewalls
                or web ACLs for securityThere are <Highlight>NO open ports</Highlight> on the
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
    const notifyHandler = (event) => {
        const parts = event.data.split(':');
        const who = parts[0];
        const what = parts.slice(1).join(':');
        const item = <div className={styles.messagebox}>
            <span>{getCurrentTime()}: </span>
            <span className={styles.messageName}>{who}</span>
            <span className={styles.messageText}>{what}</span>
        </div>;

        setItems(prevItems => {
            const newItem = <Expire key={generateUniqueId()} delay="10000" className={styles.chatBubbles}>
                {item}
            </Expire>;
            return [newItem, ...prevItems];
        });

    };

    useEffect(() => {
        const source = new EventSource("http://ziti-edge-controller:18000/sse");
        //const source = new EventSource(`https://appetizer.openziti.io/sse`);
        source.addEventListener('notify', notifyHandler, true);
    }, []);

    const [isDivVisible, setIsDivVisible] = useState(true);
    const toggleDivVisibility = () => {
        setIsDivVisible(!isDivVisible);
    };

    const [liveMsgText, setLiveMsgText] = useState("Show Live Messages!");
    const [liveMsgShown, setLiveMsgShown] = useState(false);
    const [liveMsgHeight, setLiveMsgHeight] = useState("0px");


    const showLiveMessages = () => {
        if (!liveMsgShown) {
            setLiveMsgHeight("100px");
            setLiveMsgText("Hide Live Messages!");
        } else {
            setLiveMsgHeight("0px");
            setLiveMsgText("Show Live Messages!");
        }
        setLiveMsgShown(!liveMsgShown);
        toggleDivVisibility();
    }












    const elementRef = useRef(null);
    const [elementHeight, setElementHeight] = useState(0)
    const maxWidthBeforeWrapEnabled = 1100; // this value (1100) is also referenced in the style.module.css
    useEffect(() => {
        const handleResize = () => {
            // Log the height when the window is resized
            if (elementRef.current && window.innerWidth >= 1100) {
                setElementHeight(elementRef.current.clientHeight);
            } else {
                setElementHeight(300); //if wrapped, just set this to a constant value
            }
        };

        // Attach the event listener when the component mounts
        window.addEventListener('resize', handleResize);
        // Initialize the height on mount
        handleResize();

        // Detach the event listener when the component is unmounted
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [/*dependencies*/]);








    return (
        <OpenZitiLayout>
            <OpenZitiHorizontalSection>
                <div style={{display:"flex"}}>
                    <div style={{display: "flex", flexGrow: 1}}>
                        <img
                            src="https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/closeups/Ziggy-Chef-Closeup.png"
                            height="60px"
                            alt="Ziggy Chef"
                            style={{padding: "0 10px 0 0"}}
                        />
                        <H1>Appetizer: <span style={{display: "inline-block"}}>Taste OpenZiti</span></H1>
                    </div>
                    <div style={{display: "flex", alignItems:"center", flexDirection: "row-reverse"}}>
                        <button className={"button button--primary"} onClick={showLiveMessages}>{liveMsgText}</button>
                    </div>
                </div>
                <hr/>
                <div className={styles.exampleContainer}>
                    <div className={styles.explainer} ref={elementRef}>
                        <p>Experience zero trust in action for yourself! clone the golang repo, and <code>go run</code></p>
                        <CodeBlock>
                            {trimmedCode}
                        </CodeBlock>
                        {whatYouGet}
                    </div>
                    {!isDivVisible && (
                        <div className={styles.asciinema}>
                            <div>
                                <div style={{display:"flex", flexBasis: "33%"}}></div>
                                <div style={{width: "100%"}}>
                                    <AsciinemaWidget fit={"width"} src="/appetizer.cast" loop={true} autoplay={1} preload={true} />
                                </div>
                                <div style={{display:"flex", flexBasis: "33%"}}></div>
                            </div>
                        </div>
                    )
                    }
                    {isDivVisible && (
                        <div className={styles.app} style={{ height: elementHeight }}>
                            <div className={styles.flexContainer}>
                                <div className={styles.pageWrapper}>
                                    <span className={styles.msgSpan}>Realtime "Reflect" Messages</span>
                                    <div>
                                        {items.map((item, index) => item ) }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    }
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
    );
}

export default App;
