import React, { useState } from "react";
import Page from "../../components/global/Page";
import useUserSession from "../../store/userSession";
import {
  ModalCombustible,
  ModalImportes,
  GastosToolbar,
  TableGastos,
  TableResumen,
} from "./components";

const Gastos = () => {
  const [plazaSeleccionada, setPlazaSeleccionada] = useState("");
  const [combustibles, setCombustibles] = useState([]);
  const [modalImportesVisible, setModalImportesVisible] = useState(false);
  const [modalCombustibleVisible, setModalCombustibleVisible] = useState(false);
  const [clientesVisible, setClientesVisible] = useState(false);
  const [tipoGastos, setTipoGastos] = useState([]);

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
        setPlazaSeleccionada={setPlazaSeleccionada}
        plazaSeleccionada={plazaSeleccionada}
        user={user}
        setTipoGastos={setTipoGastos}
        setCombustibles={setCombustibles}
        setClientesVisible={setClientesVisible}
      />

      <TableGastos
        clientesVisible={clientesVisible}
        user={user}
        tipoGastos={tipoGastos}
        toggleModalCombustible={toggleModalCombustible}
        toggleModalImportes={toggleModalImportes}
      />

      <TableResumen />

      {modalCombustibleVisible && (
        <ModalCombustible
          modalCombustibleVisible={modalCombustibleVisible}
          toggleModalCombustible={toggleModalCombustible}
          plazaSeleccionada={plazaSeleccionada}
          combustibles={combustibles}
        />
      )}

      {/* Modal para Importes / Impuestos */}
      {modalImportesVisible && (
        <ModalImportes
          modalImportesVisible={modalImportesVisible}
          toggleModalImportes={toggleModalImportes}
        />
      )}
    </Page>
  );
};

export default Gastos;
