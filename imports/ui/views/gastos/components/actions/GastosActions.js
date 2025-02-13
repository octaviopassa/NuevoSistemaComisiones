import React, { useState } from "react";
import { ModalLoading } from "../../../../components/global/ModalLoading";
import {
  AutorizarButton,
  CancelarButton,
  DesautorizarButton,
  GuardarButton,
  ImprimirButton,
  NuevoButton,
} from ".";
import { useGastosData } from "../../store";
import { ConsultarButton } from "./ConsultarButton";
import { useUserSession } from "../../../../store";

export const GastosActions = () => {
  const { estatus: estatusGastos } = useGastosData();
  const [loading, setLoading] = useState(false);
  const { session } = useUserSession();

  const { estatus, propietario } = estatusGastos;

  return (
    <div className="row mt-3 text-center">
      <div className="d-flex flex-wrap justify-content-center">
        <ConsultarButton />
        <NuevoButton />

        {(estatus === "Nuevo" || estatus === "GRABADO") && propietario && (
          <GuardarButton />
        )}

        {estatus !== "Nuevo" && <ImprimirButton />}

        {estatus === "GRABADO" && session.profile.AUTORIZAR_GASTOS && (
          <AutorizarButton setLoading={setLoading} />
        )}

        {estatus === "AUTORIZADO" && session.profile.DESAUTORIZAR_GASTOS && (
          <DesautorizarButton setLoading={setLoading} />
        )}

        {estatus === "GRABADO" && propietario && (
          <CancelarButton setLoading={setLoading} />
        )}
      </div>

      {/* <ModalLoading
        title=""
        message="Por favor espere..."
        isOpen={loading}
        toggle={() => setLoading(false)}
      /> */}
    </div>
  );
};
