import React, { useEffect, useState } from "react";
import { useGastosData } from "../../store";
import toastr from "toastr";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import { format } from "date-fns";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useLocation } from "react-router-dom";

export const GastosFolioInput = () => {
  const [loading, setLoading] = useState(false);
  const history = useLocation()?.state;
  const { session } = useUserSession();
  const {
    folio,
    setFolio,
    plazaSeleccionada,
    documentos,
    setMultiple,
    estatus,
    empresa,
  } = useGastosData();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (history?.folio && history?.plaza) {
      setMultiple({
        plazaSeleccionada: history.plaza,
        folio: history.folio,
      });
      handleFolioChange(history.folio);
    }
  }, [plazaSeleccionada]);

  const handleFolioInputChange = (e) => {
    setFolio(e.target.value);
  };

  const handleFolioKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleFolioChange(folio);
    }
  };

  const handleFolioChange = async (newFolio) => {
    if (!plazaSeleccionada && !history?.plaza) {
      toastr.error("Por favor, seleccione una plaza");
      return;
    }

    if (!estatus.oldFolio && documentos.length > 0) {
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
    }

    try {
      setLoading(true);

      const [gastosData, detalleData, resumenData] = await Promise.all([
        DocumentosService.getGastoGlobal({
          folio: newFolio,
          plaza: plazaSeleccionada,
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
      ]);

      const gastos = gastosData.data[0];
      const detalle = detalleData.data;
      const resumen = resumenData.data;

      const newDocumentos = detalle.map((doc) => {
        return {
          renglonId: doc.RENGLON_ID,
          cliente: { label: "", value: "" },
          concepto: doc.CONCEPTO,
          descartado: !!doc.DESCARTADO,
          detalleGasto:
            doc.CODIGO_GASTO === 17 ||
            session.profile.WEB_REACT_CLIENTE_OBLIGATORIO
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
            ieps: doc.IEPS,
            iva_8: doc.IVA_8,
            iva_16: doc.IVA_16,
            ret: doc.RETENCION,
            subtotal: doc.SUBTOTAL,
            total: doc.TOTAL,
            tua: doc.TUA,
          },
          pdfArchivo: doc.ARCHIVO_PDF
            ? { contenido: doc.ARCHIVO_PDF, nombre: doc.NOMBRE_ARCHIVO_PDF }
            : "",
          proveedor: {
            label: doc.NOMBRE_PROVEEDOR_RFC,
            value: doc.CODIGO_PROVEEDOR,
          },
          tipoDocumento: doc.Nom_Tipo_Documento,
          tipoGasto: { label: doc.NOMBRE_GASTO, value: doc.CODIGO_GASTO },
          //validar si el base64 viene vacío
          xmlArchivo: doc.ARCHIVO_XML
            ? { contenido: doc.ARCHIVO_XML, nombre: `${doc.RENGLON_ID}.xml` }
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
        selectedIngeniero: gastos.ORIGEN === "I" ? gastos.CODIGO_VENDEDOR : "",
        folio: gastos.FOLIO_GASTO,
        gastosDate: format(new Date(gastos.FECHA), "yyyy-MM-dd"),
        empresa: gastos.EMPRESA,
        estatus: {
          estatus: gastos.NOM_ESTATUS,
          grabo: `${gastos.NOM_USU_GRABO} ${format(
            new Date(gastos.FECHA),
            "dd/MM/yyyy"
          )}`,
          aplico: gastos.NOM_USU_APLICO
            ? `${gastos.NOM_USU_APLICO} ${format(
                new Date(gastos.FECHA_APLICACION),
                "dd/MM/yyyy"
              )}`
            : "",
          autorizo: gastos.NOM_USU_AUTORIZO
            ? `${gastos.NOM_USU_AUTORIZO} ${format(
                new Date(gastos.FECHA_AUTORIZACION),
                "dd/MM/yyyy"
              )}`
            : "",
          observaciones: gastos?.OBSERVACION || "",
          propietario: gastos.EsPropietario,
          cancelado: gastos.NOM_USU_CANCELO
            ? `${gastos.NOM_USU_CANCELO} ${format(
                new Date(gastos.FECHA_CANCELACION),
                "dd/MM/yyyy"
              )}`
            : "",
          oldFolio: true,
        },
        documentos: newDocumentos,
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

    if (history?.plaza && history?.folio) {
      history.folio = null;
      history.plaza = null;
    }
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
          disabled={loading}
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
