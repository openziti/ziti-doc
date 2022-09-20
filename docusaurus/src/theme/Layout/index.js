import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './styles.module.css';
import GitHubButton from "react-github-btn";
export default function Layout(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
  } = props;
  useKeyboardNavigation();
  return (
    <LayoutProvider>
      <PageMetadata title={title} description={description} />

      <SkipToContent />

      <AnnouncementBar />

        <div style={{display: "flex", flexFlow: "column", width: "100%"}}>
            <div style={{backgroundImage: "linear-gradient(90deg, #0068F9FF 0%, #F4044DFF 100%)", display:"flex", flexFlow: "row wrap", flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%"} }>
                <span style={{color: "whitesmoke"}}>Star us on GitHub&nbsp;</span>
                <span style={{height: "20px"}}>
            <GitHubButton href="https://github.com/openziti/ziti" data-icon="octicon-star" data-show-count="true" aria-label="Star buttons/github-buttons on GitHub">Star</GitHubButton>
          </span>
            </div>
        </div>
      <Navbar />

      <div
        className={clsx(
          ThemeClassNames.wrapper.main,
          styles.mainWrapper,
          wrapperClassName,
        )}>
        <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
          {children}
        </ErrorBoundary>
      </div>

      {!noFooter && <Footer />}
    </LayoutProvider>
  );
}
