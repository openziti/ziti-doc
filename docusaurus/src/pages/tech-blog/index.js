import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "@docusaurus/Link";
import { NetFoundryHorizontalSection, NetFoundryLayout } from "@netfoundry/docusaurus-theme/ui";
import styles from "../new-landing/styles.module.css";
import { starProps } from "../../components/consts";
import { openZitiFooter } from "@openziti/src/components/footer";
export default function BlogGrid(props) {
    const { items } = props; // items passed from BlogListPage
    return (_jsx(NetFoundryLayout, { className: styles.landing, starProps: starProps, footerProps: openZitiFooter, children: _jsx(NetFoundryHorizontalSection, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: items?.map(({ content: BlogPost }) => {
                        const { metadata } = BlogPost;
                        return (_jsxs(Link, { to: metadata.permalink, className: "rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300", children: [metadata.frontMatter.image && (_jsx("img", { src: metadata.frontMatter.image, alt: metadata.title, className: "w-full h-48 object-cover" })), _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-1", children: metadata.title }), _jsx("p", { className: "text-sm text-gray-600", children: metadata.authors?.map((a) => a.name).join(", ") }), _jsx("div", { className: "flex items-center text-xs text-gray-500 mt-2 space-x-3" })] })] }, metadata.permalink));
                    }) }) }) }) }));
}
