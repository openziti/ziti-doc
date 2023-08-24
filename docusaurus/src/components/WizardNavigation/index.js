import React from 'react';

export default function OpenZitiLayout(props) {
  const {
    index,
    isCurrent,
    title,
    onIndexChange
  } = props;

  function goto(e) {
      var indexChange = Number(e.currentTarget.dataset.id);
      onIndexChange(indexChange);
  }

  return (
    <li role="tab" className={((Number(index)==0) ? 'first' : '')+" "+((isCurrent) ? 'current' : '')} aria-disabled="false" aria-selected="true">
        <span onClick={goto} data-id={index}>
            <span class="current-info audible"> </span>
            <div class="title">
                <span class="step-number">{Number(index)+1}</span>
                <span class="step-text">{title}</span>
            </div>
        </span>
    </li>
  );
}
