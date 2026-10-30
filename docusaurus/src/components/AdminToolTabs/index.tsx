import React, { JSX, ReactNode } from 'react';
import { ToggleTabs } from '@netfoundry/docusaurus-theme/ui';

// Every AdminToolTabs shares the admin-tool group, so one choice switches them all, on this page and later ones.
export default function AdminToolTabs({ children }: { children: ReactNode }): JSX.Element {
    return (
        <ToggleTabs
            groupId="admin-tool"
            label="Showing steps as:"
            options={[
                { value: 'cli', label: <><code>ziti</code> CLI</> },
                { value: 'zac', label: 'ZAC' },
            ]}>
            {children}
        </ToggleTabs>
    );
}
