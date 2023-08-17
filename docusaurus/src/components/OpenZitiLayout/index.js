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
import StepperWizard from '../StepperWizard';

export default function OpenZitiLayout(props) {
  const {
    children,
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
          <div className={styles.root}>
              <div className={styles.content}>
                  <PageMetadata title="Welcome!" description="OpenZiti is dedicated to make the challenge of secure connectivity simple and accessible by replacing infrastructure with software. The world is software, your secure network needs to be software." />

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
