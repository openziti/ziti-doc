import React, { type ReactNode } from 'react';
import { NetFoundryLayout } from '@netfoundry/docusaurus-theme/ui';
import { openZitiFooter } from '../../components/footer';

const starProps = {
    repoUrl: 'https://github.com/openziti/ziti',
    label: 'Star OpenZiti on GitHub',
};

export default function Layout({ children }: { children: ReactNode }): ReactNode {
    return (
        <NetFoundryLayout footerProps={openZitiFooter} starProps={starProps}>
            {children}
        </NetFoundryLayout>
    );
}
