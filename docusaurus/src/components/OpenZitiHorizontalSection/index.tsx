import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function OpenZitiHorizontalSection(props: { children?: any; className?: any; style?: any; id?: any; }) {
    const {
        children,
        className,
        style,
        id
    } = props;
    
    return (
        <section className={clsx(className, styles.ozHorizontalSectionRoot, styles.ozhsContent)} style={style} id={id}>
            {children}
        </section>
    );
}
