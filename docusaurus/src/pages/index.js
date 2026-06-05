import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useLayoutEffect } from "react";
import clsx from "clsx";
// @ts-ignore
import SuperpowersSection from "../components/SuperpowersSection";
import ThemedImage from '@theme/ThemedImage';
import styles from './new-landing/styles.module.css';
import zt from './new-landing/zt-models.module.css';
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ArrowRight, Lock } from 'lucide-react';
import siteConfig from "@generated/docusaurus.config";
import { cleanUrl } from "@netfoundry/docusaurus-theme/node";
import { NetFoundryHorizontalSection, NetFoundryLayout } from "@netfoundry/docusaurus-theme/ui";
import { useLocation } from "@docusaurus/router";
import { starProps } from "../components/consts";
import Head from "@docusaurus/Head";
function _docUrl(p) {
    if (siteConfig?.customFields?.DOCUSAURUS_BASE_PATH) {
        return cleanUrl(siteConfig?.customFields?.DOCUSAURUS_BASE_PATH + '/' + siteConfig?.customFields?.DOCUSAURUS_DOCS_PATH + '/' + p);
    }
    return p;
}
function HeroSection({ className }) {
    return (_jsx(NetFoundryHorizontalSection, { className: clsx(styles.ozHorizontalSectionRoot, className), children: _jsxs("section", { className: clsx(styles.aaHeroSection, styles.aaSection), children: [_jsxs("div", { className: clsx(styles.aaHero, styles.aaHeroLeft), children: [_jsxs("div", { className: styles.aaHeroTitle, children: [_jsxs("h1", { children: ["Cloak Your Network.", _jsx("br", {}), "Secure Services not IPs"] }), _jsx("div", { className: styles.aaHeroBadgeDiv, children: _jsx("span", { className: styles.aaHeroBadgeSpan, children: "Sponsored by NetFoundry" }) })] }), _jsxs("div", { className: clsx(styles.aaSection, styles.aaHeroText), children: [_jsx("p", { children: "Managing networks with static IPs, subnets, NAT, and firewalls is complex, fragile, and error-prone. As environments scale across cloud, hybrid, and mobile, traditional IP-based control falls apart. OpenZiti eliminates this headache by making identity\u2014not IP\u2014the core of your network. No more IP conflicts, no more guessing, just secure, zero-trust connectivity that works anywhere." }), _jsxs("div", { className: styles.aaHeroButtons, children: [_jsx("a", { href: "#deploy_an_overlay", className: styles.aaBtn, children: "Get Started" }), _jsx("a", { href: "/docs/openziti/intro", className: styles.aaBtn, children: "Read the Docs" })] })] })] }), _jsx("div", { className: clsx(styles.aaHeroGraphic, styles.aaHeroRight), children: _jsx(ThemedImage, { alt: "OpenZiti Network Visualization", sources: {
                            light: useBaseUrl("/img/zt-model-overview-light.svg"),
                            dark: useBaseUrl("/img/zt-model-overview-dark.svg"),
                        }, style: { paddingLeft: "25px", height: "auto" }, width: 1263, height: 1316 }) })] }) }));
}
function GetStartedSection({ className }) {
    const btns = clsx(styles.btn, styles.btnSecondary);
    return _jsx(NetFoundryHorizontalSection, { className: clsx(styles.aaGetStarted2, styles.ozHorizontalSectionRoot, className), id: "deploy_an_overlay", style: { scrollMarginTop: 'var(--ifm-navbar-height)' }, children: _jsx("section", { className: clsx(styles.aaSection, styles.aaGetStarted), children: _jsx("div", { className: styles.aaContainer, children: _jsxs("div", { className: styles.aaStartContent, children: [_jsx("h2", { className: styles.aaStartTitle, children: "Ready to Deploy Your Overlay?" }), _jsx("p", { className: styles.aaStartText, children: "Whether you're looking for enterprise-grade support or prefer to self-host, NetFoundry and OpenZiti offer flexible deployment options to meet your needs." }), _jsxs("div", { className: styles.aaStartOptions, children: [_jsxs("div", { className: styles.aaStartOption, children: [_jsxs("h3", { className: styles.aaStartOptionTitle, children: ["NetFoundry", _jsx("br", {}), "Managed SaaS"] }), _jsx("p", { className: styles.aaStartOptionText, children: "Cloud-hosted and fully operated by NetFoundry. No infrastructure to manage\u2014just secure, scalable networking with SLAs and 24/7 support." }), _jsx("a", { href: "https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/", className: btns, children: "Deploy an Overlay" })] }), _jsxs("div", { className: styles.aaStartOption, children: [_jsxs("h3", { className: styles.aaStartOptionTitle, children: ["NetFoundry", _jsx("br", {}), "Self-Hosted"] }), _jsx("p", { className: styles.aaStartOptionText, children: "Self-hosted by you, with full support from NetFoundry. Ideal for regulated environments or where you need to control infrastructure." }), _jsx("a", { href: "https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/", className: btns, children: "Get Started" })] }), _jsxs("div", { className: styles.aaStartOption, children: [_jsxs("h3", { className: styles.aaStartOptionTitle, children: ["Community", _jsx("br", {}), "Self-Hosted"] }), _jsxs("p", { className: styles.aaStartOptionText, children: ["Deploy and operate your own OpenZiti network using our documentation and community support - no commercial support included. Start with a quickstart, then see our ", _jsx("a", { href: "/docs/openziti/category/deployments/", children: "deployment guides" }), " when you're ready for production."] }), _jsx("a", { href: "/docs/openziti/learn/quickstarts/", className: btns, children: "View Quickstarts" })] })] }), _jsx("a", { href: "https://openziti.discourse.group/", className: btns, children: "Join the Community" })] }) }) }) });
}
function SuperPowerSection({ className }) {
    return _jsx(NetFoundryHorizontalSection, { className: clsx(styles.ozHorizontalSectionRoot, className), children: _jsx(SuperpowersSection, { className: clsx(styles.aaSection, styles.aaSuperpowersSection), title: "Why OpenZiti", description: "OpenZiti's unique capabilities redefine secure networking for the modern age.", superpowers: [
                { icon: '🧬', title: 'Strong Identities', description: _jsx("p", { children: "IPs are not identities. OpenZiti leverages proven cryptographically verifiable identities." }) },
                { icon: '🧠', title: 'Identity-Aware Access', description: _jsx("p", { children: "Fine-grained authorization with posture checking ensures only valid identities are allowed to connect to services." }) },
                { icon: '🔒', title: 'No Open Ports', description: _jsx("p", { children: "Services completely vanish from the internet, becoming invisible to attackers and scan tools." }) },
                { icon: '🔌', title: 'Flexible Integration', description: _jsx("p", { children: "Add zero trust with tunnelers for existing apps, or embed SDKs directly for the strongest posture. No VPN clients required." }) },
                { icon: '🔁', title: 'Smart Routing', description: _jsx("p", { children: "The OpenZiti Fabric intelligently routes traffic through the optimal path for security and performance." }) },
                { icon: '🔐', title: 'End-to-End Encryption', description: _jsxs("p", { children: ["Libsodium-powered cryptography ensures data is secure in transit, ", _jsx("b", { children: "always" }), "."] }) },
                { icon: '🧭', title: 'Private DNS', description: _jsx("p", { children: "Authenticated, private DNS resolves service names to secure overlay tunnels, not IP addresses." }) },
                { icon: '🕵️‍♂️', title: 'No Port Inference', description: _jsx("p", { children: "Single-port transport prevents service fingerprinting and port scanning vulnerabilities." }) },
            ] }) });
}
function ZeroTrustModel({ className, model, side, windowSize, }) {
    const isClient = windowSize && windowSize.width !== undefined;
    return (_jsx(NetFoundryHorizontalSection, { className: clsx(styles.transitionSection, styles.ozHorizontalSectionRoot, zt.zeroTrustContainer, className), children: _jsx("section", { className: clsx(styles.aaSection, styles.aaEvolution, zt.zeroTrustModels), children: _jsx("div", { className: zt.zeroTrustInner, children: _jsx("div", { className: zt.modelsGrid, children: _jsxs("div", { className: clsx(zt.modelCard), children: [side === 'left' && isClient && windowSize.width >= 850 && (_jsx(ThemedImage, { style: { "maxHeight": "500px" }, alt: "OpenZiti Network Visualization", sources: {
                                    light: useBaseUrl("/img/zt-model-" + model.id + "-light.svg"),
                                    dark: useBaseUrl("/img/zt-model-" + model.id + "-dark.svg"),
                                } })), _jsxs("div", { className: zt.cardContent, children: [model.icon, _jsx("h2", { className: zt.modelName, children: model.name }), _jsx("span", { className: zt.modelFullname, children: model.fullName }), _jsx("span", { className: zt.modelDescription, children: model.description }), _jsx("ul", { className: zt.benefitsList, children: model.benefits.map((b, i) => (_jsxs("li", { className: zt.benefitItem, children: [_jsx(ArrowRight, { className: zt.benefitIcon }), _jsx("span", { children: b })] }, i))) }), _jsx("span", { className: zt.idealText, children: model.ideal })] }), (side !== 'left' || (isClient && windowSize.width <= 850)) && (_jsx(ThemedImage, { style: { "maxHeight": "500px" }, alt: "OpenZiti Network Visualization", sources: {
                                    light: useBaseUrl("/img/zt-model-" + model.id + "-light.svg"),
                                    dark: useBaseUrl("/img/zt-model-" + model.id + "-dark.svg"),
                                } }))] }, model.id) }) }) }) }));
}
const ztModels = {
    ztna: {
        id: 'ztna',
        name: "ZTNA",
        fullName: "Zero Trust Network Access",
        icon: _jsx(Lock, { className: clsx(zt.cardIcon, zt.blue) }),
        description: "Secures access to applications and services in a secure network zone",
        benefits: [
            _jsxs("p", { children: ["Works with ", _jsx("b", { children: "existing" }), " solutions by using an OpenZiti Router in ", _jsx("span", { className: styles.trustedNetwork, children: "trusted network space" }), " "] }),
            _jsxs("p", { children: ["Network firewall operates in ", _jsx("span", { className: styles.zeroTrustNetwork, children: "deny-by-default mode" })] }),
            _jsxs("p", { children: ["OS firewalls require ", _jsx("span", { className: styles.trustedNetwork, children: "inbound port rules" }), " per service"] }),
            "Allows zero trust network access on devices that can't install an OpenZiti Tunneler",
        ],
        ideal: "Ideal for organizations that need zero trust access without modifying applications or hosts.",
    },
    ztha: {
        id: 'ztha',
        name: "ZTHA",
        fullName: "Zero Trust Host Access",
        icon: _jsx(Lock, { className: clsx(zt.cardIcon, zt.green) }),
        description: "Extends zero trust principles to secure host communications",
        benefits: [
            _jsxs("p", { children: ["Works with ", _jsx("b", { children: "existing" }), " solutions by using an OpenZiti Tunneler"] }),
            _jsx("p", { children: "Eliminates network-related trust" }),
            _jsxs("p", { children: ["Network firewall operates in ", _jsx("span", { className: styles.zeroTrustNetwork, children: "deny-by-default mode" })] }),
            _jsxs("p", { children: ["OS firewall operates in ", _jsx("span", { className: styles.zeroTrustNetwork, children: "deny-by-default mode" }), " (unauthorized east-west traffic is impossible)"] }),
            _jsxs("p", { children: [_jsx("b", { children: "Only" }), " the host network is a ", _jsx("span", { className: styles.trustedNetwork, children: "trusted network zone" })] })
        ],
        ideal: "The most common production model. Secures existing applications with no code changes.",
    },
    ztaa: {
        id: 'ztaa',
        name: "ZTAA",
        fullName: "Zero Trust Application Access",
        icon: _jsx(Lock, { className: clsx(zt.cardIcon, zt.purple) }),
        description: _jsx("p", { children: "The most comprehensive approach to secure application to application communications." }),
        benefits: [
            "Simplified deployment model makes securing multi-cloud or hybrid deployments trivial, deploy anywhere",
            _jsxs("p", { children: ["Eliminates ", _jsx("b", { children: "all" }), " network-related trust, including the host network"] }),
            _jsxs("p", { children: ["Network firewall operates in ", _jsx("span", { className: styles.zeroTrustNetwork, children: "deny-by-default mode" })] }),
            _jsxs("p", { children: ["OS firewall operates in ", _jsx("span", { className: styles.zeroTrustNetwork, children: "deny-by-default mode" }), " (unauthorized east-west traffic is impossible)"] }),
            "Compiled into applications by leveraging OpenZiti SDKs",
            "Achieves true process to process, end-to-end encryption"
        ],
        ideal: "The strongest security posture. Applications hold their own cryptographic identity.",
    },
};
function ZeroTrustModels({ windowSize }) {
    return _jsxs(_Fragment, { children: [_jsxs("section", { className: clsx(styles.aaSection, zt.zeroTrustModelIntro), children: [_jsx("h2", { className: zt.sectionTitle, children: "The Right Model for Your Needs" }), _jsx("p", { children: "Implementing zero trust is a journey and every organization has different needs. Depending on your needs, one zero trust model may be better than another. Some organizations require different models for different needs. OpenZiti offers three distinct zero trust models, allowing your organization to form a zero trust overlay network that works best for you and allowing you to transform to a zero trust implementation at your own pace." })] }), _jsx(TransitionSection, { className: clsx(styles.transitionSection, styles.transitionToZeroTrustModels) }), _jsx(ZeroTrustModel, { model: ztModels.ztaa, side: 'right', className: styles.ztModelZtaa, windowSize: windowSize }), _jsx(ZeroTrustModel, { model: ztModels.ztha, side: 'left', className: styles.ztModelZtha, windowSize: windowSize }), _jsx(ZeroTrustModel, { model: ztModels.ztna, side: 'right', className: styles.ztModelZtna, windowSize: windowSize }), _jsx(TransitionSection, { className: clsx(styles.transitionSection, styles.transitionFromZeroTrustModels) })] });
}
function TransitionSection({ children, className, }) {
    return (_jsx(NetFoundryHorizontalSection, { className: className, children: children }));
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
    useLayoutEffect(() => {
        window.addEventListener('resize', handleWindowResize);
    }, []);
    const { pathname } = useLocation();
    return (_jsxs(NetFoundryLayout, { className: styles.landing, starProps: starProps, children: [_jsx(Head, { children: _jsx("meta", { "data-rh": "true", name: "nf-pages-version", content: "NFLayoutVersion" }) }), _jsx(HeroSection, { className: styles.aaabbb }), _jsx(GetStartedSection, {}), _jsx(ZeroTrustModels, { windowSize: windowSize }), _jsx(SuperPowerSection, {})] }));
}
export default App;
