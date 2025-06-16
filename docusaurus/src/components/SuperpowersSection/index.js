import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const SuperpowerCard = ({ icon, title, description }) => (
    <div className={clsx(styles.aaSuperpowerCard)}>
        <div className={styles.aaSuperpowerIcon}>{icon}</div>
        <h3>{title}</h3>
        {description}
    </div>
);

const SuperpowersSection = ({ title, description, superpowers, className }) => (
    <section className={clsx(className, styles.aaSuperpowers)} id="superpowers">
        <div className={styles.aaSectionHeader}>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
        <div className={styles.aaGrid}>
            {superpowers.map((superpower, index) => (
                <SuperpowerCard
                    key={index}
                    icon={superpower.icon}
                    title={superpower.title}
                    description={superpower.description}
                />
            ))}
        </div>
    </section>
);

export default SuperpowersSection;
