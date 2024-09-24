import React, { useState } from "react";
import { ModalLoading } from "../../../components/global/ModalLoading";
import { GuardarButton } from "./modals/actions/GuardarButton";

// TODO: Refactor this. Cada boton de accion sera un componente con su respectiva funcion.
export const GastosActions = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="row mt-3 text-center">
      <div className="col-sm-12">
        <button
          type="button"
          className="btn btn-warning bg-warning-900color-warning-900
              waves-effect waves-themed text-white mr-2"
        >
          <i className="fal fa-search"></i> Consultar
        </button>
        <button
          type="button"
          className="btn btn-primary waves-effect waves-themed mr-2"
        >
          <i className="fal fa-plus"></i> Nuevo
        </button>
        <GuardarButton setLoading={setLoading} />
        <button
          type="button"
          className="btn btn-secondary bg-warning-900color-warning-900
              waves-effect waves-themed text-white ml-2 mr-2"
        >
          <i className="fal fa-print"></i> Imprimir
        </button>
        <button
          type="button"
          className="btn btn-info waves-effect waves-themed mr-2"
        >
          <i className="fal fa-check"></i> Autorizar
        </button>
        <button
          type="button"
          className="btn btn-danger waves-effect waves-themed"
        >
          <i className="fal fa-ban"></i> Cancelar
        </button>
      </div>

      <ModalLoading
        title=""
        message="Por favor espere..."
        isOpen={loading}
        toggle={() => {}}
      />
    </div>
  );
};
