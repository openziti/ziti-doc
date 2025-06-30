import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import OpenZitiLayout from "../components/OpenZitiLayout";
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import SuperpowersSection  from "../components/SuperpowersSection";
import ThemedImage from '@theme/ThemedImage';
import styles from './new-landing/styles.module.css';
import zt from './new-landing/zt-models.module.css';
import useBaseUrl from "@docusaurus/useBaseUrl";


import { ArrowRight, Shield, Lock, Globe } from 'lucide-react';


function HeroSection({ className }) {
    return (
        <OpenZitiHorizontalSection className={clsx(styles.ozHorizontalSectionRoot, className)}>
            <section className={clsx(styles.aaHeroSection, styles.aaSection)} >
                <div className={clsx(styles.aaHero, styles.aaHeroLeft)}>
                    <div className={styles.aaHeroTitle}>
                        <h1>Cloak Your Network.<br/>Secure Services not IPs</h1>
                        <div className={styles.aaHeroBadgeDiv}><span className={styles.aaHeroBadgeSpan}>Sponsored by NetFoundry</span></div>
                    </div>
                    <div className={clsx(styles.aaSection, styles.aaHeroText)}>
                        <p>Managing networks with static IPs, subnets, NAT, and firewalls is complex, fragile, and error-prone.
                            As environments scale across cloud, hybrid, and mobile, traditional IP-based control falls apart.
                            OpenZiti eliminates this headache by making identity—not IP—the core of your network.
                            No more IP conflicts, no more guessing, just secure, zero-trust connectivity that works anywhere.</p>
                        <div className={styles.aaHeroButtons}>
                            <a href="#deploy_an_overlay"
                               className={clsx(styles.aaBtn, styles.aaBtnOutline)}>Try NetFoundry For Free</a>
                            <a href={useBaseUrl("/docs/learn/quickstarts/network/hosted")}
                               className={styles.aaBtn}>Host OpenZiti Yourself</a>
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.aaHeroGraphic, styles.aaHeroRight)}>
                    <ThemedImage
                        alt="OpenZiti Network Visualization"
                        sources={{
                            light: useBaseUrl("/img/zt-model-overview-light.svg"),
                            dark: useBaseUrl("/img/zt-model-overview-dark.svg"),
                        }}
                        style={{display: "flex", paddingLeft: "25px"}}
                    />
                </div>
            </section>
        </OpenZitiHorizontalSection>
    );
}

function GetStartedSection ({className}) {
    const btns = clsx(styles.btn, styles.btnSecondary);
    return <OpenZitiHorizontalSection className={clsx(styles.aaGetStarted2, styles.ozHorizontalSectionRoot, className)} id="deploy_an_overlay">
        <section className={clsx(styles.aaSection, styles.aaGetStarted)}>
            <div className={styles.aaContainer}>
                <div className={styles.aaStartContent}>
                    <h2 className={styles.aaStartTitle}>Ready to Deploy Your Overlay?</h2>
                    <p className={styles.aaStartText}>
                        Whether you're looking for enterprise-grade support or prefer to self-host, NetFoundry and OpenZiti offer
                        flexible deployment options to meet your needs.
                    </p>
                    <div className={styles.aaStartOptions}>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>NetFoundry<br />Managed SaaS</h3>
                            <p className={styles.aaStartOptionText}>
                                Cloud-hosted and fully operated by NetFoundry. No infrastructure to manage—just secure, scalable networking with SLAs and 24/7 support.
                            </p>
                            <a href="https://netfoundry.io/products/netfoundry-platform/netfoundry-cloud-for-openziti/"
                               className={btns}>Deploy an Overlay</a>
                        </div>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>NetFoundry<br />Supported On-Prem</h3>
                            <p className={styles.aaStartOptionText}>
                                Self-hosted by you, with full support from NetFoundry. Ideal for regulated environments or where you need to control infrastructure.
                            </p>
                            <a href="https://netfoundry.io/products/netfoundry-platform/netfoundry-on-premise/"
                               className={btns}>Get Started</a>
                        </div>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>Community<br />Self-Hosted</h3>
                            <p className={styles.aaStartOptionText}>
                                Deploy and operate your own OpenZiti network using our documentation and community support—no commercial support included.
                            </p>
                            <a href={useBaseUrl("/docs/learn/quickstarts/network/hosted")} className={btns}>View Deployment Guide</a>
                        </div>
                    </div>
                    <a href="https://openziti.discourse.group/" className={btns}>Join the Community</a>
                </div>
            </div>
        </section>
    </OpenZitiHorizontalSection>
}

