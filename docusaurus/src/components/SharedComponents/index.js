import React from 'react';
import styles from './styles.module.css';

export function WhatIsOpenZiti() {
    return (
        <div>
            <span style={{color: "var(--ifm-color-primary)", fontWeight:"bold"}}>OpenZiti</span> is a free, open-source zero-trust networking platform that makes network services <span style={{color: "var(--ifm-color-primary)", fontWeight:"bold"}}>invisible to unauthorized users</span>. The project provides everything you need to create a zero trust overlay network - controllers, routers, tunnelers, and SDKs - so you can secure both existing applications and new ones. Whether you add zero trust at the network level, the host level, or directly inside your application, every connection is authenticated, authorized, and encrypted end to end.
        </div>
    )
}