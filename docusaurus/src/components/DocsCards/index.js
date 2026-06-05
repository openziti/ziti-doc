import { jsx as _jsx } from "react/jsx-runtime";
import './cards.css';
function DocsCards(props) {
    return _jsx("docs-cards", { class: props.className, children: props.children });
}
export default DocsCards;
