import React, { useState } from "react";
import Page from "../../components/global/Page";
import {
  GastosToolbar,
  TableGastos,
  TableResumen,
} from "./components";

const Gastos = () => {
  const [documentos, setDocumentos] = useState([]); 
  //? Creo un store para los documentos?
  //! Se ocuparia en la tabla de resumen. Por ahora no.
  const [clientesVisible, setClientesVisible] = useState(false);
  const [tipoGastos, setTipoGastos] = useState([]);

  return (
    <Page name="Gastos">
      <GastosToolbar
        setTipoGastos={setTipoGastos}
        setClientesVisible={setClientesVisible}
      />

      <TableGastos
        clientesVisible={clientesVisible}
        tipoGastos={tipoGastos}
        setDocumentos={setDocumentos}
        documentos={documentos}
      />

      <TableResumen />
    </Page>
  );
};

export default Gastos;
