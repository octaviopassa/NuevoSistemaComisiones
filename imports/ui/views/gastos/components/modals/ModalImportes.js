import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

export const ModalImportes = ({
  isModalOpen,
  toggle,
  setImportesData,
  importesData,
}) => {
  const handleGuardarImportes = () => {
    toggle();
  };

  const handleImportesChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...importesData,
      [name]: value,
    };

    const impuestos = [
      Number(updatedData.iva_16) || 0,
      Number(updatedData.iva_8) || 0,
      Number(updatedData.ieps) || 0,
      Number(updatedData.ish) || 0,
      Number(updatedData.tua) || 0,
      Number(updatedData.ret) || 0,
    ];

    const totalImpuestos = impuestos.reduce(
      (acc, impuesto) => acc + impuesto,
      0
    );

    updatedData.impuesto = totalImpuestos;
    updatedData.total = Number(updatedData.subtotal || 0) + totalImpuestos;

    setImportesData(updatedData);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={toggle}
      size="lg"
      className="modal-importes"
    >
      <ModalHeader className="bg-primary text-white" toggle={toggle}>
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
                disabled
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
                disabled
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
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
