import React from "react";
import { useGastosData } from "../../store/useGastosData";

const ConsultarReporteDepositosButton = () => {
  const { selectedRepresentante, fecha1, fecha2 } = useGastosData();

  const handleConsult = () => {
    window.open("/gastos/reporte-depositos?selectedRepresentante=" + selectedRepresentante + "&fecha1=" + fecha1 + "&fecha2=" + fecha2, "_blank");
  };
  return (
    <button
      type="button"
      className="btn btn-dark text-white waves-effect waves-themed mr-2"
      onClick={handleConsult}
    >
      <i className="fal fa-print"></i> Depósitos
    </button>
  );
};

export { ConsultarReporteDepositosButton };
