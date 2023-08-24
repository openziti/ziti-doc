import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

export default function CodeOutput(props) {
    return (
        <pre>
            {props.children}
        </pre>
    );
}
  
  const AdmonitionTypes = {
    ...DefaultAdmonitionTypes,
    'code-output': CodeOutput,
  };
  