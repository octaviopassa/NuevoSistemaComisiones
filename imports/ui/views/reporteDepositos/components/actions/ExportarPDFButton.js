import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate, formatNumConComas } from "../../../../../utils/utils";
import { useFiltrosReporteDepositosStore } from "../../store";

export const ExportarPDFButton = ({
    rows = [],
    title = "Reporte de depósitos a detalle",
    fileName = "reporte_depositos_detalle",
    totalPago,
    totalComision,
}) => {
    const { filters } = useFiltrosReporteDepositosStore();

    const onExportFull = () => {
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

        // Márgenes y estilos base
        const margin = { top: 60, right: 40, bottom: 40, left: 40 };

        // Encabezado
        doc.setFontSize(14);
        doc.text(title, margin.left, 30);

        // Subtítulo con filtros y totales
        doc.setFontSize(10);
        const repLabel = filters.codigoRepresentante ? String(filters.codigoRepresentante) + " - " + String(filters.nombreRepresentante) : "-";
        const fecha1Label = filters.fecha1_Comision ? formatDate(filters.fecha1_Comision) : "-";
        const fecha2Label = filters.fecha2_Comision ? formatDate(filters.fecha2_Comision) : "-";
        const totalPagoLabel = typeof totalPago === 'number' ? formatCurrency(totalPago) : "-";
        const totalComisionLabel = typeof totalComision === 'number' ? formatCurrency(totalComision) : "-";
        doc.text(`Representante: ${repLabel}`, margin.left, 46);
        doc.text(`Desde: ${fecha1Label} hasta ${fecha2Label}`, margin.left, 60);
        doc.text(`Totales — Pago: ${totalPagoLabel}    Comisión: ${totalComisionLabel}`, margin.left, 74);

        // Definir columnas
        const head = [[
            "Depósito",
            "Fecha",
            "Folio de venta",
            "Cliente",
            "Cantidad",
            "Descripción",
            "% Utilidad",
            "Pago",
            "Comisión",
        ]];

        const body = rows.map((d) => [
            d.FOLIO_DEPOSITO ?? "",
            d.FECHA_DEPOSITO ? formatDate(d.FECHA_DEPOSITO) : "",
            d.FOLIO_VENTA ?? "",
            `${d.COD_CTE ?? ""} - ${d.NOM_CTE ?? ""}`,
            d.R_CANT != null ? formatNumConComas(d.R_CANT) : "",
            d.R_DESCRI ?? "",
            d.R_PTAJE_UTILIDAD != null ? String(d.R_PTAJE_UTILIDAD) : "",
            d.PAGO_POR_RENGLON_VENTA != null ? formatCurrency(d.PAGO_POR_RENGLON_VENTA) : "",
            d.COMISION_POR_RENGLON_VENTA != null ? formatCurrency(d.COMISION_POR_RENGLON_VENTA) : "",
        ]);

        // Pie de tabla con totales bajo Pago (col 8) y Comisión (col 9)
        const foot = [["", "", "", "", "", "", "", totalPagoLabel, totalComisionLabel]];

        autoTable(doc, {
            head,
            body,
            foot,
            startY: 90, // dejar espacio para subtítulo
            margin,
            styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: [33, 150, 243], textColor: 255 },
            theme: "striped",
            pageBreak: 'auto',
            showHead: 'everyPage',
            didDrawPage: (data) => {
                // Footer con número de página y total de registros
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(9);
                const footerY = doc.internal.pageSize.getHeight() - 12;
                doc.text(`Página ${data.pageNumber} de ${pageCount}`, margin.left, footerY);
                doc.text(`Total registros: ${rows.length}`, doc.internal.pageSize.getWidth() - margin.right - 110, footerY);
            },
        });

        // Totales al final (opcional, por si el lector llega hasta el final)
        // const endY = doc.lastAutoTable?.finalY || 90;
        // const totalsY = Math.min(endY + 20, doc.internal.pageSize.getHeight() - margin.bottom - 10);
        doc.setFontSize(10);
        // doc.text(`Totales — Pago: ${totalPagoLabel}    Comisión: ${totalComisionLabel}`, margin.left, totalsY);

        doc.save(`${fileName}.pdf`);
    };

    return (
        <button type="button" className="btn btn-secondary" onClick={onExportFull}>
            <i className="fal fa-file-pdf mr-1" /> Exportar PDF
        </button>
    );
};