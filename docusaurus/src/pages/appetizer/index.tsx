import React, {useState, useEffect, JSX} from "react";
import AsciinemaWidget from "../../components/AsciinemaWidget";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import SlideShow from "../../components/SlideShow";
import Highlight from "../../components/OpenZitiHighlight";
import Expire from "../../components/Expire";
import styles from "./styles.module.css";
import {
    H1,
    H2,
    H3, MetaProps,
    NetFoundryHorizontalSection,
    NetFoundryLayout,
    version as NFLayoutVersion,
} from "@openclint/docusaurus-shared/ui";
import {starProps} from "@openziti/src/components/consts";
import {openZitiFooter} from "@openziti/src/components/footer";
import ozstyles from "../../styles/openziti.layout.module.css";
import Head from "@docusaurus/Head";

function App(): JSX.Element {
    const castUrl = useBaseUrl("/appetizer.cast");
    const {siteConfig} = useDocusaurusContext();
    const extraH3Style = {marginBottom: "0px"};
    const strongId = <Highlight>strong identity</Highlight>;
    const strongIds = <Highlight>strong identities</Highlight>;

    const slideImages = [
        {
            title: <H3 style={extraH3Style}>Step 1 - Reflect Server Strong Identity</H3>,
            text: (
                <p>
                    When the Appetizer process starts, it first creates a {strongId} for itself. This strong identity (represented
                    by the lock icon) is authorized to "bind" the reflect service, creating a listener. The reflect server is then
                    listening on the overlay and able to accept incoming connections from other {strongIds}, authorized to
                    participate in the OpenZiti network.
                </p>
            ),
            img: useBaseUrl("/img/appetizer/step1.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step1.svg"),
        },
        {
            title: <H3 style={extraH3Style}>Step 2 - Reflect Server Connects to the OpenZiti Network</H3>,
            text: (
                <p>
                    Now the <code>reflect server</code> is ready to connect to the overlay network. The OpenZiti SDK locates any/all{" "}
                    <a href={useBaseUrl("/reference/glossary")}>OpenZiti Routers</a> it&apos;s authorized to connect to and using
                    the {strongId} created in step 1, it attaches to the overlay network. Following the principle of{" "}
                    <Highlight>least privileged access</Highlight>, the server must be authorized to "bind" the reflect service and
                    other {strongIds} must be authorized "dial" the service. Other {strongIds} that are not authorized will not be
                    allowed to access the service.
                </p>
            ),
            img: useBaseUrl("/img/appetizer/step2.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step2.svg"),
        },
        {
            title: <H3 style={extraH3Style}>Step 3 - Reflect Client Strong Identity</H3>,
            text: (
                <p>
                    Your <code>reflect client</code> also needs a {strongId}. You won&apos;t be able to connect to the{" "}
                    <code>reflect server</code> if you&apos;re not authenticated to the OpenZiti overlay, and you can&apos;t
                    authenticate to the overlay without a {strongId}! The Appetizer exposes a public endpoint (one not protected by
                    OpenZiti) which creates {strongIds} authorized to connect to the reflect server. The first time you run the
                    reflect client, it will automatically make an HTTP request to retrieve a {strongId} for your use, authorized to
                    communicate to the reflect server.
                </p>
            ),
            img: useBaseUrl("/img/appetizer/step3.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step3.svg"),
        },
        {
            title: <H3 style={extraH3Style}>Step 4 - Reflect Client Connects to the OpenZiti Network</H3>,
            text: (
                <p>
                    Your <code>reflect client</code> now has its own {strongId} and can connect to the OpenZiti overlay! Both
                    reflect client and reflect server established connections to the{" "}
                    <a href={useBaseUrl("/reference/glossary")}>OpenZiti Routers</a> deployed on the public, open internet. By
                    making outbound connections to edge routers in this way, absolutely <Highlight>no inbound firewall holes</Highlight>{" "}
                    are needed. The reflect server also has <Highlight>no listening ports</Highlight> on the IP-based, underlay
                    network. It only listens exclusively on the overlay! This gives the reflect server and any server adopting an
                    OpenZiti SDK total protection <Highlight>from port scanning</Highlight>.
                </p>
            ),
            img: useBaseUrl("/img/appetizer/step4.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step4.svg"),
        },
        {
            title: <H3 style={extraH3Style}>Step 5 - Client and Server Communicate Securely</H3>,
            text: (
                <>
                    <p>
                        The <code>reflect client</code> now securely dials the <code>reflect server</code> over the OpenZiti overlay.
                        Both are now <Highlight>authenticated</Highlight> and <Highlight>authorized</Highlight>. The client sends bytes
                        to the server, which are reflected back to your locally running client. When the client initiates a
                        connection, <Highlight>end to end encryption</Highlight> is negotiated as well, further ensuring security.
                    </p>
                    <span style={{paddingTop: "5px"}}>
            With the connection established, the overlay can monitor and apply <Highlight>continual authorization</Highlight>{" "}
                        too. As soon as either {strongId} is unauthorized, the connection is terminated.
          </span>
                </>
            ),
            img: useBaseUrl("/img/appetizer/step5.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step5.svg"),
        },
    ];

    const codeToCopy = `
    git clone https://github.com/openziti-test-kitchen/appetizer.git
    cd appetizer
    go run clients/reflect.go reflectService
  `;
    const trimmedCode = codeToCopy
        .trim()
        .split("\n")
        .map(line => line.trimLeft() + "\n");

    const whatYouGet = (
        <div>
            <H3 style={extraH3Style}>What You Get by Adopting an OpenZiti SDK</H3>
            <ul>
                <li>Strong identities. X509 certificates guarantee entities are who they claim.</li>
                <li>Segmented access. Follow the "least privileged access" model.</li>
                <li>Protection from port scanning. The app has no listening ports, it&apos;s "dark".</li>
                <li>Continuous authentication. Constant authentication is vital.</li>
                <li>End-to-end encryption. Ensure data is only available to the intended recipient.</li>
            </ul>
        </div>
    );

    const [items, setItems] = useState<JSX.Element[]>([]);

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    };

    const newToast = (who: string, when: string, what: string) => (
        <div className={styles.toast}>
            <div className={styles.toastHeader}>
                <p>{who}</p>
                <small>{when}</small>
            </div>
            <div className={styles.toastBody}>
                <p>{what}</p>
            </div>
        </div>
    );

    const notifyHandler = (event: MessageEvent) => {
        const parts = event.data.split(":");
        const who = parts[0];
        const what = parts.slice(1).join(":");
        const when = getCurrentTime();
        const toast = newToast(who, when, what);

        setItems(prevItems => [
            <Expire key={generateUniqueId()} delay="20000" className={styles.chatBubbles}>
                {toast}
            </Expire>,
            ...prevItems,
        ]);
    };

    useEffect(() => {
        const source = new EventSource("https://appetizer.openziti.io/sse");
        source.addEventListener("notify", notifyHandler, true);
        return () => source.close();
    }, []);

    const [liveMessageVisible, setLiveMessageVisible] = useState(true);
    const [liveMsgText, setLiveMsgText] = useState("Hide Live Messages!");
    const showLiveMessages = () => {
        setLiveMessageVisible(!liveMessageVisible);
        setLiveMsgText(liveMessageVisible ? "Show Live Messages!" : "Hide Live Messages!");
    };

    const m: MetaProps = {
        title: "Appetizer · OpenZiti Documentation",
        description: "Get started with the Appetizer guide in OpenZiti to learn real-time communication using overlay identities and reflect server.",
        url: "https://netfoundry.io/docs/openziti/appetizer",
        image: "https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/closeups/Ziggy-Chef-Closeup.png",
        siteName: "NetFoundry OpenZiti",
        locale: "en_US",
        twitterX: {
            card: "summary_large_image",
            site: "@OpenZiti",
            creator: "@openziti",
            imageAlt: "OpenZiti Appetizer guide page preview",
        },
    };


    return (
        <NetFoundryLayout
            className={styles.appetizer}
            starProps={starProps}
            footerProps={openZitiFooter}
            meta={m}
        >
            <Head>
                {/* docusaurus doesn't seem to want to add this using the layout, need on pages too*/}
                <meta data-rh="true" name="nf-pages-version" content="NFLayoutVersion" />
            </Head>
            <div id="dont-remove-this-is-here-to-prevent-a-styling-issue">
                <div className={styles.liveMsgContainerContainer} style={{minHeight: "100px", maxHeight: "450px"}}>
                    {liveMessageVisible && (
                        <div className={`${styles.liveMsgContainer} ${styles.bgImg1}`}>
                            <span className={styles.msgSpan}>👆 live "Reflect" messages will display here</span>
                            <div className={styles.pageWrapper}>{items.map(item => item)}</div>
                        </div>
                    )}
                </div>
            </div>
            <NetFoundryHorizontalSection className={styles.ozhs}>
                <div className={styles.appetizerTitle}>
                    <img
                        src="https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/closeups/Ziggy-Chef-Closeup.png"
                        height="60px"
                        alt="Ziggy Chef"
                        style={{padding: "0 10px 0 0"}}
                    />
                    <H1 className={ozstyles.h1}>
                        Appetizer: <span style={{display: "inline-block"}}>Taste OpenZiti</span>
                    </H1>
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
                    <div className={`${styles.asciinema}`} style={{position: 'relative'}}>
                        <div style={{position: 'absolute', top: '5px', right: '5px', zIndex: 1, flexDirection: 'column'}}>
                            <button className={"button button--primary"} onClick={showLiveMessages}>{liveMsgText}</button>
                        </div>
                        <AsciinemaWidget fit={"width"} src={castUrl} loop={true} autoplay={1} preload={true} />
                    </div>
                </div>
                <hr />
                <SlideShow
                    slides={slideImages}
                    className={styles.slideShow}
                    slideTitle={<H2 className={ozstyles.h2}>Taking a Closer Look</H2>}
                    slideClassName={styles.defaultSlideStyle}
                    textClassName={styles.slideText}
                    imgClassName={styles.slideImage}
                    buttonClassName="button button--primary"
                />
            </NetFoundryHorizontalSection>
        </NetFoundryLayout>
    );
}

export default App;
