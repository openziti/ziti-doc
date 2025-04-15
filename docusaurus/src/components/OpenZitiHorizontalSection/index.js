import React from 'react';
import clsx from 'clsx';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

export default function OpenZitiHorizontalSection(props) {
    const {
        children,
        noFooter,
        className,
        // Not really layout-related, but kept for convenience/retro-compatibility
        title,
        description,
        style,
    } = props;
    useKeyboardNavigation();
    
    return (
        <section className={clsx(className, styles.ozHorizontalSectionRoot, styles.ozhsContent)} style={style}>
            {children}
        </section>
    );

}