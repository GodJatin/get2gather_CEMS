import React from 'react';
import styles from './AnimatedTitle.module.css';

const AnimatedTitle = () => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title} data-text="Get2Gather">
        Get2Gather
      </h1>
    </div>
  );
};

export default AnimatedTitle;
