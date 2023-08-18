import React from 'react';
import styles from './styles.module.css';

export default function OpenZitiHorizontalSection(props) {
    const { children,style } = props;
    return (
        <span style={style}><span style={{color: "var(--ifm-color-primary)"}}>{children}</span></span>
    );
}
