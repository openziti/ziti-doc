import React from "react";
import AsciinemaWidget from '../../src/components/AsciinemaWidget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import styles from "./index.module.css";
import OpenZitiLayout from "../components/OpenZitiLayout";
import SideBySide from "../components/SideBySide";
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock'

export function H2(props) {
    const {children} = props;
    return (
        <p className={styles.h2}>{children}</p>
    );
}

function App() {
    const {siteConfig} = useDocusaurusContext();

    return (
        <OpenZitiLayout>
            <OpenZitiHorizontalSection>
                <SideBySide
                    left={
                        <div>
                            <p>Check out how easy it is to start up an application and connect to an existing OpenZiti
                                network.</p>
                            <ul>
                                <li>
                                    <p>Clone the appetizer repo, run the client</p>
                                    <CodeBlock>
                                        <p>git clone https://github.com/openziti-test-kitchen/appetizer.git</p>
                                        <p>go run clients/reflect.go reflectService</p>
                                    </CodeBlock>
                                </li>
                            </ul>
                        </div>
                    }
                    right={
                        <AsciinemaWidget fit={false} src="/appetizer.cast" rows={15} cols={87} loop={true} autoplay={1}
                                         preload={true}/>
                    }
                />
                <SideBySide
                    left={
                        <p>Initially, the VPS is provisioned for hosting the appetizer server and providing access to
                            the internet.</p>
                    }
                    right={
                        <ThemedImage
                            alt={"Appetizer Demo Architecture"}
                            sources={{
                                light: useBaseUrl("/img/Appetizer-demo-step1.svg"),
                                dark: useBaseUrl("/img/Appetizer-demo-step1.dark.svg"),
                            }}
                        />}
                />
                <SideBySide
                    left={
                        <p>An OpenZiti network is created and the appetizer demo is 'zitified'. OpenZiti
                            is baked into the application by using an
                            <a href='/docs/reference/developer/sdk/'> OpenZiti SDK</a></p>
                    }
                    right={
                        <ThemedImage
                            alt={"Appetizer Demo Architecture"}
                            sources={{
                                light: useBaseUrl("/img/Appetizer-demo-step2-light.svg"),
                                dark: useBaseUrl("/img/Appetizer-demo-step2.dark.svg"),
                            }}
                        />}
                />
                <SideBySide
                    left={
                        <p>The client application (Reflect Client in this example) is started, which also has
                            OpenZiti baked in via an SDK. If no identity token is provided, one is requested
                            from the controller.</p>
                    }
                    right={
                        <ThemedImage
                            alt={"Appetizer Demo Architecture"}
                            sources={{
                                light: useBaseUrl("/img/Appetizer-demo-step3-light.svg"),
                                dark: useBaseUrl("/img/Appetizer-demo-step3.dark.svg"),
                            }}
                        />}
                />
                <SideBySide
                    left={
                        <p>The client application uses an identity token to enroll with the network and be given
                            access to the appetizer server. An identity token is automatically retrieved
                            from the appetizer server if not explicitly provided during the reflect client
                            start up. An identity JSON file is generated during enrollment and the end to
                            end zero trust network is fully configured.</p>
                    }
                    right={
                        <ThemedImage
                            alt={"Appetizer Demo Architecture"}
                            sources={{
                                light: useBaseUrl("/img/Appetizer-demo-step4-light.svg"),
                                dark: useBaseUrl("/img/Appetizer-demo-step4.dark.svg"),
                            }}
                        />}
                />
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}

export default App;
