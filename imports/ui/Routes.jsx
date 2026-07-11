import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/global/Layout.js";
import Gastos from "./views/gastos/page.js";
import Pages from "./views/pages/page.js";
import Roles from "./views/roles/page.js";
import Usuarios from "./views/usuarios/page.js";
import GastosAdmin from "./views/gastosAdmin/page.js";
import Login from "./views/login/page.js";
import { useUserLoggedStore } from "./store";
import ReporteDepositos from "./views/reporteDepositos/page.js";
import ReporteComisionesPagadas from "./views/reporteComisionesPagadas/page.js";
import ReporteComisionesPagadasDesglosado from "./views/reporteComisionesPagadasDesglosado/page.js";

const ProtectedRoute = ({ children }) => {
  const { isLogged } = useUserLoggedStore();
  if (!isLogged) return <Navigate to="/login" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isLogged } = useUserLoggedStore();
  if (isLogged) return <Navigate to="/gastos" />;
  return children;
};

export default function RoutesTree() {
  const { isLogged } = useUserLoggedStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/gastos" replace />} />
          <Route path="roles" element={<Roles />} />
          <Route path="pages" element={<Pages />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="gastos" element={<Gastos />} />
          <Route path="gastos/administracion" element={<GastosAdmin />} />
          <Route path="gastos/reporte-depositos" element={<ReporteDepositos />} />
          <Route path="gastos/reporte-comisiones-pagadas" element={<ReporteComisionesPagadas />} />
          <Route path="gastos/reporte-comisiones-pagadas-desglosado" element={<ReporteComisionesPagadasDesglosado />} />
        </Route>
        <Route path="*" element={<Navigate to={isLogged ? "/gastos" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
