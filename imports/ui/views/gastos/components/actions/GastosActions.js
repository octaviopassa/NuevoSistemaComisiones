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
import { AplicarButton } from "./AplicarButton";
import { ConsultarReporteDepositosButton } from "./ConsultarReporteDepositos";

export const GastosActions = () => {
  const { estatus: estatusGastos, selectedRepresentante } = useGastosData();
  const [loading, setLoading] = useState(false);
  const { session } = useUserSession();

  const { estatus, propietario } = estatusGastos;

  return (
    <div className="row mb-3 text-center">
      <div className="d-flex flex-wrap justify-content-center">
        <ConsultarButton />
        <NuevoButton />

        {(estatus === "Nuevo" || estatus === "GRABADO") && propietario && (
          <GuardarButton />
        )}

        {estatus !== "Nuevo" && <ImprimirButton />}

        {selectedRepresentante !== "" && <ConsultarReporteDepositosButton />}

        {estatus === "GRABADO" && session.profile.AUTORIZAR_GASTOS && (
          <AutorizarButton setLoading={setLoading} />
        )}

        {estatus === "AUTORIZADO" && session.profile.DESAUTORIZAR_GASTOS && (
          <DesautorizarButton setLoading={setLoading} />
        )}

        {estatus === "AUTORIZADO" && session.profile.APLICAR_COMISIONES && (
          <AplicarButton setLoading={setLoading} />
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