function SuperPowerSection ({className}) {
    return <OpenZitiHorizontalSection className={clsx(styles.ozHorizontalSectionRoot, className)}>
        <SuperpowersSection
            className={clsx(styles.aaSection, styles.aaSuperpowersSection)}
            title="Why OpenZiti"
            description="OpenZiti's unique capabilities redefine secure networking for the modern age."
            superpowers={[
                { icon: '🧬', title: 'Strong Identities', description: <p>IPs are not identities. OpenZiti leverages proven cryptographically verifiable identities.</p> },
                { icon: '🧠', title: 'Identity-Aware Access', description: <p>Fine-grained authorization with posture checking ensures only valid identities are allowed to connect to services.</p> },
                { icon: '🔒', title: 'No Open Ports', description: <p>Services completely vanish from the internet, becoming invisible to attackers and scan tools.</p> },
                { icon: '📦', title: 'App-Level Embedding', description: <p>SDK integration brings zero trust directly into your applications, no agents required.</p> },
                { icon: '🔁', title: 'Smart Routing', description: <p>The OpenZiti Fabric intelligently routes traffic through the optimal path for security and performance.</p> },
                { icon: '🔐', title: 'End-to-End Encryption', description: <p>Libsodium-powered cryptography ensures data is secure in transit, <b>always</b>.</p> },
                { icon: '🧭', title: 'Private DNS', description: <p>Authenticated, private DNS resolves service names to secure overlay tunnels, not IP addresses.</p> },
                { icon: '🕵️‍♂️', title: 'No Port Inference', description: <p>Single-port transport prevents service fingerprinting and port scanning vulnerabilities.</p> },
            ]}
        />
    </OpenZitiHorizontalSection>
}

