import React from "react";
import "../startup/client/i18n.js";
import Routes from "./Routes.jsx";
import useUserLoggedStore from "./store/userLogged.js";
import Login from "./views/login/page.js";

export const App = () => {
  const { isLogged } = useUserLoggedStore();
  return isLogged ? <Routes /> : <Login />;
};
