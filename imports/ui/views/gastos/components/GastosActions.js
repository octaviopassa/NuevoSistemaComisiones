import React, { useState } from "react";
import { ModalLoading } from "../../../components/global/ModalLoading";
import {
  AutorizarButton,
  CancelarButton,
  DesautorizarButton,
  GuardarButton,
  ImprimirButton,
  NuevoButton,
} from "./actions";
import { useGastosData } from "../store";

export const GastosActions = () => {
  const { estatus } = useGastosData();
  const [loading, setLoading] = useState(false);

  return (
    <div className="row mt-3 text-center">
      <div className="col-sm-12">
        <NuevoButton />

        {estatus.estatus === "Nuevo" && (
          <GuardarButton setLoading={setLoading} />
        )}
        {estatus.estatus !== "Nuevo" && <ImprimirButton />}

        {estatus.estatus === "GRABADO" && (
          <AutorizarButton setLoading={setLoading} />
        )}
        {estatus.estatus === "AUTORIZADO" && (
          <DesautorizarButton setLoading={setLoading} />
        )}
        {estatus.estatus !== "Nuevo" &&
          estatus.estatus !== "CANCELADO" &&
          estatus.propietario && <CancelarButton setLoading={setLoading} />}
      </div>

      <ModalLoading
        title="Cargando..."
        message="Por favor espere..."
        isOpen={loading}
        toggle={() => {}}
      />
    </div>
  );
};
