import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import OpenZitiLayout from "../../components/OpenZitiLayout";
import OpenZitiHorizontalSection from "../../components/OpenZitiHorizontalSection";
import SuperpowersSection  from "../../components/SuperpowersSection";
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';
import timeline from './timeline.module.css';
import useBaseUrl from "@docusaurus/useBaseUrl";

function HeroSection({ className }) {
    return (
    <OpenZitiHorizontalSection className={className}>
        <div className={styles.aaHero}>
            <h1>Cloak Your Network. <br/> Secure Services not IPs</h1>
            <div className={styles.aaHeroBadgeDiv}><span className={styles.aaHeroBadgeSpan}>Sponsored by NetFoundry</span></div>
        </div>
        <section className={clsx(styles.aaSection, styles.aaHero)}>
            <p>Managing IP addresses is now, not the future. Stop trying to manage and segment IPs. Manage identities 
                and services using easy-to-understand policies.</p>
            <div className={styles.aaHeroButtons}>
                <a href="/docs/learn/quickstarts/network/hosted" className={styles.aaBtn}>Host OpenZiti Yourself</a>
                <a href="https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/" className={clsx(styles.aaBtn, styles.aaBtnOutline)}>Try NetFoundry Cloud For Free</a>
            </div>
        </section>
        <div className={styles.aaHeroGraphic}>
            <ThemedImage
                alt="OpenZiti Network Visualization"
                sources={{
                    light: useBaseUrl("/img/openziti-overview.svg"),
                    dark: useBaseUrl("/img/openziti-overview-dark.svg"),
                }}
                className={styles.aaHeroGraphicImg}
            />
        </div>
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
            <p>{description}</p>
        </div>
    </div>
);

let btns = clsx(styles.btn, styles.btnSecondary);
const GetStartedSection = () => (
    <OpenZitiHorizontalSection className={clsx(styles.aaGetStarted2)} >
        <section className={clsx(styles.aaSection, styles.aaGetStarted)} id="get-started">
            <div className={styles.aaContainer}>
                <div className={styles.aaStartContent}>
                    <h2 className={styles.aaStartTitle}>Ready to Deploy Your Overlay?</h2>
                    <p className={styles.aaStartText}>
                        Whether you're looking for enterprise-grade support or prefer to self-host, OpenZiti offers flexible deployment options to meet your needs.
                    </p>
                    <div className={styles.aaStartOptions}>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>Enterprise Managed</h3>
                            <p className={styles.aaStartOptionText}>
                                Get fully managed zero trust networking with NetFoundry's enterprise offering, complete with SLAs and 24/7 support.
                            </p>
                            <a href="#" className={btns}>Learn More</a>
                        </div>
                        <div className={styles.aaStartOption}>
                            <h3 className={styles.aaStartOptionTitle}>Self-Hosted</h3>
                            <p className={styles.aaStartOptionText}>
                                Deploy and manage your own OpenZiti network with our comprehensive documentation and community support.
                            </p>
                            <a href="#" className={btns}>View Deployment Guide</a>
                        </div>
                    </div>
                    <a href="#" className={btns}>Join the Community</a>
                </div>
            </div>
        </section>
    </OpenZitiHorizontalSection>
);

const SuperPowerSection = () => (
    <OpenZitiHorizontalSection>
        <SuperpowersSection
            className={clsx(styles.aaSection, styles.aaSuperpowersSection)}
            title="Why OpenZiti"
            description="OpenZiti's unique capabilities redefine secure networking for the modern age."
            superpowers={[
                { icon: '🧬', title: 'Strong Identities', description: 'IP can\'t be used for identity. PKCS 11, X.509, JWT. OpenZiti leverages cryptographically verifiable identities.' },
                { icon: '🔒', title: 'No Open Ports', description: 'Services completely vanish from the internet, becoming invisible to attackers and scan tools.' },
                { icon: '📦', title: 'App-Level Embedding', description: 'SDK integration brings zero trust directly into your applications, no agents required.' },
                { icon: '🧠', title: 'Identity-Aware Access', description: 'Fine-grained authorization with posture checking ensures only valid users and devices connect.' },
                { icon: '🔁', title: 'Smart Routing', description: 'Ziti Fabric intelligently routes traffic through the optimal path for security and performance.' },
                { icon: '🔐', title: 'End-to-End Encryption', description: 'Libsodium-powered cryptography ensures data is secure in transit, always.' },
                { icon: '🧭', title: 'Private DNS', description: 'Authenticated, private DNS resolves service names to secure overlay tunnels, not IP addresses.' },
                { icon: '🕵️‍♂️', title: 'No Port Inference', description: 'Single-port transport prevents service fingerprinting and port scanning vulnerabilities.' },
            ]}
        />
    </OpenZitiHorizontalSection>
);

const TimeLineSection = () => (
    <OpenZitiHorizontalSection className={clsx(styles.aaTimelineSection)} >
        <section className={clsx(styles.aaSection, styles.aaEvolution)} id="evolution">
            <div className={styles.aaContainer}>
                <div className={styles.aaSectionHeader}>
                    <h2>Zero Trust Evolution</h2>
                    <p>The journey from traditional networking to true embedded zero trust.</p>
                </div>
                <div className={styles.aaTimeline}>
                    <TimelineItem icon="1" title="IP Underlay / Legacy VPNs"
                                  description="Traditional networks expose services to the internet. VPNs provide access to entire network segments rather than specific services."
                    />
                    <TimelineItem icon="2" title="Ziti Tunnelers"
                                  description="Deploy tunnelers to eliminate open ports and enable zero trust access without modifying applications."
                    />
                    <TimelineItem icon="3" title="Hybrid Approach"
                                  description="Some applications use embedded SDKs while others leverage tunnelers, providing flexibility during transition."
                    />
                    <TimelineItem icon="4" title="Embedded SDK"
                                  description="True zero trust at the application level with SDKs integrated directly into your code. No agents, no tunnelers."
                    />
                    <TimelineItem icon="5" title="Fully Abstracted Services"
                                  description="Identity-bound, protocol-agnostic services with completely invisible infrastructure. The future of secure networking."
                    />
                </div>
            </div>
        </section>
    </OpenZitiHorizontalSection>
);

function App() {
    return (
        <OpenZitiLayout className={styles.landing}>
            <HeroSection className={styles.aaHeroSection}/>
            <SuperPowerSection />
            <TimeLineSection />
            <GetStartedSection />
        </OpenZitiLayout>
    );
}

export default App;
