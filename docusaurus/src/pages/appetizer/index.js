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

    const slideImages = [
        {
            title: <div><H3>Step 1 - Process Startup</H3></div>,
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
            title: <div><H3>Step 2 - Process Connects to Overlay</H3></div>,
            text: <p>After the process starts and bootstraps a strong identity, the <code>Reflect Server</code>
                attaches to the overlay network by connecting to one or more routers. At this point, the
                process is ready to accept connections over the OpenZiti overlay.</p>,
            img: useBaseUrl("/img/appetizer/step2.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step2.svg")
        },
        {
            title: <div><H3>Step 3 - Process Startup</H3></div>,
            text: <p>When you run the reflect client with <code>go run clients/reflect.go</code>,
                the first thing it does is make an HTTP request to the <Highlight>public</Highlight> appetizer http
                server which is responsible for creating a temporary strong identity, useful for the demo.
                You can try that HTTP request on your own if you want at https://appetizer.openziti.io/fixthis.
                </p>,
            img: useBaseUrl("/img/appetizer/step3.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step3.svg")
        },
        {
            title: <div><H3>Step 4 - Process Startup</H3></div>,
            text: <p>After your locally running <code>reflect client</code> starts and retrieves the strong
                identity, it will be ready to connect to the OpenZiti overlay. The identity will also be
                authorized to <Highlight>dial</Highlight> the <code>reflect server</code>.</p>,
            img: useBaseUrl("/img/appetizer/step4.svg"),
            darkImg: useBaseUrl("/img/appetizer/dark-step4.svg")
        },
        {
            title: <div><H3>Step 5 - Process Startup</H3></div>,
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

    return (
        <OpenZitiLayout>
            <OpenZitiHorizontalSection>
                <div style={{display: "flex", alignItems:"center"}}>
                    <img
                        src="https://raw.githubusercontent.com/openziti/branding/main/images/ziggy/closeups/Ziggy-Chef-Closeup.png"
                        height="60px"
                        alt="Ziggy Chef"
                        style={{paddingRight: "20px"}}
                    />
                    <H1 style={{alignContent:"center"}}>Getting a Taste of OpenZiti as an Appetizer</H1>
                </div>
                <hr/>
                <div style={{display: "flex", flexWrap: "wrap", margin:"5px"}}>
                    <div className={style.leftColumn}>
                        <H2>See it in action!</H2>
                        <p>The short video shows you just how quickly and easily you can run a sample
                            application and experience what it's like to connect to an application
                            protected by an OpenZiti overlay network.</p>
                        <br/>
                        <p>To try it yourself, clone the repo and just <code>go run</code> the client</p>
                        <CodeBlock>
                            {trimmedCode}
                        </CodeBlock>
                    </div>
                    <div className={style.column}>
                        <AsciinemaWidget fit={"width"} src="/appetizer.cast" rows={13} cols={85} loop={true} autoplay={1} preload={true} />
                    </div>
                </div>
                <hr/>
                <H2>Taking a Look at What's Going on</H2>
                <SlideShow slides={slideImages} slideClassName={style.defaultSlideStyle}/>
                <hr/>
                <SlideShow slides={[slideImages[0]]} slideClassName={style.defaultSlideStyle}/>
                <SlideShow slides={[slideImages[1]]} slideClassName={style.defaultSlideStyle}/>
                <SlideShow slides={[slideImages[2]]} slideClassName={style.defaultSlideStyle}/>
                <SlideShow slides={[slideImages[3]]} slideClassName={style.defaultSlideStyle}/>
                <SlideShow slides={[slideImages[4]]} slideClassName={style.defaultSlideStyle}/>
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}

export default App;
