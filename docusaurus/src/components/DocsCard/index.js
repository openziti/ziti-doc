import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
function DocsCard(props) {
    const isStatic = typeof props.href === 'undefined';
    const isOutbound = typeof props.href !== 'undefined' ? /^http/.test(props.href) : false;
    const header = props.header === 'undefined' ? null : _jsx("header", { className: clsx(styles.layoutCardHeader), children: props.header });
    const hoverIcon = props.hoverIcon || props.icon;
    const content = (_jsx(_Fragment, { children: _jsxs("div", { className: clsx(styles.layoutCardContainer), children: [_jsxs("div", { className: clsx(styles.layoutCardIconRow), children: [props.img && _jsx("img", { src: props.img, className: clsx(styles.layoutCardImage) }), (props.icon || hoverIcon) && (_jsx(_Fragment, { children: props.icon && _jsx("img", { src: props.icon, className: clsx(styles.layoutCardIcon, styles.layoutCardIconDefault) }) }))] }), props.ionicon && _jsx("ion-icon", { name: props.ionicon, className: clsx(styles.layoutCardIonicon) }), props.iconset && (_jsx("div", { className: clsx(styles.layoutCardIconsetContainer), children: props.iconset.split(',').map((icon, index) => (_jsx("img", { src: icon, className: clsx(styles.layoutCardIcon, { [styles.layoutCardIconActive]: index === props.activeIndex }), "data-index": index }, index))) })), props.header && header, _jsx("div", { className: clsx(styles.layoutCardContent), children: props.children })] }) }));
    const className = clsx({
        [styles.layoutCardWithImage]: props.img, // Dynamically apply this class
        [styles.layoutCardWithoutImage]: !props.img, // Dynamically apply this class
        [styles.layoutCardSizeLg]: props.size === 'lg',
        [props.className]: props.className,
    });
    if (isStatic) {
        return (_jsx("div", { className: className, children: _jsx("div", { className: clsx(styles.layoutCard), children: content }) }));
    }
    if (isOutbound) {
        return (_jsx("div", { className: className, children: _jsx("a", { className: clsx(styles.layoutCard), href: props.href, target: "_blank", children: content }) }));
    }
    return (_jsx("div", { className: className, children: _jsx(Link, { to: props.href, className: clsx(styles.layoutCard), children: content }) }));
}
export default DocsCard;
