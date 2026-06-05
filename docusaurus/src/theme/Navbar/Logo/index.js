import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
// Swizzled to render two navbar__brand links — NetFoundry + OpenZiti — matching
// the unified-doc deployment. Standalone is openziti-only, so the second brand
// is always the OpenZiti mark.
export default function NavbarLogo() {
    const nfLogo = useBaseUrl('https://netfoundry.io/docs/img/netfoundry-name-and-logo.svg');
    const openzitiLogo = useBaseUrl('https://netfoundry.io/docs/img/openziti-sm-logo.svg');
    return (_jsxs(_Fragment, { children: [_jsx(Link, { className: "navbar__brand", to: "https://netfoundry.io", children: _jsx("img", { className: "navbar__logo_nf", alt: "NetFoundry", src: nfLogo }) }), _jsx(Link, { className: "navbar__brand", to: "/docs/openziti/intro", children: _jsx("img", { className: "navbar__logo", alt: "OpenZiti", src: openzitiLogo }) })] }));
}
