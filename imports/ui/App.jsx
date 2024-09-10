import React from "react";
import Routes from "./Routes.jsx";
import "../startup/client/i18n.js";
import useUserLoggedStore from "./store/userLogged.js";
import Login from "./views/login/page.js";

export const App = () => {
  const { isLogged } = useUserLoggedStore();
  return <div>{isLogged ? <Routes /> : <Login />}</div>;
};
