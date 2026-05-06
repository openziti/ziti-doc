import React, {useEffect, useRef} from 'react';
import Layout from '@theme/Layout';
import '@scalar/docusaurus/dist/theme.css';

const CDN_URL = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference';

export default function EdgeClientApiReference(): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        function mount() {
            const scalar = (window as any).Scalar;
            if (!scalar || !ref.current) return;
            scalar.createApiReference(ref.current, {
                spec: {url: 'https://get.openziti.io/spec/client.yml'},
                hideDarkModeToggle: true,
            });
        }

        if ((window as any).Scalar) {
            mount();
            return;
        }

        let script = document.querySelector<HTMLScriptElement>(`script[src="${CDN_URL}"]`);
        if (!script) {
            script = document.createElement('script');
            script.src = CDN_URL;
            document.head.appendChild(script);
        }
        script.addEventListener('load', mount);
        return () => script?.removeEventListener('load', mount);
    }, []);

    return (
        <Layout title="Edge Client API reference" noFooter>
            <div ref={ref} />
        </Layout>
    );
}
