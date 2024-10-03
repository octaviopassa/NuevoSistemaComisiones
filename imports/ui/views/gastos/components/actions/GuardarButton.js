import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import {
  DocumentosService,
  EmpresasService,
  GastosService,
} from "../../../../services";
import toastr from "toastr";
import { format } from "date-fns";

export const GuardarButton = ({ setLoading }) => {
  const {
    documentos,
    setDocumentos,
    plazaSeleccionada,
    pagarASeleccionado,
    selectedIngeniero,
    gastosDate,
    folio,
    estatus,
    setEstatus,
    setResumen,
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

  console.log(documentos);

  const handleGrabado = async (e) => {
    e.preventDefault();
    try {
      if (documentos.length === 0) {
        toastr.error("No hay documentos para registrar");
        return;
      }
      if (!plazaSeleccionada || !pagarASeleccionado || !gastosDate) {
        toastr.warning("Por favor, llene todos los campos requeridos.");
        return;
      }
      setLoading(true);
      let newFolio = folio;

      if (estatus.estatus === "Nuevo") {
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

        newFolio = grabadoGlobal.data[0].Column1;
      }

      documentos.forEach(async (documento, index) => {
        if (documento.renglonId) {
          return;
        }
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
            cadena_xml: xmlArchivo?.contenido || "",
            uuid: xmlArchivo?.uuid || "",
            tua_desglosado,
            cliente: tipoGasto.value === 17 ? documento.detalleGasto.label : "",
          };

          const grabarRenglon = await GastosService.grabarRenglon(
            datosDocumento
          );

          if (!grabarRenglon.isValid) {
            console.error(grabarRenglon);
          }

          const renglonId = grabarRenglon.data[0].Column1;

          // Agregar id: renglonId al documento
          const updatedDocumentos = [...documentos];
          updatedDocumentos[index] = { ...updatedDocumentos[index], renglonId };

          setDocumentos(updatedDocumentos);

          // GRABAR COMBUSTIBLE SI ES COMBUSTIBLE
          if (tipoGasto.value === 1) {
            const { detalleGasto } = documento;
            const datosGasolina = {
              folio,
              fecha,
              vehiculo: detalleGasto.vehiculo.value,
              conductor: detalleGasto.conductor.value,
              importe: parseFloat(total),
              litros: parseInt(detalleGasto.litros),
              km: parseInt(detalleGasto.kilometraje),
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
            ? Uint8Array.from(atob(documento.pdfArchivo.contenido), (char) =>
                char.charCodeAt(0)
              )
            : null;

          const xmlBytes = xmlArchivo?.contenido
            ? Uint8Array.from(atob(xmlArchivo?.contenido), (char) =>
                char.charCodeAt(0)
              )
            : null;

          // TODO: GRABAR PDF Y XML
          const xmlGrabo = await DocumentosService.grabarArchivoXML({
            id_renglon: renglonId,
            nombre_xml: xmlArchivo?.nombre || "",
            archivo: xmlBytes,
            cod_usu: session.profile.COD_USU,
          });

          if (!xmlGrabo.isValid) console.error(xmlGrabo);

          const pdfGrabo = await DocumentosService.grabarArchivoPDF({
            id_renglon: renglonId,
            nombre_pdf: documento.pdfArchivo?.nombre || "",
            archivo: pdfBytes,
            cod_usu: session.profile.COD_USU,
          });

          if (!pdfGrabo.isValid) console.error(pdfGrabo);

          // Checar archivos
          const grabarDocGlobal = await DocumentosService.grabarArchivo({
            folio: newFolio,
            archivo_xml: xmlBytes,
            archivo_pdf: pdfBytes,
            cadena_xml: atob(xmlArchivo?.contenido || ""),
            cod_usu: session.profile.COD_USU,
          });

          if (!grabarDocGlobal.isValid) console.error(grabarDocGlobal);

          const grabadoArchivosGlobal =
            await DocumentosService.grabarArchivoNota({
              id_renglon: renglonId,
              nombre_xml: xmlArchivo?.nombre || "",
              archivo: pdfBytes,
              cod_usu: session.profile.COD_USU,
            });

          if (!grabadoArchivosGlobal.isValid)
            console.error(grabadoArchivosGlobal);

          const [resumenData, gastoGlobalData] = await Promise.all([
            DocumentosService.getResumen(newFolio),
            DocumentosService.getGastoGlobal({
              folio: newFolio,
              plaza: plazaSeleccionada,
              cod_usu: session.profile.COD_USU,
            }),
          ]);

          console.log(resumenData, gastoGlobalData);

          if (!resumenData.isValid) console.error(resumenData);

          setEstatus({
            estatus: gastoGlobalData.data[0].NOM_ESTATUS,
            grabo: `${gastoGlobalData.data[0].NOM_USU_GRABO} ${format(
              new Date(gastoGlobalData.data[0].FECHA),
              "dd/MM/yyyy"
            )}`,
            observaciones: gastoGlobalData.data[0].OBSERVACION,
            propietario: !!gastoGlobalData.data[0].EsPropietario,
          });
          setResumen(resumenData.data);
        } catch (error) {
          console.log(error);
        }
      });

      toastr.success(`${newFolio} grabado correctamente`);
      setLoading(false);
    } catch (error) {
      console.log(error);
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
