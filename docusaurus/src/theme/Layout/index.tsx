import React, {type ReactNode} from 'react';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';
import OpenZitiLayout from "../../components/OpenZitiLayout";

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): ReactNode {
    const {
        children,
    } = props;

    return (
        <OpenZitiLayout>
            {children}
        </OpenZitiLayout>
    );
}
