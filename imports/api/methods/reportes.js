import conexiones from "../../utils/config";
import axios from "axios";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";
import os from "os";
import Docxtemplater from "docxtemplater";
import { format } from "date-fns";
import { promisify } from "util";
import libre from "libreoffice-convert";
import { formatToSinaloaDate } from "../../utils/utils";
const libreConvert = promisify(libre.convert);
// import ConvertAPI from "convertapi";
// const convertapi = new ConvertAPI("secret_M2CC06K9StuPUDEz");

Meteor.methods({
  "reportes.generarReporte": async function (data) {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
    conexiones.body_bdseleccionada.servidor = data.servidor;

    const queryGlobal = `
      exec Mp_rpt_gastos 
      @FOLIO_GASTO='${data.folio}',
      @PLAZA='${data.plaza}'
    `;

    const queryResumen = `
      exec MP_RPT_GASTOS_RESUMEN_FACTURADO 
      @FOLIO_GASTO='${data.folio}', 
      @PLAZA='${data.plaza}' 
    `;

    const estadosReembolso = {
      N: "Nuevo",
      G: "Grabado",
      U: "Autorizado",
      C: "Cancelado",
    };

    try {
      const [responseGlobal, responseResumen] = await Promise.all([
        axios.get(conexiones.windows_api, {
          data: {
            ...conexiones.body_bdseleccionada,
            query: queryGlobal,
          },
        }),
        axios.get(conexiones.windows_api, {
          data: {
            ...conexiones.body_bdseleccionada,
            query: queryResumen,
          },
        }),
      ]);

      const global = JSON.parse(responseGlobal.data.data.resultado);
      const resumen = JSON.parse(responseResumen.data.data.resultado);

      const detalle = global.map((item) => {
        return {
          tipo: item.TIPO_DOCUMENTO === "F" ? "Factura" : "Nota",
          proveedor: item.NOMBRE_PROVEEDOR,
          gasto: item.NOMBRE_GASTO,
          concepto: item.CONCEPTO,
          fecha: formatToSinaloaDate(item.R_FECHA), //format(new Date(item.R_FECHA), "dd/MM/yyyy"),
          folio_proveedor: item.FOLIO_PROVEEDOR,
          subtotal: `$${item.rSUBTOTAL.toFixed(2)}`,
          iva_16: `$${item.rIVA_16.toFixed(2)}`,
          iva_8: `$${item.rIVA_8.toFixed(2)}`,
          ret: `$${item.rRETENCION.toFixed(2)}`,
          total: `$${item.rTOTAL.toFixed(2)}`,
        };
      });

      const subReporte = resumen.map((item) => {
        return {
          tipo: item.NOMBRE_GASTO,
          total: `$${item.TOTAL.toFixed(2)}`,
        };
      });

      const reportData = {
        empresa: global[0].EMPRESA_NOMBRE,
        folio: global[0].FOLIO_GASTO_GLOBAL,
        ciudad: global[0].NOM_PLAZA,
        estatus: `${global[0].ESTATUS} - ${
          estadosReembolso[global[0].ESTATUS]
        }`,
        grabo: `${formatToSinaloaDate(global[0]?.FECHA)} ${
          global[0]?.NOMBRE_GRABO || ""
        }`,
        aplico: global[0]?.NOMBRE_APLICO
          ? `${formatToSinaloaDate(global[0]?.FECHA_APLICACION)} ${
              global[0]?.NOMBRE_APLICO || ""
            }`
          : "",
        autorizo: global[0]?.NOMBRE_AUTORIZO
          ? `${formatToSinaloaDate(global[0]?.FECHA_AUTORIZACION)} ${
              global[0]?.NOMBRE_AUTORIZO
            }`
          : "",
        // grabo: `${format(new Date(global[0]?.FECHA), "dd/MM/yyyy")} ${
        //   global[0]?.NOMBRE_GRABO || ""
        // }`,
        // aplico: global[0]?.NOMBRE_APLICO
        //   ? `${format(new Date(global[0]?.FECHA_APLICACION), "dd/MM/yyyy")} ${
        //       global[0]?.NOMBRE_APLICO || ""
        //     }`
        //   : "",
        // autorizo: global[0]?.NOMBRE_AUTORIZO
        //   ? `${format(new Date(global[0]?.FECHA_AUTORIZACION), "dd/MM/yyyy")} ${
        //       global[0]?.NOMBRE_AUTORIZO
        //     }`
        //   : "",
        pagarA: global[0].PAGAR_A,
        rfc: global[0].RFC,
        curp: global[0].CURP,
        imp_totalFacturas: `$${global[0]?.IMPORTE_FACTURAS?.toFixed(2) || 0.0}`,
        count_facturas: global[0].NUMERO_FACTURAS,
        imp_totalNotas: `$${global[0]?.IMPORTE_NOTAS?.toFixed(2) || 0.0}`,
        count_notas: global[0].NUMERO_NOTAS,
        ieps: `$${global[0].IEPS.toFixed(2)}`,
        ish: `$${global[0].ISH.toFixed(2)}`,
        tua: `$${global[0].TUA.toFixed(2)}`,
        imp_total: `$${global[0].TOTAL.toFixed(2)}`,
        imp_subtotal: `$${global[0].SUBTOTAL.toFixed(2)}`,
        imp_iva16: `$${global[0].IVA_16.toFixed(2)}`,
        imp_iva8: `$${global[0].IVA_8.toFixed(2)}`,
        imp_ret: `$${global[0].RETENCION.toFixed(2)}`,
        detalle,
        resumen: subReporte,
      };

      const content = fs.readFileSync(
        process.cwd() + "/assets/app/reportes/gastosReporte.docx",
        "binary"
      );

      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(reportData);

      // Convertir a DOCX
      const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });
      const tempDocxPath = path.join(os.tmpdir(), "tempGastosReporte.docx");
      fs.writeFileSync(tempDocxPath, docxBuffer);

      // const result = await convertapi.convert(
      //   "pdf",
      //   {
      //     File: tempDocxPath,
      //   },
      //   "docx"
      // );
      // const tempPdfPath = path.join(os.tmpdir(), "tempGastosReporte.pdf");
      // await result.file.save(tempPdfPath);
      // const pdfBuffer = fs.readFileSync(tempPdfPath);
      // const base64Pdf = pdfBuffer.toString("base64");
      // fs.unlinkSync(tempDocxPath);
      // fs.unlinkSync(tempPdfPath);
      // return base64Pdf;

      // Convertir DOCX a PDF 
      const pdfBuffer = await libreConvert(docxBuffer, ".pdf", undefined);
      const base64Pdf = pdfBuffer.toString("base64");

      // Limpiar archivo temporal
      fs.unlinkSync(tempDocxPath);

      return {
        isValid: true,
        data: base64Pdf,
        message: "",
      };
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
});
