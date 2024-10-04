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
  const { estatus: estatusGastos } = useGastosData();
  const [loading, setLoading] = useState(false);

  const { estatus, propietario } = estatusGastos;

  return (
    <div className="row mt-3 text-center">
      <div className="col-sm-12">
        <NuevoButton />

        {(estatus === "Nuevo" || estatus === "GRABADO") && (
          <GuardarButton setLoading={setLoading} />
        )}

        {estatus !== "Nuevo" && <ImprimirButton />}

        {estatus === "GRABADO" && <AutorizarButton setLoading={setLoading} />}

        {estatus === "AUTORIZADO" && (
          <DesautorizarButton setLoading={setLoading} />
        )}

        {estatus !== "Nuevo" && estatus !== "CANCELADO" && propietario && (
          <CancelarButton setLoading={setLoading} />
        )}
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
