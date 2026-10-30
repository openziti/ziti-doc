import React, {JSX, useLayoutEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from "../new-landing/styles.module.css";
import css from './styles.module.css';
import {NetFoundryLayout} from "@netfoundry/docusaurus-theme/ui";
import {starProps} from "@openziti/src/components/consts"
import {openZitiFooter} from "@openziti/src/components/footer";

/**
 * Standalone page for the OpenZiti Config Builder (built from openziti/ziti-console, `npm run build:config-builder`).
 * The bundle is copied to `static/tools/config-builder-app/` and runs in an iframe, which keeps its global
 * stylesheet away from the docs theme. Everything runs in the visitor's browser; no config leaves it.
 */
export default function ConfigBuilderPage(): JSX.Element {
    const src = useBaseUrl('/tools/config-builder-app/index.html');
    const ref = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState<number>();

    // Fill what is left of the viewport under the navbar and announcement banner, so the footer starts below the fold.
    useLayoutEffect(() => {
        const fit = () => {
            const top = ref.current ? ref.current.getBoundingClientRect().top + window.scrollY : 0;
            setHeight(Math.max(window.innerHeight - top, 480));
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, []);

    return (
        <NetFoundryLayout className={styles.landing} starProps={starProps} footerProps={openZitiFooter}>
            <iframe ref={ref} className={css.frame} style={height ? {height} : undefined} src={src}
                    title="OpenZiti Config Builder" allow="clipboard-write; fullscreen"/>
        </NetFoundryLayout>
    );
}
