import React, {useEffect, useRef} from 'react';
import Layout from '@theme/Layout';

const CDN_URL = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference';

export default function EdgeManagementApiReference(): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        function injectBackLink(container: HTMLElement) {
            if (container.querySelector('#nf-back-to-docs')) return;
            const sidebar = container.querySelector<HTMLElement>('.t-doc__sidebar');
            if (!sidebar) return;
            const link = document.createElement('a');
            link.id = 'nf-back-to-docs';
            link.href = '/docs/openziti/learn/introduction';
            link.textContent = '← Back to docs';
            link.addEventListener('click', (e) => {
                if (window.history.length > 1) { e.preventDefault(); window.history.back(); }
            });
            Object.assign(link.style, {
                display: 'block',
                padding: '6px 16px',
                fontSize: '13px',
                color: 'var(--scalar-color-2)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--scalar-border-color)',
            });
            sidebar.insertBefore(link, sidebar.firstChild);
        }

        function mount() {
            const scalar = (window as any).Scalar;
            if (!scalar || !ref.current) return;
            scalar.createApiReference(ref.current, {
                spec: {url: 'https://get.openziti.io/spec/management.yml'},
                darkMode: document.documentElement.getAttribute('data-theme') === 'dark',
                hideDarkModeToggle: true,
            });
            const observer = new MutationObserver(() => {
                if (!ref.current) return;
                injectBackLink(ref.current);
                if (ref.current.querySelector('#nf-back-to-docs')) observer.disconnect();
            });
            observer.observe(ref.current, {childList: true, subtree: true});
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
        <Layout title="Edge Management API reference" noFooter>
            <div ref={ref} />
        </Layout>
    );
}
