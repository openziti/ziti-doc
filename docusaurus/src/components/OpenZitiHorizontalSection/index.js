import React from 'react';
import clsx from 'clsx';
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
    let cn = null;
    if (wrapperClassName) {
        cn = wrapperClassName;
    } else {
        cn = styles.ozHorizontalSectionRoot;
    }
    return (
        <div className={clsx(styles.ozhsContent, cn)} style={style}>
            {children}
        </div>
    );

}