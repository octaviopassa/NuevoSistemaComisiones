import React from "react";
import { useGastosData } from "../../store";
import printJS from "print-js";
import { ReportesService } from "../../../../services/reportes";
import { useUserSession } from "../../../../store";

export const ImprimirButton = () => {
  const { session } = useUserSession();
  const { plazaSeleccionada, folio } = useGastosData();
  const handlePrint = async () => {
    const data = await ReportesService.generarReporte({
      plaza: plazaSeleccionada,
      folio,
      servidor: session.profile.servidor,
    });
    printJS({
      printable: data,
      type: "pdf",
      documentTitle: "ConsuntosPassa",
      header: "ConsuntosPassa",
      base64: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="btn btn-secondary bg-warning-900 waves-effect waves-themed text-white ml-2 mr-2"
    >
      <i className="fal fa-print"></i> Imprimir
    </button>
  );
};
