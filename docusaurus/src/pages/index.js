import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import OpenZitiLayout from "../components/OpenZitiLayout";
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import SuperpowersSection  from "../components/SuperpowersSection";
import ThemedImage from '@theme/ThemedImage';
import styles from './new-landing/styles.module.css';
import zt from './new-landing/zt-models.module.css';
import timeline from './new-landing/timeline.module.css';
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";


import { ArrowRight, Shield, Lock, Globe } from 'lucide-react';


function HeroSection({ className }) {
    return (
        <OpenZitiHorizontalSection className={clsx(styles.ozHorizontalSectionRoot, className)}>
            <section className={clsx(styles.aaHeroSection, styles.aaSection)} >
                <div className={clsx(styles.aaHero, styles.aaHeroLeft)}>
                    <h1>Cloak Your Network. <br/> Secure Services not IPs</h1>
                    <div className={styles.aaHeroBadgeDiv}><span className={styles.aaHeroBadgeSpan}>Sponsored by NetFoundry</span></div>
                    <div className={clsx(styles.aaSection, styles.aaHero)}>
                        <p>Managing networks with static IPs, subnets, NAT, and firewalls is complex, fragile, and error-prone. As environments scale across cloud, hybrid, and mobile, traditional IP-based control falls apart. OpenZiti eliminates the headache by making identity—not IP—the core of your network. No more IP conflicts, no more guessing, just secure, zero-trust connectivity that works anywhere.</p>
                        <div className={styles.aaHeroButtons}>
                            <a href="https://netfoundry.io/products/netfoundry-platform/netfoundry-cloud-for-openziti/" className={clsx(styles.aaBtn, styles.aaBtnOutline)}>Try NetFoundry Cloud For Free</a>
                            <a href="/docs/learn/quickstarts/network/hosted" className={styles.aaBtn}>Host OpenZiti Yourself</a>
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

const TimelineItem = ({ icon, title, description }) => (
    <div className={timeline.timelineItem}>
        <div className={timeline.timelineContent}>
            <div className={timeline.timelineHeader}>
                <div className={timeline.timelineIcon}>{icon}</div>
                <h3>{title}</h3>
            </div>
            {description}
        </div>
    </div>
);

function GetStartedSection ({className}) {
    const btns = clsx(styles.btn, styles.btnSecondary);
    return <OpenZitiHorizontalSection className={clsx(styles.aaGetStarted2, styles.ozHorizontalSectionRoot, className)}>
        <section className={clsx(styles.aaSection, styles.aaGetStarted)} id="get-started">
            <div className={styles.aaContainer}>
                <div className={styles.aaStartContent}>
                    <h2 className={styles.aaStartTitle}>Ready to Deploy Your Overlay?</h2>
                    <p className={styles.aaStartText}>
                        Whether you're looking for enterprise-grade support or prefer to self-host, NetFoundry and OpenZiti offer
                        flexible deployment options to meet your needs.
                    </p>
                    <div className={styles.aaStartOptions}>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>Enterprise Managed</h3>
                            <p className={styles.aaStartOptionText}>
                                Get fully managed zero trust networking with NetFoundry's enterprise offering, complete
                                with SLAs and 24/7 support.
                            </p>
                            <a href="https://netfoundry.io/products/netfoundry-platform/netfoundry-cloud-for-openziti/"
                               className={btns}>Learn More</a>
                        </div>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>Self-Hosted</h3>
                            <p className={styles.aaStartOptionText}>
                                Deploy and manage your own OpenZiti network with our comprehensive documentation and
                                community support.
                            </p>
                            <a href="/docs/learn/quickstarts/network/hosted" className={btns}>View Deployment Guide</a>
                        </div>
                    </div>
                    <a href="https://openziti.discourse.group/" className={btns}>Join the Community</a>
                </div>
            </div>
        </section>
    </OpenZitiHorizontalSection>
};

const SuperPowerSection = ({className}) => (
    <OpenZitiHorizontalSection className={clsx(styles.ozHorizontalSectionRoot, className)}>
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
);

function ZeroTrustModel({ className, model, side }) {
    return (
        <OpenZitiHorizontalSection
            className={clsx(
                styles.transitionSection,
                styles.ozHorizontalSectionRoot,
                zt.zeroTrustContainer,
                className
            )}
        >
            <section
                className={clsx(styles.aaSection, styles.aaEvolution, zt.zeroTrustModels)}
            >
                <div className={zt.zeroTrustInner}>
                    <div className={zt.modelsGrid}>
                            <div key={model.id} className={clsx(zt.modelCard)} >
                                {side === 'left' && window.innerWidth >= 850 && (
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
                                    <p className={zt.modelFullname}>{model.fullName}</p>
                                    <p className={zt.modelDescription}>{model.description}</p>
                                    <ul className={zt.benefitsList}>
                                        {model.benefits.map((b, i) => (
                                            <li key={i} className={zt.benefitItem}>
                                                <ArrowRight className={zt.benefitIcon} />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className={zt.idealText}>{model.ideal}</p>
                                </div>

                                {(side !== 'left' || window.innerWidth <= 850) && (
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
        description: "Secures access to applications and services based on identity and context...",
        benefits: [
            "Reduce attack surface by hiding applications from the public internet",
            "Enable secure remote access without VPNs",
            "Apply least privilege access controls",
        ],
        ideal: "Ideal for orgs beginning their zero trust journey with immediate security needs.",
    },
    ztha: {
        id: 'ztha',
        name: "ZTHA",
        fullName: "Zero Trust Host Access",
        icon: <Lock className={clsx(zt.cardIcon, zt.green)} />,
        description: "Extends zero trust principles to secure host-to-host communications...",
        benefits: [
            "Create granular microsegmentation between applications",
            "Protect lateral movement between workloads",
            "Define identity-based policies for host communications",
        ],
        ideal: "Perfect for orgs looking to secure east-west traffic in complex envs.",
    },
    ztaa: {
        id: 'ztaa',
        name: "ZTAA",
        fullName: "Zero Trust Application Access",
        icon: <Lock className={clsx(zt.cardIcon, zt.purple)} />,
        description: "The most comprehensive approach that secures app-to-app communications...",
        benefits: [
            "Achieve end-to-end app security with identity-based controls",
            "Enable secure multi-cloud and hybrid deployments",
            "Eliminate trust between application components",
        ],
        ideal: "The ultimate goal for orgs seeking comprehensive zero trust security...",
    },
};

function ZeroTrustModels () {
    return <>
        <section className={clsx(styles.aaSection)}>
            <h2 className={zt.sectionTitle}>The Right Model For Your Needs</h2>
            <p className={zt.sectionDescription}>
                Implementing zero trust is a journey and every organization has different needs. Depending on your needs, one zero trust model may be better than
                another. Some organizations require different models for different needs. OpenZiti offers three distinct zero trust models, allowing your organization to form a zero trust
                overlay network that works best for you and allowing you to transform to a zero trust implementation at your own pace.
            </p>
        </section>
        <TransitionSection className={clsx(styles.transitionSection, styles.transitionToZeroTrustModels)}/>
        <ZeroTrustModel model={ztModels.ztaa} side='right' className={styles.ztModelZtaa} />
        <ZeroTrustModel model={ztModels.ztha} side='left' className={styles.ztModelZtha}  />
        <ZeroTrustModel model={ztModels.ztna} side='right' className={styles.ztModelZtna}  />
        <TransitionSection className={clsx(styles.transitionSection, styles.transitionFromZeroTrustModels)}/>
    </>;
};

function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
}

function TransitionSection({ children, className }) {
    return (
        <OpenZitiHorizontalSection className={className}>
            {children}
        </OpenZitiHorizontalSection>
    );
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
            <ZeroTrustModels />
            <SuperPowerSection />
            <GetStartedSection />
        </OpenZitiLayout>
    );
}

export default App;

