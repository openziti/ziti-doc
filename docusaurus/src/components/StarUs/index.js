import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './styles.module.css';
import GitHubButton from "react-github-btn";
export default function OpenZitiLayout(props) {
    return (_jsxs("div", { className: styles.starUsRoot, children: [_jsx("span", { style: { color: "whitesmoke" }, children: "Star us on GitHub\u00A0" }), _jsx("span", { style: { height: "20px" }, children: _jsx(GitHubButton, { href: "https://github.com/openziti/ziti", "data-icon": "octicon-star", "data-show-count": "true", "aria-label": "Star buttons/github-buttons on GitHub", children: "Star" }) })] }));
}
