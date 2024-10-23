import React, { useEffect, useState } from "react";
import Page from "../../components/global/Page";
import {
  EstatusGasto,
  GastosActions,
  GastosToolbar,
  TableCantidades,
  TableGastos,
  TableResumen,
} from "./components";
import { useGastosData } from "./store";

const Gastos = () => {
  const [clientesVisible, setClientesVisible] = useState(false);
  const { resetData } = useGastosData(); // Extrae la función resetData

  useEffect(() => {
    // Llama a resetData al montar el componente para limpiar el estado
    resetData();
  }, []); // Solo al montar el componente

  return (
    <Page name="Gastos">
      <GastosToolbar setClientesVisible={setClientesVisible} />

      <TableGastos clientesVisible={clientesVisible} />

      <div className="row">
        <EstatusGasto />

        <div className="col-sm-5">
          <TableResumen />

          <GastosActions />
        </div>

        <TableCantidades />
      </div>
    </Page>
  );
};

export default Gastos;
