import React from 'react';
import Admonition from '@theme-original/Admonition';
import MyCustomNoteIcon from '@site/static/img/arrow.svg';

export default function AdmonitionWrapper(props) {
    if (props.type === 'infoa') {
        return <Admonition icon={<></>} title={<></>} {...props} />;
    } else if (props.type === 'info2') {
        return <Admonition icon={<MyCustomNoteIcon />} title={<></>} {...props} />;
    } else if (props.type === 'untitled-admonition') {
        return <Admonition {...props}  />;
    }
    return <Admonition {...props} />;
}