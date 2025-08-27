import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from './styles.module.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  activeIndex: number;
  href?: string;
  header?: string;
  icon?: string;
  hoverIcon?: string;
  iconset?: string;
  ionicon?: string;
  img?: string;
  size?: 'md' | 'lg';
}

function DocsCard(props: Props): JSX.Element {
  const isStatic = typeof props.href === 'undefined';
  const isOutbound = typeof props.href !== 'undefined' ? /^http/.test(props.href) : false;
  const header = props.header === 'undefined' ? null : <header className={clsx(styles.layoutCardHeader)}>{props.header}</header>;
  const hoverIcon = props.hoverIcon || props.icon;

  const content = (
      <>
        <div className={clsx(styles.layoutCardContainer)}>
          <div className={clsx(styles.layoutCardIconRow)}>
            {props.img && <img src={useBaseUrl(props.img)} className={clsx(styles.layoutCardImage)} />}
            {(props.icon || hoverIcon) && (
                <>
                  {props.icon && <img src={useBaseUrl(props.icon)} className={clsx(styles.layoutCardIcon, styles.layoutCardIconDefault)} />}
                </>
            )}
          </div>
          {props.ionicon && <ion-icon name={props.ionicon} className={clsx(styles.layoutCardIonicon)}></ion-icon>}
          {props.iconset && (
              <div className={clsx(styles.layoutCardIconsetContainer)}>
                {props.iconset.split(',').map((icon, index) => (
                    <img
                        src={useBaseUrl(icon)}
                        className={clsx(styles.layoutCardIcon, { [styles.layoutCardIconActive]: index === props.activeIndex })}
                        data-index={index}
                        key={index}
                    />
                ))}
              </div>
          )}
          {props.header && header}
          <div className={clsx(styles.layoutCardContent)}>{props.children}</div>
        </div>
      </>
  );

  const className = clsx({
    [styles.layoutCardWithImage]: props.img,  // Dynamically apply this class
    [styles.layoutCardWithoutImage]: !props.img, // Dynamically apply this class
    [styles.layoutCardSizeLg]: props.size === 'lg',
    [props.className]: props.className,
  });

  if (isStatic) {
    return (
        <div className={className}>
          <div className={clsx(styles.layoutCard)}>{content}</div>
        </div>
    );
  }

  if (isOutbound) {
    return (
        <div className={className}>
          <a className={clsx(styles.layoutCard)} href={props.href} target="_blank">
            {content}
          </a>
        </div>
    );
  }

  const {siteConfig} = useDocusaurusContext();
  const url = siteConfig.customFields?.OPENZITI_DOCS_BASE
      ? useBaseUrl('/' + siteConfig.customFields.OPENZITI_DOCS_BASE + '/' + props.href)
      : props.href;
  return (
      <div className={className}>
        <Link to={url} className={clsx(styles.layoutCard)}>
          {content}
        </Link>
      </div>
  );
}

export default DocsCard;
