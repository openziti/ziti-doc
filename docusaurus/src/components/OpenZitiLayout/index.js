import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import OpenZitiFooter from "../../components/OpenZitiFooter";
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './styles.module.css';
import StarUs from "../../components/StarUs";


export function H1(props) {
    const {children, id} = props;
    return (
        <p id={id} className={styles.h1}>{children}</p>
    );
}
export function H2(props) {
    const {children} = props;
    return (
        <p className={styles.h2}>{children}</p>
    );
}
export function H3(props) {
    const {children,style} = props;
    return (
        <h3 className={styles.h3} style={style}>{children}</h3>
    );
}
export function Highlight(props) {
    const { children } = props;
    return (
        <span style={{color: "var(--ifm-color-primary)", fontWeight: "bold"}}> {children}</span>
    );
}

export function OpenZitiLayout(props) {
  const {
      children,
      style,
      noFooter,
      className,
      footerClassName,
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
          {!noFooter && <OpenZitiFooter className={clsx(styles.ozLayoutFooter, footerClassName)} />}
      </div>
    </LayoutProvider>
  );
}

export default OpenZitiLayout;
