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
import { useSearchParams } from "react-router-dom";
import { TableTiposDocumentos } from "./components/table/TableTiposDocumentos";

const Gastos = () => {
  const [clientesVisible, setClientesVisible] = useState(false);
  const { resetData } = useGastosData();
  const [searchParams] = useSearchParams();
  const folioParam = searchParams.get("folio");
  const plazaParam = searchParams.get("plaza");

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
      <hr className="my-4" />
      <legend>Archivos</legend>
      <TableTiposDocumentos />
    </Page>
  );
};

export default Gastos;
