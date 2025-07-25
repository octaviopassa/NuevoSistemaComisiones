import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import {
  DocumentosService,
  EmpresasService,
  GastosService,
} from "../../../../services";
import toastr from "toastr";
import { formatDate } from "../../../../../utils/utils";

export const GuardarButton = () => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const {
    documentos,
    setDocumentos,
    plazaSeleccionada,
    proyectoSeleccionado,
    pagarASeleccionado,
    selectedIngeniero,
    gastosDate,
    folio,
    estatus,
    setEstatus,
    setResumen,
    rfcEmpresaResponsablePagoSeleccionada,
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
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      if (!plazaSeleccionada) {
        toastr.warning("Por favor, seleccione una plaza.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      const isAuthorized = await GastosService.isAuthorized({
        plaza: plazaSeleccionada,
        user: session.profile.COD_USU,
        servidor: session.profile.servidor,
        baseDatos: session.profile.baseDatos,
      });

      if (!isAuthorized.data) {
        toastr.error("No tienes permiso para registrar gastos");
        return;
      }

      if (documentos.length === 0) {
        toastr.error("No hay documentos para registrar");
        return;
      }

      if (!pagarASeleccionado) {
        toastr.warning(
          "Por favor, seleccione la cuenta a la que se hará el reembolso."
        );
        return;
      }
      if (!gastosDate) {
        toastr.warning("Por favor, seleccione una fecha.");
        return;
      }
      if (!rfcEmpresaResponsablePagoSeleccionada) {
        toastr.warning("Por favor, seleccione la empresa responsable del pago.");
        return;
      }
      let newFolio = folio;

      if (estatus.estatus === "Nuevo" || estatus.estatus === "GRABADO") {
        const [rfc] = await EmpresasService.getRFC({
          baseDatos: session.profile.baseDatos,
          servidor: session.profile.servidor,
        });

        const dataGastoGlobal = {
          plaza: plazaSeleccionada,
          pagarA: pagarASeleccionado,
          fecha: new Date(gastosDate)
            .toISOString()
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("-"),
          origen: selectedIngeniero === "" ? "S" : "I",
          ingeniero: selectedIngeniero || "0",
          gastosDate: new Date(gastosDate)
            .toISOString()
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("-"),
          folio,
          observaciones: estatus.observaciones,
          cod_usu: session.profile.COD_USU,
          retencion: totalImportes.ret,
          iva: totalImportes.iva_16 + totalImportes.iva_8,
          rfc: rfc.rfc,
          ...totalImportes,
          servidor: session.profile.servidor,
          rfcEmpresaResponsablePago: rfcEmpresaResponsablePagoSeleccionada,
          accion: estatus.estatus === "GRABADO" ? "ACTUALIZAR" : "INSERTAR",
        };

        const { observaciones, ...dataToValidate } = dataGastoGlobal;

        const areFieldsValid = Object.values(dataToValidate).every(
          (value) => value !== "" && value !== null && value !== undefined
        );

        if (!areFieldsValid) {
          toastr.warning("Por favor, llene todos los campos requeridos.");
          return;
        }

        if (session.profile.MOSTRAR_COMBO_PROYECTO) {
          if (!proyectoSeleccionado) {
            toastr.warning("Por favor, seleccione un proyecto.");
            return;
          }
          dataGastoGlobal.proyecto = proyectoSeleccionado;
        }

        // console.log("SISTEMAS", dataGastoGlobal.proyecto);

        const grabadoGlobal = await GastosService.grabar(dataGastoGlobal);

        if (!grabadoGlobal.isValid) {
          toastr.warning("No se pudo realizar el grabado.");
          console.error(grabadoGlobal);
          return;
        }

        newFolio = grabadoGlobal.data[0].Column1;
      }

      let hasError = false;
      const updatedDocumentos = [...documentos];

      await Promise.all(
        documentos.map(async (documento, index) => {
          if (documento.renglonId) {
            return;
          }
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

          let tua_desglosado = "0";

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
            concepto: concepto.replace("'", "''"),
            fecha: formatDate(fecha), //new Date(fecha).toISOString().slice(0, 10).split('-').reverse().join('-'),
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
            cliente:
              tipoGasto.value === 17 || documento.detalleGasto.label
                ? documento.detalleGasto.label.replace("'", "''")
                : "",
            servidor: session.profile.servidor,
          };

          const grabarRenglon = await GastosService.grabarRenglon(
            datosDocumento
          );

          if (!grabarRenglon.isValid) {
            hasError = true;
            console.error(grabarRenglon);
            toastr.error("No se pudo grabar el detalle del gasto");
            throw new Error("No se pudo grabar el detalle del gasto");
          }

          const renglonId = grabarRenglon.data[0].Column1;
          updatedDocumentos[index] = { ...updatedDocumentos[index], renglonId };

          // GRABAR COMBUSTIBLE SI ES COMBUSTIBLE
          if (tipoGasto.value === 1) {
            const { detalleGasto } = documento;
            const datosGasolina = {
              folio,
              fecha: formatDate(fecha),
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
              servidor: session.profile.servidor,
            };

            const grabarGastoCombustible =
              await GastosService.grabarGastoCombustible(datosGasolina);

            if (!grabarGastoCombustible.isValid) {
              hasError = true;
              console.error(grabarGastoCombustible);
            }
          }

          // TODO: GRABAR PDF Y XML
          //FALTA VALIDAR QUE HAGA ESTO SOLO SI ES FACTURA
          //MP_XML_GRABA_ARCHIVO
          if (documento.tipoDocumento === "Factura") {
            const xmlGrabo = await DocumentosService.grabarArchivoXML({
              id_renglon: renglonId,
              nombre_xml: xmlArchivo?.nombre || "",
              archivo: xmlArchivo?.contenido || "",
              cod_usu: session.profile.COD_USU,
              servidor: session.profile.servidor,
            });

            if (!xmlGrabo?.isValid) {
              hasError = true;
              console.error(xmlGrabo);
            }
          }

          //MP_GASTOS_GRABA_ARCHIVO_NOTA
          if (documento.pdfArchivo || documento?.pdfArchivo?.contenido) {
            const pdfGrabo = await DocumentosService.grabarArchivoPDF({
              id_renglon: renglonId,
              nombre_pdf: documento?.pdfArchivo?.nombre || "",
              archivo: documento?.pdfArchivo?.contenido,
              cod_usu: session.profile.COD_USU,
              servidor: session.profile.servidor,
            });

            if (!pdfGrabo?.isValid) {
              hasError = true;
              console.error(pdfGrabo);
            }
          }

          if (documento.tipoDocumento === "Factura") {
            // Checar archivos
            //MP_GASTOS_SUBIR_XML_PDF
            const grabarDocGlobal = await DocumentosService.grabarArchivo({
              folio: newFolio,
              archivo_xml: xmlArchivo?.contenido || "",
              archivo_pdf: documento?.pdfArchivo?.contenido || "",
              cadena_xml: xmlArchivo?.contenido,
              cod_usu: session.profile.COD_USU,
              servidor: session.profile.servidor,
            });

            if (!grabarDocGlobal?.isValid) {
              hasError = true;
              console.error(grabarDocGlobal);
            }
          } else if (documento.tipoDocumento === "Nota") {
            if (documento.pdfArchivo || documento?.pdfArchivo?.contenido) {
              //MP_GASTOS_GRABA_ARCHIVO_NOTA
              const grabadoArchivosGlobal =
                await DocumentosService.grabarArchivoNota({
                  id_renglon: renglonId,
                  nombre_pdf:
                    documento?.pdfArchivo?.nombre || `${renglonId}.pdf`,
                  archivo: documento?.pdfArchivo?.contenido,
                  cod_usu: session.profile.COD_USU,
                  servidor: session.profile.servidor,
                });

              if (!grabadoArchivosGlobal?.isValid) {
                hasError = true;
                console.error(grabadoArchivosGlobal);
              }
            }
          }

          const [resumenData, gastoGlobalData] = await Promise.all([
            DocumentosService.getResumen({
              folio: newFolio,
              servidor: session.profile.servidor,
            }),
            DocumentosService.getGastoGlobal({
              folio: newFolio,
              plaza: plazaSeleccionada,
              cod_usu: session.profile.COD_USU,
              servidor: session.profile.servidor,
            }),
          ]);

          if (!resumenData?.isValid) console.error(resumenData);

          setEstatus({
            ...estatus,
            estatus: gastoGlobalData.data[0].NOM_ESTATUS,
            grabo: `${gastoGlobalData.data[0].NOM_USU_GRABO} ${formatDate(
              gastoGlobalData.data[0].FECHA
            )}`,
            observaciones: gastoGlobalData.data[0].OBSERVACION,
            propietario: !!gastoGlobalData.data[0].EsPropietario,
            oldFolio: true,
          });
          setResumen(resumenData.data);
        })
      );

      setDocumentos(updatedDocumentos);

      if (hasError) {
        setError(true);
        toastr.error(
          "Hubo un error al grabar los documentos, por favor reconsulte este folio y verifique. Contacte al departamento de sistemas."
        );
        return;
      }
      toastr.success(`${newFolio} grabado correctamente`);
    } catch (error) {
      setError(true);
      toastr.error(
        "Hubo un error al grabar los documentos, por favor reconsulte este folio y verifique. Contacte al departamento de sistemas."
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <></>;
  }

  return (
    <button
      disabled={loading}
      type="button"
      className="btn btn-success waves-effect waves-themed"
      onClick={handleGrabado}
    >
      <i className="fal fa-save"></i> Guardar
    </button>
  );
};
