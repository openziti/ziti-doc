import React from 'react';
import clsx from 'clsx';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

export default function OpenZitiHorizontalSection(props) {
    const {
        children,
        className,
        style,
    } = props;
    useKeyboardNavigation();
    
    return (
        <section className={clsx(className, styles.ozHorizontalSectionRoot, styles.ozhsContent)} style={style}>
            {children}
        </section>
    );
}
