import React from "react";
import { useGastosData } from "../../store";

export const NuevoButton = () => {
  const { resetData, documentos, pagarASeleccionado } = useGastosData();
  const isBlank =
    documentos.length === 0 ||
    (pagarASeleccionado === "" && !documentos.length);

  const handleNuevo = () => {
    // TODO: Agregar modal de confirmacion!
    if (!isBlank) {
      resetData();
      window.scrollTo(0, 0);
    } else {
      resetData();
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-primary waves-effect waves-themed mr-2"
      onClick={handleNuevo}
    >
      <i className="fal fa-plus"></i> Nuevo
    </button>
  );
};
