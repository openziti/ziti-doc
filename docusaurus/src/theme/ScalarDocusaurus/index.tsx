import Layout from '@theme/Layout';
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Scalar?: {
            createApiReference(el: Element, config: object): { destroy(): void };
        };
    }
}

type Props = {
    route: { configuration: Record<string, unknown>; id: string };
};

export const ScalarDocusaurus = ({ route }: Props) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.Scalar || !ref.current) return;
        const instance = window.Scalar.createApiReference(ref.current, {
            ...route.configuration,
            hideDarkModeToggle: true,
        });
        return () => instance?.destroy();
    }, []);

    return (
        <Layout>
            <div ref={ref} />
        </Layout>
    );
};

export default ScalarDocusaurus;
