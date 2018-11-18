import React from "react";
import PropTypes from "prop-types";

import styles from "./MainLayout.module.scss";

const MainLayout = ({ children }) => (
  <main className={styles.LayoutContainer}>{children}</main>
);

MainLayout.propTypes = {
  children: PropTypes.element.isRequired
};

export default MainLayout;
