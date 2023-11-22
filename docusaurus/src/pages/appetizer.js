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
                            <p>Check out how easy it is to start up an application and connect to an existing OpenZiti network.</p>
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
                        <AsciinemaWidget fit={false} src="/appetizer.cast" rows={15} cols={87} loop={true} autoplay={1} preload={true}/>
                    }
                />
                <SideBySide
                    left={
                        <p>"Initially, the VPS is provisioned for hosting the appetizer server and providing access to the internet."</p>
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
            </OpenZitiHorizontalSection>
        </OpenZitiLayout>
    );
}

export default App;
