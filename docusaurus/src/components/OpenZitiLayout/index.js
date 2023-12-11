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
import StarUs from "../../components/StarUs";

export default function OpenZitiLayout(props) {
  const {
      children,
      style,
      noFooter,
      wrapperClassName,
      // Not really layout-related, but kept for convenience/retro-compatibility
      title,
      description,
      bgColor,
  } = props;
  useKeyboardNavigation();
  return (
      <LayoutProvider>
          <div className={styles.root} style={style}>
              <div className={styles.content}>
                  <PageMetadata title="OpenZiti - open source zero trust networking!" description="OpenZiti is an open source zero trust network applying zero trust principles directly into applications through SDKs or to existing networks using tunnelers" />

                  <SkipToContent />

                  <AnnouncementBar />

                  <StarUs/>

                  <Navbar />
              </div>
              {children}
              <Footer />
          </div>
      </LayoutProvider>
  );
}
