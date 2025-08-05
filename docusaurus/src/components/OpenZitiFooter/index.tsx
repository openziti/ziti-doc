import React from 'react';
import clsx from 'clsx';
import OpenZitiHorizontalSection from "../OpenZitiHorizontalSection";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from './styles.module.css';
import {baseUrlConst, cleanUrl, docUrl} from "../../shared";

export default function OpenZitiFooter(props: { className?: any; style?: any; }) {
    const {
        className,
        style,
    } = props;

    return (
        <footer className={clsx(className, styles.ozFooter)} style={style}>
            <OpenZitiHorizontalSection className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerColumn}>
                            <h3>OpenZiti</h3>
                            <p>An open source project enabling developers to embed zero trust networking directly into applications.</p>
                            <div className={styles.footerSocialLinks}>
                                <a href="https://github.com/openziti/ziti" target="_blank" className={styles.footerSocialLink}>
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"></path>
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/company/netfoundry" target="_blank" className={styles.footerSocialLink}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.996 16V10.1C15.996 7.5 15.375 5.49999 12.025 5.49999C10.4 5.49999 9.325 6.39999 8.875 7.29999H8.825V5.79999H5.65V16H8.95V10.7C8.95 9.30001 9.2 7.9 10.925 7.9C12.65 7.9 12.675 9.59999 12.675 10.8V16H15.996Z"></path>
                                        <path d="M0.25 5.79999H3.575V16H0.25V5.79999Z"></path>
                                        <path d="M1.9 0C0.85 0 0 0.85 0 1.9C0 2.95 0.85 3.8 1.9 3.8C2.95 3.8 3.8 2.95 3.8 1.9C3.8 0.85 2.95 0 1.9 0Z"></path>
                                    </svg>
                                </a>
                                <a href="https://www.youtube.com/OpenZiti" target="_blank" className={styles.footerSocialLink}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.969 4.69c-.183-1.358-1.062-2.275-2.361-2.46C12.371 2 8 2 8 2S3.629 2 2.362 2.229c-1.3.186-2.179 1.103-2.361 2.461C0 6.03 0 10 0 10s0 3.97.2 5.31c.183 1.358 1.062 2.275 2.361 2.46C3.63 18 8 18 8 18s4.371 0 5.638-.23c1.3-.185 2.178-1.102 2.361-2.46.2-1.34.2-5.31.2-5.31s0-3.97-.23-5.31zm-8.36, 8.57V6.73l3.76 2.27-3.76 2.26z"></path>
                                    </svg>
                                </a>
                                <a href="https://x.com/OpenZiti" target="_blank" className={styles.footerSocialLink}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.996 3.038c-.59.262-1.219.44-1.885.52.677-.406 1.194-1.05 1.438-1.815-.634.375-1.337.648-2.085.795-.598-.638-1.45-1.038-2.396-1.038-1.813 0-3.283 1.469-3.283 3.282 0 .257.03.507.085.748-2.728-.137-5.147-1.445-6.766-3.43-.282.485-.444 1.05-.444 1.651 0 1.14.58 2.143 1.46 2.732-.538-.017-1.044-.164-1.487-.41v.04c0 1.59 1.13 2.918 2.633 3.219-.276.075-.567.116-.866.116-.211 0-.416-.021-.617-.06.418 1.304 1.63 2.254 3.066 2.28-1.124.883-2.539 1.406-4.077 1.406-.265 0-.526-.015-.785-.046 1.453.933 3.178 1.475 5.032 1.475 6.038 0 9.34-5.002 9.34-9.34 0-.142-.004-.284-.01-.425.641-.463 1.198-1.039 1.638-1.696"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={styles.footerColumn}>
                            <h3>Documentation</h3>
                            <ul className={styles.footerLinks}>
                                <li><a href={docUrl(`learn/quickstarts/services/ztha`)}>Getting Started</a></li>
                                <li><a href={docUrl(`reference/developer/api/`)}>API Reference</a></li>
                                <li><a href={docUrl(`reference/developer/sdk/`)}>SDK Integration</a></li>
                            </ul>
                        </div>
                        <div className={styles.footerColumn}>
                            <h3>Community</h3>
                            <ul className={styles.footerLinks}>
                                <li><a href="https://github.com/openziti/ziti">GitHub</a></li>
                                <li><a href="https://openziti.discourse.group/">Discourse Forum</a></li>
                                <li><a href={cleanUrl(`${baseUrlConst}policies/CONTRIBUTING`)}>Contributing</a></li>
                            </ul>
                        </div>
                        <div className={styles.footerColumn}>
                            <h3>Resources</h3>
                            <ul className={styles.footerLinks}>
                                <li><a href="https://blog.openziti.io">Blog</a></li>
                                <li><a href="https://netfoundry.io/">NetFoundry</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles.footerCopyright}>
                    <p>© 2025 NetFoundry Inc. OpenZiti is an open source project sponsored by NetFoundry. All rights reserved.</p>
                </div>
            </OpenZitiHorizontalSection>
        </footer>
    );
}