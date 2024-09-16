import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

export const ModalImportes = ({
  modalImportesVisible,
  toggleModalImportes,
  setImportesData,
  importesData,
}) => {

  const handleGuardarImportes = () => {
    toggleModalImportes();
  };

  const handleImportesChange = (e) => {
    setImportesData((prevImportesData) => ({
      ...prevImportesData,
      [e.target.name]: e.target.value,
    }));
  };  

  return (
    <Modal
      isOpen={modalImportesVisible}
      toggle={toggleModalImportes}
      size="lg"
      className="modal-importes"
    >
      <ModalHeader toggle={toggleModalImportes}>
        Importes / Impuestos
      </ModalHeader>
      <ModalBody>
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Fecha</label>
              <input
                type="date"
                className="form-control"
                name="fecha"
                value={importesData.fecha}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>Folio</label>
              <input
                type="text"
                className="form-control"
                name="folio"
                value={importesData.folio}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>Subtotal</label>
              <input
                type="number"
                className="form-control"
                name="subtotal"
                value={importesData.subtotal}
                onChange={handleImportesChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Impuesto</label>
              <input
                type="number"
                className="form-control"
                name="impuesto"
                value={importesData.impuesto}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>IVA_16</label>
              <input
                type="number"
                className="form-control"
                name="iva_16"
                value={importesData.iva_16}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>IVA_8</label>
              <input
                type="number"
                className="form-control"
                name="iva_8"
                value={importesData.iva_8}
                onChange={handleImportesChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>IEPS</label>
              <input
                type="number"
                className="form-control"
                name="ieps"
                value={importesData.ieps}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>ISH</label>
              <input
                type="number"
                className="form-control"
                name="ish"
                value={importesData.ish}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>TUA</label>
              <input
                type="number"
                className="form-control"
                name="tua"
                value={importesData.tua}
                onChange={handleImportesChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Ret</label>
              <input
                type="number"
                className="form-control"
                name="ret"
                value={importesData.ret}
                onChange={handleImportesChange}
              />
            </div>
            <div className="col-md-4">
              <label>Total</label>
              <input
                type="number"
                className="form-control"
                name="total"
                value={importesData.total}
                onChange={handleImportesChange}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleGuardarImportes}>
          Guardar
        </Button>
        <Button color="secondary" onClick={toggleModalImportes}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
