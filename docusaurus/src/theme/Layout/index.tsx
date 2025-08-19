import React, {type ReactNode} from 'react';
import { NetFoundryLayout, NetFoundryLayoutProps } from '@openclint/docusaurus-shared';

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    return (
        <NetFoundryLayout starProps={{repoUrl:"https://github.com/openziti/ziti", label:"Star Us on GitHub"}}>
            {props.children}
        </NetFoundryLayout>
    );
}
