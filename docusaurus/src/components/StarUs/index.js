import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';
import GitHubButton from "react-github-btn";

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
      <div className={styles.root}>
          <span style={{color: "whitesmoke"}}>Star us on GitHub&nbsp;</span>
          <span style={{height: "20px"}}>
            <GitHubButton href="https://github.com/openziti/ziti" data-icon="octicon-star" data-show-count="true" aria-label="Star buttons/github-buttons on GitHub">Star</GitHubButton>
          </span>
      </div>
  );
}
