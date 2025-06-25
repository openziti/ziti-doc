import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function OpenZitiHorizontalSection(props: { children?: any; className?: any; style?: any; }) {
    const {
        children,
        className,
        style,
    } = props;
    
    return (
        <section className={clsx(className, styles.ozHorizontalSectionRoot, styles.ozhsContent)} style={style}>
            {children}
        </section>
    );
}
