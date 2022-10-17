import React from 'react';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

export default function OpenZitiHorizontalSection(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
    style,
  } = props;
  useKeyboardNavigation();

  return (
      <div className={styles.root} style={style}>
          <div className={styles.content}>
              {children}
          </div>
      </div>
  );

}
