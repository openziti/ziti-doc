import React, {type ReactNode} from 'react';
import { NetFoundryLayout, NetFoundryLayoutProps } from '@openclint/docusaurus-shared/ui';
import {openZitiFooter} from "@openziti/src/components/footer";

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    return (
        <NetFoundryLayout starProps={{repoUrl:"https://github.com/openziti/ziti", label:"Star Us on GitHub"}} footerProps={openZitiFooter}>
            {props.children}
        </NetFoundryLayout>
    );
}
