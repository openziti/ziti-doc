import React from 'react';
import {Redirect} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenZitiLayout from "../components/OpenZitiLayout";
import {WhatIsOpenZiti} from "../components/SharedComponents";
import Link from '@docusaurus/Link';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from "./index.module.css"
import OpenZitiHorizontalSection from "../components/OpenZitiHorizontalSection";
import BrowserOnly from '@docusaurus/BrowserOnly';



export default function Home() {
    return (
        <BrowserOnly>
            {() =>
                <iframe style={{display:"flex", flexGrow: "1", flexDirection:"column"}} src="/landing.html"></iframe>
            }
        </BrowserOnly>
    )
}
