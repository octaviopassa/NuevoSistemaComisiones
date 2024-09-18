import React, { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { usePlazaStore } from "../../store";

export const ModalPlaza = ({ plazas, 
  handleSelectPlaza }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const { plazaSeleccionada } = usePlazaStore();

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <Modal isOpen={modalVisible} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Seleccione la Plaza</ModalHeader>
      <ModalBody>
        <select
          className="custom-select"
          id="selectPlazaModal"
          value={plazaSeleccionada}
          onChange={handleSelectPlaza}
        >
          <option value="">Seleccione...</option>
          {plazas.map((plaza) => (
            <option key={plaza.Codigo} value={plaza.Codigo}>
              {plaza.Nombre}
            </option>
          ))}
        </select>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={toggleModal}>
          Confirmar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
