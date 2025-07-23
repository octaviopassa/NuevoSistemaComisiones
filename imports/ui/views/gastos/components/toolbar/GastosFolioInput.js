import React, { useEffect, useState } from "react";
import { useGastosData } from "../../store";
import toastr from "toastr";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import { format } from "date-fns";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatToSinaloaDate } from "../../../../../utils/utils";

export const GastosFolioInput = () => {
  const [loading, setLoading] = useState(false);
  // const history = useLocation()?.state;
  const [searchParams] = useSearchParams();
  const folioParam = searchParams.get("folio");
  const plazaParam = searchParams.get("plaza");
  const { session } = useUserSession();
  const navigate = useNavigate();
  const {
    folio,
    setFolio,
    plazaSeleccionada,
    setPlazaSeleccionada,
    documentos,
    setMultiple,
    estatus,
    empresa,
  } = useGastosData();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (folioParam && plazaParam) {
      setPlazaSeleccionada(plazaParam ? plazaParam : "");
      setFolio(folioParam);
      const loadFolioData = async () => {
        await handleFolioChange(folioParam);
      };

      loadFolioData();
    }
  }, [plazaParam, folioParam]);//[history]);//[plazaSeleccionada]);

  const handleFolioInputChange = (e) => {
    setFolio(e.target.value);
  };

  const handleFolioKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleFolioChange(folio);
    }
  };

  const handleFolioChange = async (newFolio) => {
    if (!plazaSeleccionada && !plazaParam) {
      toastr.error("Por favor, seleccione una plaza");
      return;
    }

    if (!estatus.oldFolio && documentos.length > 0) {
      const result = await MySwal.fire({
        title: "¿Deseas cambiar el folio?",
        confirmButtonText: "Continuar",
        showCancelButton: true,
        text: `Tienes ${documentos.length} documento${documentos.length > 1 ? "s" : ""
          } guardado${documentos.length > 1 ? "s" : ""
          }. Si cambias el folio se borrarán.`,
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        icon: "warning",
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setLoading(true);

      const [gastosData, detalleData, resumenData, comisionesExpedientesData] = await Promise.all([
        DocumentosService.getGastoGlobal({
          folio: newFolio,
          plaza: plazaParam || plazaSeleccionada,
          cod_usu: session.profile.COD_USU,
          servidor: session.profile.servidor,
        }),
        DocumentosService.getGastosDetalle({
          folio: newFolio,
          servidor: session.profile.servidor,
        }),
        DocumentosService.getResumen({
          folio: newFolio,
          servidor: session.profile.servidor,
        }),
        DocumentosService.getComisionesTiposDocumentosExpedientes({
          folio: newFolio,
          servidor: session.profile.servidor,
        }),
      ]);

      const gastos = gastosData.data[0] || {};
      const detalle = detalleData.data;
      const resumen = resumenData.data;
      const comisionesExpedientes = comisionesExpedientesData.data || [];

      const newDocumentos = detalle.map((doc) => {
        //REEMPLAZAMOS LA COMA PARA QUE NO MARQUE ERROR EL parseFloat DE TableCantidades
        const ieps_fix = doc.IEPS.split(",")[0] + doc.IEPS.split(",")[1]
        const iva8_fix = doc.IVA_8.split(",")[0] + doc.IVA_8.split(",")[1]
        const iva16_fix = doc.IVA_16.split(",")[0] + doc.IVA_16.split(",")[1]
        const ret_fix = doc.RETENCION.split(",")[0] + doc.RETENCION.split(",")[1]
        const subtotal_fix = doc.SUBTOTAL.split(",")[0] + doc.SUBTOTAL.split(",")[1]
        const total_fix = doc.TOTAL.split(",")[0] + doc.TOTAL.split(",")[1] //+ doc.TOTAL.split(",")[2]
        const tua_fix = doc.TUA.split(",")[0] + doc.TUA.split(",")[1]
        const ish_fix = doc.ISH.split(",")[0] + doc.ISH.split(",")[1]

        return {
          renglonId: doc.ID_GASTO_DETALLE,
          cliente: { label: "", value: "" },
          concepto: doc.CONCEPTO,
          descartado: !!doc.DESCARTADO,
          detalleGasto:
            doc.CODIGO_GASTO === 17 || doc?.CLIENTE //session.profile.WEB_REACT_CLIENTE_OBLIGATORIO
              ? { label: doc?.CLIENTE || "" }
              : doc.CODIGO_GASTO === 1
                ? {
                  combustible: { label: doc.NOM_TIPO_COMBUSTIBLE },
                  conductor: { label: doc.NOM_USUARIO_VEHICULO },
                  litros: doc.LITROS,
                  kilometraje: doc.KM,
                  vehiculo: { label: doc.NOMBRE_VEHICULO_PLACAS },
                  gasolinera: { label: doc.NOMBRE_GASOLINERA },
                }
                : " ",
          importes: {
            fecha: doc.FECHA,
            folio: doc.FOLIO_PROVEEDOR,
            ieps: ieps_fix,//doc.IEPS,
            iva_8: iva8_fix,//doc.IVA_8,
            iva_16: iva16_fix,//doc.IVA_16,
            ret: ret_fix,//doc.RETENCION,
            subtotal: subtotal_fix,//doc.SUBTOTAL,
            total: total_fix,//doc.TOTAL,
            tua: tua_fix,//doc.TUA,
            ish: ish_fix,//doc.ISH,
          },
          pdfArchivo: doc?.IDPDF
            ? { id: doc.IDPDF, origen: doc?.ORIGEN_PDF, nombre: doc.NOMBRE_ARCHIVO_PDF }
            : "",
          proveedor: {
            label: doc.NOMBRE_PROVEEDOR_RFC,
            value: doc.CODIGO_PROVEEDOR,
          },
          tipoDocumento: doc.Nom_Tipo_Documento,
          tipoGasto: { label: doc.NOMBRE_GASTO, value: doc.CODIGO_GASTO },
          xmlArchivo: doc?.IDXML
            ? { id: doc.IDXML, origen: doc?.ORIGEN_XML }
            : "",
        };
      });

      if (!gastos) {
        toastr.error("No se encontraron registros para el folio");
        return;
      }

      setMultiple({
        plazaSeleccionada: gastos.PLAZA,
        isCheckedSucursal: gastos.ORIGEN === "S",
        pagarASeleccionado: gastos.PAGAR_A,
        proyectoSeleccionado: gastos.CODIGO_PROYECTO ? gastos.CODIGO_PROYECTO : "",
        rfcEmpresaResponsablePagoSeleccionada: gastos.RFC_EMPRESA_RESPONSABLE_PAGO,
        selectedIngeniero: gastos.ORIGEN === "I" ? gastos.CODIGO_VENDEDOR : "",
        folio: gastos.FOLIO_GASTO,
        gastosDate: format(new Date(gastos.FECHA), "yyyy-MM-dd"),
        empresa: gastos.EMPRESA,
        estatus: {
          estatus: gastos.NOM_ESTATUS,
          grabo: `${gastos.NOM_USU_GRABO} ${formatDate(gastos.FECHA)}`,
          aplico: gastos.NOM_USU_APLICO
            ? `${gastos.NOM_USU_APLICO} ${formatDate(gastos.FECHA_APLICACION)}`
            : "",
          autorizo: gastos.NOM_USU_AUTORIZO
            ? `${gastos.NOM_USU_AUTORIZO} ${formatDate(gastos.FECHA_AUTORIZACION)}`
            : "",
          observaciones: gastos?.OBSERVACION || "",
          propietario: gastos.EsPropietario,
          cancelado: gastos.NOM_USU_CANCELO
            ? `${gastos.NOM_USU_CANCELO} ${formatDate(gastos.FECHA_CANCELACION)}`
            : "",
          oldFolio: true,
        },
        documentos: newDocumentos,
        documentosComisiones: comisionesExpedientes,
        resumen,
      });

      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolioArrow = async (dir) => {
    const numericPart = folio.replace(/\D/g, "");
    const nonNumericPart = folio.replace(/\d/g, "");
    const updatedNumber =
      dir === "left"
        ? parseInt(numericPart, 10) - 1
        : parseInt(numericPart, 10) + 1;
    const newFolio = `${nonNumericPart}${updatedNumber
      .toString()
      .padStart(numericPart.length, "0")}`;

    // if (history?.plaza || history?.folio) {
    //   history.folio = null;
    //   history.plaza = null;
    // }
    if (folioParam || plazaParam) navigate("/gastos");

    await handleFolioChange(newFolio);
  };

  return (
    <div className="col-sm-3">
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">Folio:</span>
        </div>
        <input
          type="text"
          id="inputFolio"
          className="form-control"
          aria-label="Folio"
          placeholder="Folio"
          aria-describedby="inputFolio"
          value={folio}
          disabled={loading || estatus.oldFolio}
          onChange={handleFolioInputChange}
          onKeyDown={handleFolioKeyDown}
        />

        <div className="input-group-append">
          <button
            className="btn btn-outline-info waves-effect waves-themed"
            type="button"
            disabled={loading}
            onClick={() => handleFolioArrow("left")}
          >
            <i className="fal fa-arrow-left"></i>
          </button>
          <button
            className="btn btn-outline-info waves-effect waves-themed"
            type="button"
            disabled={loading}
            onClick={() => handleFolioArrow("right")}
          >
            <i className="fal fa-arrow-right"></i>
          </button>
        </div>
      </div>

      {empresa && (
        <p className="font-weight-bold text-primary mt-2">{empresa}</p>
      )}
    </div>
  );
};
