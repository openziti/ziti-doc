import React, {JSX} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Swizzled to render two navbar__brand links — NetFoundry + OpenZiti — matching
// the unified-doc deployment. Standalone is openziti-only, so the second brand
// is always the OpenZiti mark.
export default function NavbarLogo(): JSX.Element {
    const nfLogo       = useBaseUrl('https://netfoundry.io/docs/img/netfoundry-name-and-logo.svg');
    const openzitiLogo = useBaseUrl('https://netfoundry.io/docs/img/openziti-sm-logo.svg');
    return (
        <>
            <Link className="navbar__brand" to="https://netfoundry.io">
                <img className="navbar__logo_nf" alt="NetFoundry" src={nfLogo} />
            </Link>
            <Link className="navbar__brand" to="/docs/openziti/intro/what-is-openziti">
                <img className="navbar__logo" alt="OpenZiti" src={openzitiLogo} />
            </Link>
        </>
    );
}
