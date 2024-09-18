import React, { useState } from "react";
import Page from "../../components/global/Page";
import { useUserSession } from "../../store";
import {
  ModalCombustible,
  ModalImportes,
  GastosToolbar,
  TableGastos,
  TableResumen,
} from "./components";

const Gastos = () => {
  const [combustibles, setCombustibles] = useState([]);
  const [documentos, setDocumentos] = useState([]); //? Creo un state para los documentos?
  const [modalImportesVisible, setModalImportesVisible] = useState(false);
  const [modalCombustibleVisible, setModalCombustibleVisible] = useState(false);
  const [clientesVisible, setClientesVisible] = useState(false);
  const [tipoGastos, setTipoGastos] = useState([]);
  const [importesData, setImportesData] = useState({
    fecha: "",
    folio: "",
    subtotal: "0.00",
    impuesto: "0.00",
    iva_16: "0.00",
    iva_8: "0.00",
    ieps: "0.00",
    ish: "0.00",
    tua: "0.00",
    ret: "0.00",
    total: "0.00",
  });

  const { session } = useUserSession();
  const user = {
    ...session,
  };

  const toggleModalImportes = () => {
    setModalImportesVisible(!modalImportesVisible);
  };

  const toggleModalCombustible = () => {
    setModalCombustibleVisible(!modalCombustibleVisible);
  };

  return (
    <Page name="Gastos">
      <GastosToolbar
        user={user}
        setTipoGastos={setTipoGastos}
        setCombustibles={setCombustibles}
        setClientesVisible={setClientesVisible}
      />

      <TableGastos
        clientesVisible={clientesVisible}
        tipoGastos={tipoGastos}
        toggleModalCombustible={toggleModalCombustible}
        toggleModalImportes={toggleModalImportes}
        setDocumentos={setDocumentos}
        documentos={documentos}
        setImportesData={setImportesData}
        importesData={importesData}
      />

      <TableResumen />

      {modalCombustibleVisible && (
        <ModalCombustible
          modalCombustibleVisible={modalCombustibleVisible}
          toggleModalCombustible={toggleModalCombustible}
          combustibles={combustibles}
          setDocumentos={setDocumentos}
        />
      )}

      {modalImportesVisible && (
        <ModalImportes
          modalImportesVisible={modalImportesVisible}
          toggleModalImportes={toggleModalImportes}
          setImportesData={setImportesData}
          importesData={importesData}
        />
      )}
    </Page>
  );
};

export default Gastos;