function ZeroTrustModel({ className, model, side, windowSize }) {
    const isClient = windowSize && windowSize.width !== undefined;
    return (
        <OpenZitiHorizontalSection
            className={clsx(
                styles.transitionSection,
                styles.ozHorizontalSectionRoot,
                zt.zeroTrustContainer,
                className
            )}
        >
            <section className={clsx(styles.aaSection, styles.aaEvolution, zt.zeroTrustModels)}>
                <div className={zt.zeroTrustInner}>
                    <div className={zt.modelsGrid}>
                        <div key={model.id} className={clsx(zt.modelCard)} >
                            {side === 'left' && isClient && windowSize.width >= 850 && (
                                <ThemedImage style={{"maxHeight": "500px"}}
                                             alt="OpenZiti Network Visualization"
                                             sources={{
                                                 light: useBaseUrl("/img/zt-model-" + model.id + "-light.svg"),
                                                 dark: useBaseUrl("/img/zt-model-" + model.id + "-dark.svg"),
                                             }}
                                />
                            )}

                            <div className={zt.cardContent}>
                                {model.icon}
                                <h2 className={zt.modelName}>{model.name}</h2>
                                <span className={zt.modelFullname}>{model.fullName}</span>
                                <span className={zt.modelDescription}>{model.description}</span>
                                <ul className={zt.benefitsList}>
                                    {model.benefits.map((b, i) => (
                                        <li key={i} className={zt.benefitItem}>
                                            <ArrowRight className={zt.benefitIcon} />
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                                <span className={zt.idealText}>{model.ideal}</span>
                            </div>

                            {(side !== 'left' || (isClient && windowSize.width) <= 850) && (
                                <ThemedImage style={{"maxHeight": "500px"}}
                                             alt="OpenZiti Network Visualization"
                                             sources={{
                                                 light: useBaseUrl("/img/zt-model-" + model.id + "-light.svg"),
                                                 dark: useBaseUrl("/img/zt-model-" + model.id + "-dark.svg"),
                                             }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </OpenZitiHorizontalSection>
    )
}

const ztModels = {
    ztna: {
        id: 'ztna',
        name: "ZTNA",
        fullName: "Zero Trust Network Access",
        icon: <Lock className={clsx(zt.cardIcon, zt.blue)} />,
        description: "Secures access to applications and services in a secure network zone",
        benefits: [
            <p>Works with <b>existing</b> solutions by using an OpenZiti Router in <span className={styles.trustedNetwork}>trusted network space</span> </p>,
            <p>Network firewall operates in <span className={styles.zeroTrustNetwork}>deny-by-default mode</span></p>,
            <p>OS firewalls require <span className={styles.trustedNetwork}>inbound port rules</span> per service</p>,
            "Allows zero trust network access on devices that can't install an OpenZiti Tunneler",
        ],
        ideal: "Ideal for organizations beginning their zero trust journey with immediate security needs.",
    },
    ztha: {
        id: 'ztha',
        name: "ZTHA",
        fullName: "Zero Trust Host Access",
        icon: <Lock className={clsx(zt.cardIcon, zt.green)} />,
        description: "Extends zero trust principles to secure host communications",
        benefits: [
            <p>Works with <b>existing</b> solutions by using an OpenZiti Tunneler</p>,
            <p>Eliminates network-related trust</p>,
            <p>Network firewall operates in <span className={styles.zeroTrustNetwork}>deny-by-default mode</span></p>,
            <p>OS firewall operates in <span className={styles.zeroTrustNetwork}>deny-by-default mode</span> (unauthorized east-west traffic is impossible)</p>,
            <p><b>Only</b> the host network is a <span className={styles.trustedNetwork}>trusted network zone</span></p>
        ],
        ideal: "Perfect for organizations looking to secure traffic in complex environments.",
    },
    ztaa: {
        id: 'ztaa',
        name: "ZTAA",
        fullName: "Zero Trust Application Access",
        icon: <Lock className={clsx(zt.cardIcon, zt.purple)} />,
        description: <p>The most comprehensive approach to secure application to application communications.</p>,
        benefits: [
            "Simplified deployment model makes securing multi-cloud or hybrid deployments trivial, deploy anywhere",
            <p>Eliminates <b>all</b> network-related trust, including the host network</p>,
            <p>Network firewall operates in <span className={styles.zeroTrustNetwork}>deny-by-default mode</span></p>,
            <p>OS firewall operates in <span className={styles.zeroTrustNetwork}>deny-by-default mode</span> (unauthorized east-west traffic is impossible)</p>,
            "Compiled into applications by leveraging OpenZiti SDKs",
            "Achieves true process to process, end-to-end encryption"
        ],
        ideal: <p>The <b>ultimate</b> goal for organizations seeking comprehensive zero trust security.</p>,
    },
};

function ZeroTrustModels ({ windowSize }) {
    return <>
        <section className={clsx(styles.aaSection, zt.zeroTrustModelIntro)}>
            <h2 className={zt.sectionTitle}>The Right Model For Your Needs</h2>
            <p>
                Implementing zero trust is a journey and every organization has different needs. Depending on your needs, one zero trust model may be better than
                another. Some organizations require different models for different needs. OpenZiti offers three distinct zero trust models, allowing your organization to form a zero trust
                overlay network that works best for you and allowing you to transform to a zero trust implementation at your own pace.
            </p>
        </section>
        <TransitionSection className={clsx(styles.transitionSection, styles.transitionToZeroTrustModels)}/>
        <ZeroTrustModel model={ztModels.ztaa} side='right' className={styles.ztModelZtaa} windowSize={windowSize} />
        <ZeroTrustModel model={ztModels.ztha} side='left' className={styles.ztModelZtha} windowSize={windowSize} />
        <ZeroTrustModel model={ztModels.ztna} side='right' className={styles.ztModelZtna} windowSize={windowSize} />
        <TransitionSection className={clsx(styles.transitionSection, styles.transitionFromZeroTrustModels)}/>
    </>;
}

function TransitionSection({ children, className }) {
    return (
        <OpenZitiHorizontalSection className={className}>
            {children}
        </OpenZitiHorizontalSection>
    );
}


function getWindowSize() {
    if (typeof window !== 'undefined') {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    return { width: 0, height: 0 }; // Default for SSR
}

function App() {
    const [windowSize, setWindowSize] = useState(getWindowSize());
    function handleWindowResize() {
        setWindowSize(getWindowSize());
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
    }, []);

    return (
        <OpenZitiLayout className={styles.landing}>
            <HeroSection className={styles.aaabbb}/>
            <ZeroTrustModels windowSize={windowSize} />
            <SuperPowerSection />
            <GetStartedSection />
        </OpenZitiLayout>
    );
}

export default App;

