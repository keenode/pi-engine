import React from "react";
import { Route, Switch } from "react-router-dom";

import "./App.css";

import MainLayout from "./layouts/MainLayout/MainLayout";
import Home from "./containers/Home/Home";

const App = () => {
  const routes = (
    <Switch>
      <Route path="/" exact component={Home} />
    </Switch>
  );

  return <MainLayout>{routes}</MainLayout>;
};

export default App;
