import React, { useState } from "react";
import Page from "../../components/global/Page";
import { GastosToolbar, TableGastos, TableResumen } from "./components";

const Gastos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [clientesVisible, setClientesVisible] = useState(false);

  return (
    <Page name="Gastos">
      <GastosToolbar setClientesVisible={setClientesVisible} />

      <TableGastos
        clientesVisible={clientesVisible}
        setDocumentos={setDocumentos}
        documentos={documentos}
      />

      <TableResumen />
    </Page>
  );
};

export default Gastos;
