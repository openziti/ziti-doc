import React, {type ReactNode} from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';
import {PageMetadata, ThemeClassNames} from "@docusaurus/theme-common";
import SkipToContent from "@theme/SkipToContent";
import AnnouncementBar from "@theme/AnnouncementBar";
import Navbar from "@theme/Navbar";
import clsx from "clsx";
import ErrorBoundary from "@docusaurus/ErrorBoundary";
import ErrorPageContent from "@theme/ErrorPageContent";
import OpenZitiFooter from "../../components/OpenZitiFooter";
import StarUs from "../../components/StarUs";
import styles from './styles.module.css';
import LayoutProvider from "@theme/Layout/Provider";
import OpenZitiLayout from "../../components/OpenZitiLayout";

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): ReactNode {
    const {
        children,
        noFooter,
        // Not really layout-related, but kept for convenience/retro-compatibility
        title,
        description,
    } = props;

    return (
        <OpenZitiLayout>
            {children}
        </OpenZitiLayout>
    );
}
