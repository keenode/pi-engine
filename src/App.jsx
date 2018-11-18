import React from "react";
import { Route, Switch } from "react-router-dom";

import styles from "./App.module.scss";

import MainLayout from "./layouts/MainLayout";
import Home from "./containers/Home";
import Play from "./containers/Play";

const App = () => {
  const routes = (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/play" component={Play} />
    </Switch>
  );

  return (
    <div className={styles.AppContainer}>
      <MainLayout>{routes}</MainLayout>
    </div>
  );
};

export default App;
