import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NetFoundryLayout } from '@netfoundry/docusaurus-theme/ui';
import { openZitiFooter } from '../../components/footer';
import { useLocation } from '@docusaurus/router';
const starProps = {
    repoUrl: 'https://github.com/openziti/ziti',
    label: 'Star OpenZiti on GitHub',
};
export default function Layout({ children }) {
    const { pathname } = useLocation();
    const isApiPage = /(api-reference|openapi-reference)$/.test(pathname);
    return (_jsxs(NetFoundryLayout, { footerProps: openZitiFooter, starProps: starProps, children: [isApiPage && (_jsx("div", { style: {
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    borderBottom: '1px solid var(--ifm-hr-border-color)',
                    background: 'var(--ifm-navbar-background-color)',
                }, children: _jsx("button", { onClick: () => { if (typeof window !== 'undefined')
                        window.history.back(); }, style: { fontSize: '0.875rem', color: 'var(--ifm-color-primary)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }, children: "\u2190 Back to docs" }) })), children] }));
}
