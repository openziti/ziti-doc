import React, { JSX } from 'react';
import styles from './styles.module.css';
import GitHubButton from "react-github-btn";

export default function OpenZitiLayout(props?:any): JSX.Element {
    return (
        <div className={styles.starUsRoot}>
            <span style={{color: "whitesmoke"}}>Star us on GitHub&nbsp;</span>
            <span style={{height: "20px"}}>
            <GitHubButton href="https://github.com/openziti/ziti" data-icon="octicon-star" data-show-count="true" aria-label="Star buttons/github-buttons on GitHub">Star</GitHubButton>
          </span>
        </div>
    );
}
