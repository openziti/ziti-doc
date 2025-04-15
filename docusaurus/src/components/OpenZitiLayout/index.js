import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer'
import OpenZitiFooter from "../../components/OpenZitiFooter";
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './styles.module.css';
import StarUs from "../../components/StarUs";

export default function OpenZitiLayout(props) {
  const {
      children,
      style,
      noFooter,
      className,
      // Not really layout-related, but kept for convenience/retro-compatibility
      title,
      description,
      bgColor,
  } = props;
  useKeyboardNavigation();
  return (
    <LayoutProvider>
      <PageMetadata title={title} description={description} />
      <SkipToContent />
      <AnnouncementBar />
      <StarUs/>
      <Navbar />
      <div className={clsx(ThemeClassNames.wrapper.main, styles.ozLayoutMainWrapper, className,)}>
          <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
              {children}
          </ErrorBoundary>
          {!noFooter && <OpenZitiFooter />}
      </div>
    </LayoutProvider>
  );
}
