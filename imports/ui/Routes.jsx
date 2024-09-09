import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/global/Layout.js";
import Pages from "./views/pages/page";
import Roles from "./views/roles/page";
import Home from "./views/home/page.js";
import Usuarios from "./views/usuarios/page.js";
import Gastos from "./views/gastos/page.js";

export default function RoutesTree({ children }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="roles" element={<Roles />} />
          <Route path="pages" element={<Pages />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="gastos" element={<Gastos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
