import React from "react";

import styles from "./Play.module.scss";

import WorldRenderer from "../../components/WorldRenderer";

const Play = () => (
  <div className={styles.GameContainer}>
    <WorldRenderer />
  </div>
);

export default Play;
