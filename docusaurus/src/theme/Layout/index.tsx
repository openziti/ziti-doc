import React, { type ReactNode } from 'react';
import { NetFoundryLayout } from '@netfoundry/docusaurus-theme/ui';
import { openZitiFooter } from '../../components/footer';
import { useLocation } from '@docusaurus/router';
const starProps = {
    repoUrl: 'https://github.com/openziti/ziti',
    label: 'Star OpenZiti on GitHub',
};

export default function Layout({ children }: { children: ReactNode }): ReactNode {
    const { pathname } = useLocation();
    const isApiPage = /(api-reference|openapi-reference)$/.test(pathname);

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
                    <button onClick={() => { if (typeof window !== 'undefined') window.history.back(); }} style={{ fontSize: '0.875rem', color: 'var(--ifm-color-primary)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back to docs</button>
                </div>
            )}
            {children}
        </NetFoundryLayout>
    );
}
