import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import {
  DocumentosService,
  EmpresasService,
  GastosService,
} from "../../../../services";
import toastr from "toastr";

export const GuardarButton = ({ setLoading }) => {
  const {
    documentos,
    plazaSeleccionada,
    pagarASeleccionado,
    selectedIngeniero,
    gastosDate,
    folio,
    estatus,
  } = useGastosData();
  const { session } = useUserSession();
  const totalImportes = documentos.reduce(
    (sumaTotales, documento) => {
      const importes = documento.importes;

      sumaTotales.subtotal += parseFloat(importes.subtotal || 0);
      sumaTotales.total += parseFloat(importes.total || 0);
      sumaTotales.impuesto += parseFloat(importes.impuesto || 0);
      sumaTotales.iva_16 += parseFloat(importes.iva_16 || 0);
      sumaTotales.iva_8 += parseFloat(importes.iva_8 || 0);
      sumaTotales.ieps += parseFloat(importes.ieps || 0);
      sumaTotales.ish += parseFloat(importes.ish || 0);
      sumaTotales.tua += parseFloat(importes.tua || 0);
      sumaTotales.ret += parseFloat(importes.ret || 0);

      return sumaTotales;
    },
    {
      subtotal: 0,
      total: 0,
      impuesto: 0,
      iva_16: 0,
      iva_8: 0,
      ieps: 0,
      ish: 0,
      tua: 0,
      ret: 0,
    }
  );

  const handleGrabado = async (e) => {
    //TODO: Usar estatos.estatus para dependiendo si es nuevo o grabado ver si se manda la accion de EDITAR o INSERTAR.
    e.preventDefault();
    try {
      if (!plazaSeleccionada || !pagarASeleccionado || !gastosDate || documentos.length === 0) {
        toastr.warning("Por favor, llene todos los campos requeridos.");
        return;
      }
      setLoading(true);

      const [rfc] = await EmpresasService.getRFC(session.profile.baseDatos);

      const dataGastoGlobal = {
        plaza: plazaSeleccionada,
        pagarA: pagarASeleccionado,
        fecha: gastosDate,
        origen: selectedIngeniero === "" ? "S" : "I",
        ingeniero: selectedIngeniero || "0",
        gastosDate,
        folio,
        observaciones: estatus.observaciones,
        cod_usu: session.profile.COD_USU,
        retencion: totalImportes.ret,
        iva: totalImportes.iva_16 + totalImportes.iva_8,
        rfc: rfc.rfc,
        ...totalImportes,
      };

      const { observaciones, ...dataToValidate } = dataGastoGlobal;

      const areFieldsValid = Object.values(dataToValidate).every(
        (value) => value !== "" && value !== null && value !== undefined
      );

      if (!areFieldsValid) {
        toastr.warning("Por favor, llene todos los campos requeridos.");
        return;
      }

      const grabadoGlobal = await GastosService.grabar(dataGastoGlobal);

      if (!grabadoGlobal.isValid) {
        toastr.warning("No se pudo realizar el grabado.");
        console.error(grabadoGlobal);
        return;
      }

      const newFolio = grabadoGlobal.data[0].Column1;

      documentos.forEach(async (documento) => {
        try {
          const {
            tipoDocumento,
            proveedor,
            tipoGasto,
            concepto,
            importes,
            xmlArchivo,
          } = documento;
          const {
            subtotal,
            iva_16,
            iva_8,
            ieps,
            ish,
            ret,
            total,
            tua,
            folio,
            fecha,
          } = importes;

          let tua_desglosado;

          if (parseFloat(tua || 0) > 0) {
            const calculoTotal =
              parseFloat(subtotal) +
              parseFloat(iva_16) +
              parseFloat(iva_8) +
              parseFloat(ieps) +
              parseFloat(ish) -
              parseFloat(ret);

            tua_desglosado = calculoTotal === parseFloat(total) ? "0" : "1";
          }

          const datosDocumento = {
            folio: newFolio,
            tipoDocumento,
            proveedor: proveedor.value,
            tipoGasto: tipoGasto.value,
            concepto,
            fecha,
            folioProveedor: folio,
            subtotal: parseFloat(subtotal),
            iva: parseFloat(iva_16) + parseFloat(iva_8),
            iva_16: parseFloat(iva_16),
            iva_8: parseFloat(iva_8),
            ieps: parseFloat(ieps),
            retencion: parseFloat(ret),
            total: parseFloat(total),
            ish: parseFloat(ish),
            tua: parseFloat(tua),
            cadena_xml: xmlArchivo.contenido || "",
            uuid: xmlArchivo.uuid || "",
            tua_desglosado,
            cliente: tipoGasto.value === 17 ? documento.detalleGasto.label : "",
          };

          const grabarRenglon = await GastosService.grabarRenglon(
            datosDocumento
          );

          const renglonId = grabarRenglon.data[0].Column1;

          if (!grabarRenglon.isValid) {
            console.error(grabarRenglon);
          }

          // GRABAR COMBUSTIBLE SI ES COMBUSTIBLE
          if (tipoGasto.value === 1) {
            const { detalleGasto } = documento;
            const datosGasolina = {
              idVale: detalleGasto.idVale || 0,
              folio,
              fecha,
              vehiculo: detalleGasto.vehiculo.value,
              conductor: detalleGasto.conductor.value,
              importe: parseFloat(total),
              litros: detalleGasto.litros,
              km: detalleGasto.km,
              combustible: detalleGasto.combustible.value,
              cod_usu: session.profile.COD_USU,
              gasolinera: detalleGasto.gasolinera.value,
              plaza: plazaSeleccionada,
              folioGasto: newFolio,
            };

            const grabarGastoCombustible =
              await GastosService.grabarGastoCombustible(datosGasolina);

            if (!grabarGastoCombustible.isValid) {
              console.error(grabarGastoCombustible);
            }
          }

          const pdfBytes = documento.pdfArchivo?.contenido
            ? new Uint8Array(
                atob(documento.pdfArchivo.contenido)
                  .split("")
                  .map((char) => char.charCodeAt(0))
              )
            : null;

          const xmlBytes = xmlArchivo?.contenido
            ? new Uint8Array(
                atob(xmlArchivo.contenido)
                  .split("")
                  .map((char) => char.charCodeAt(0))
              )
            : null;

          // TODO: GRABAR PDF Y XML
          if (tipoDocumento === "Factura") {
            const xmlGrabo = await DocumentosService.grabarArchivoXML({
              id_renglon: renglonId,
              nombre_xml: xmlArchivo?.nombre || "",
              archivo: xmlBytes,
              cod_usu: session.profile.COD_USU,
            });

            if (!xmlGrabo.isValid) console.error(xmlGrabo);

            const pdfGrabo = await DocumentosService.grabarArchivoPDF({
              id_renglon: renglonId,
              nombre_pdf: pdfArchivo?.nombre || "",
              archivo: pdfBytes,
              cod_usu: session.profile.COD_USU,
            });

            if (!pdfGrabo.isValid) console.error(pdfGrabo);
          } else if (tipoDocumento === "Nota") {
            const grabarDocGlobal = await DocumentosService.grabarArchivo({
              folio: newFolio,
              archivo_xml: xmlBytes,
              archivo_pdf: pdfBytes,
              cadena_xml: xmlArchivo.contenido,
              cod_usu: session.profile.COD_USU,
            });

            if (!grabarDocGlobal.isValid) console.error(grabarDocGlobal);

            const grabadoArchivosGlobal =
              await DocumentosService.grabarArchivoNota({
                folio: newFolio,
                nombre_xml: xmlArchivo?.nombre || "",
                archivo: pdfBytes,
                cod_usu: session.profile.COD_USU,
              });

            if (!grabadoArchivosGlobal.isValid)
              console.error(grabadoArchivosGlobal);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-success waves-effect waves-themed"
      onClick={handleGrabado}
    >
      <i className="fal fa-save"></i> Guardar
    </button>
  );
};
