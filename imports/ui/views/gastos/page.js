import React, { useState } from "react";
import Page from "../../components/global/Page";
import {
  EstatusGasto,
  GastosToolbar,
  TableCantidades,
  TableGastos,
  TableResumen,
} from "./components";

const Gastos = () => {
  const [clientesVisible, setClientesVisible] = useState(false);

  return (
    <Page name="Gastos">
      <GastosToolbar setClientesVisible={setClientesVisible} />

      <TableGastos clientesVisible={clientesVisible} />

      <div className="row">
        <EstatusGasto />

        <TableResumen />

        <TableCantidades />
      </div>
    </Page>
  );
};

export default Gastos;
