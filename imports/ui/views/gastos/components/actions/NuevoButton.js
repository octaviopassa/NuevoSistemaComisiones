import React from "react";
import { useGastosData } from "../../store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useLocation, useNavigate } from "react-router-dom";

export const NuevoButton = () => {
  const { resetData, documentos, pagarASeleccionado, estatus } =
    useGastosData();
  // const history = useLocation()?.state;
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const isBlank =
    documentos.length === 0 ||
    (pagarASeleccionado === "" && !documentos.length);

  const handleNuevo = async () => {
    if (!isBlank && !estatus.oldFolio && estatus.estatus !== "CANCELADO") {
      const result = await MySwal.fire({
        title: "¿Deseas cambiar el folio?",
        confirmButtonText: "Continuar",
        showCancelButton: true,
        text: `Tienes ${documentos.length} documento${
          documentos.length > 1 ? "s" : ""
        } guardado${
          documentos.length > 1 ? "s" : ""
        }. Si cambias el folio se borrarán.`,
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        icon: "warning",
      });

      if (!result.isConfirmed) {
        return;
      }
      // if (history?.plaza || history?.folio) {
      //   history.folio = null;
      //   history.plaza = null;
      // }
      resetData();
      window.scrollTo(0, 0);
    } else {
      // if (history?.plaza || history?.folio) {
      //   history.folio = null;
      //   history.plaza = null;
      // }
      resetData();
      window.scrollTo(0, 0);
    }
    navigate("/gastos");
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
