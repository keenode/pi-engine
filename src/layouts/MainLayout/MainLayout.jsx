import React from "react";
import PropTypes from "prop-types";

import styles from "./MainLayout.module.scss";

const MainLayout = ({ children }) => (
  <div className={styles.AppContainer}>
    <main className={styles.LayoutContainer}>{children}</main>
  </div>
);

MainLayout.propTypes = {
  children: PropTypes.element.isRequired
};

export default MainLayout;
