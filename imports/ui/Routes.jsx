import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/global/Layout.js";
import Gastos from "./views/gastos/page.js";
import Home from "./views/home/page.js";
import Pages from "./views/pages/page";
import Roles from "./views/roles/page";
import Usuarios from "./views/usuarios/page.js";
import GastosAdmin from "./views/gastosAdmin/page.js";

export default function RoutesTree() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="roles" element={<Roles />} />
          <Route path="pages" element={<Pages />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="gastos" element={<Gastos />} />
          <Route path="gastos/administracion" element={<GastosAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
