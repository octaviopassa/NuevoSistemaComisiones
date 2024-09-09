import React from "react";
import { Outlet } from "react-router";

export const Container = () => {
  return (
    <main id="js-page-content" role="main" className="page-content">
      <Outlet />
    </main>
  );
};
