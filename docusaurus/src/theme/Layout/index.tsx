import React, { type ReactNode } from 'react';
import { NetFoundryLayout } from '@netfoundry/docusaurus-theme/ui';
import { openZitiFooter } from '../../components/footer';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';

const starProps = {
    repoUrl: 'https://github.com/openziti/ziti',
    label: 'Star OpenZiti on GitHub',
};

export default function Layout({ children }: { children: ReactNode }): ReactNode {
    const { pathname } = useLocation();
    const isApiPage = /\/(api-reference|openapi-reference)$/.test(pathname);
    const backUrl = isApiPage ? pathname.split('/').slice(0, -1).join('/') || '/' : '/';

    return (
        <NetFoundryLayout footerProps={openZitiFooter} starProps={starProps}>
            {isApiPage && (
                <div style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    borderBottom: '1px solid var(--ifm-hr-border-color)',
                    background: 'var(--ifm-navbar-background-color)',
                }}>
                    <Link to={backUrl} style={{ fontSize: '0.875rem', color: 'var(--ifm-color-primary)', textDecoration: 'none' }}>← Back to docs</Link>
                </div>
            )}
            {children}
        </NetFoundryLayout>
    );
}
