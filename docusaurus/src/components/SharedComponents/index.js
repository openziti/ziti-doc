import React from 'react';
import styles from './styles.module.css';

export function WhatIsOpenZiti() {
    return (
        <div>
            <span style={{color: "var(--ifm-color-primary)", fontWeight:"bold"}}>OpenZiti</span> is a free and open source project focused on bringing zero trust networking principles directly into any application. The project provides all the pieces required to implement a zero trust overlay network and provides all the tools necessary to integrate zero trust into your existing solutions. The OpenZiti project believes the principles of zero trust shouldn't stop at your network, those ideas belong <span style={{color: "var(--ifm-color-primary)", fontWeight:"bold"}}>in your application</span>.
        </div>
    )
}