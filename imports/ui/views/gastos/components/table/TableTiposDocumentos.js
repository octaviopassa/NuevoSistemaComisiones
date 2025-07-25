import React, { useState } from "react";
import { faDownload/*, faRetweet */ } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import toastr from "toastr";
import { DocumentosService } from "../../../../services";
import { useFetchData } from "../../../../hooks";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { TipoDocumentosComisionesService } from "../../../../services/tipoDocumentosComisiones";

export const TableTiposDocumentos = () => {
  const [pdfTempData, setPdfTempData] = useState(null);
  const [tipoDocumentoComisiones, setTipoDocumentoComisiones] = useState("");

  const MySwal = withReactContent(Swal);
  const { session } = useUserSession();
  const {
    setDocumentosComisiones,
    documentosComisiones,
    estatus,
    folio,
  } = useGastosData();
  const { data: dataTipoDocumentosComisiones } = useFetchData(TipoDocumentosComisionesService.getAll, [
    {
      servidor: session.profile.servidor,
    },
  ]);
  const tipoDocumentosComisiones = dataTipoDocumentosComisiones?.map((tg) => ({
    value: tg.Codigo,
    label: tg.Nombre,
  }));

  const handleFileComisionesUpload = (event, index) => {
    try {
      const file = event.target.files[0];
      const fileName = file.name;
      const validFileTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      const maxSizeInMB = 4;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (!file) {
        toastr.error("Por favor, seleccione un archivo.");
        return;
      }

      if (!validFileTypes.includes(file.type)) {
        toastr.error(
          "Por favor, seleccione un archivo PDF o una imagen válida (PNG, JPG, JPEG)."
        );
        return;
      }

      if (file.size > maxSizeInBytes) {
        toastr.error(
          `El tamaño del archivo no debe exceder ${maxSizeInMB} MB.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1] || e.target.result;

        const pdfData = {
          nombre: fileName,
          contenido: base64String,
        };

        if (index !== undefined) {
          setDocumentosComisiones(
            documentosComisiones.map((doc, i) =>
              i === index ? { ...doc, pdfArchivo: pdfData } : doc
            )
          );
        } else {
          setPdfTempData(pdfData);
        }
      };

      reader.onerror = () => {
        console.error("Error al leer el archivo");
        toastr.error("Error al procesar el archivo");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Archivo inválido seleccionado:", error);
      toastr.error("Por favor, seleccione un archivo válido");
    } finally {
      event.target.files = null;
      event.target.value = "";
    }
  };

  const handleFileComisionesDownload = async (pdfArchivo) => {
    const doc = pdfArchivo?.contenido
      ? pdfArchivo
      : await DocumentosService.getPDF({
        id: pdfArchivo?.id,
        servidor: session.profile.servidor,
      });

    if (doc) {
      const archivoPDFBase64 = doc?.data[0].ARCHIVO_PDF || doc?.contenido;
      try {
        const cleanedBase64 = archivoPDFBase64.replace(/[^A-Za-z0-9+/=]/g, "");
        const byteCharacters = atob(cleanedBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const tipoArchivo = pdfArchivo?.nombre.split(".")[1];
        const blob = new Blob([byteArray], {
          type: `application/${tipoArchivo}`,
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = pdfArchivo?.nombre || `ARCHIVO_PDF.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error al convertir el archivo PDF:", error);
        toastr.error(
          "Error al descargar el archivo PDF. Por favor, inténtalo de nuevo."
        );
      }
    } else {
      console.error("No se encontró archivo PDF para este documento");
      toastr.error("No hay archivo PDF disponible para descargar");
    }
  };

  const handleTipoDocumentoComisionesChange = (selectedOption) => {
    setTipoDocumentoComisiones(selectedOption);
  };

  const agregarDocumentoComisiones = async () => {
    if (estatus.estatus === "Nuevo") {
      toastr.warning("No se puede agregar archivos al documento porque el estatus es Nuevo, debe estar grabado.");
      return;
    }

    if (!tipoDocumentoComisiones) {
      toastr.warning("Por favor, seleccione un tipo de documento.");
      return;
    }

    let pdfArchivoFinal = null;
    pdfArchivoFinal = pdfTempData;

    if (!pdfArchivoFinal) {
      toastr.warning("Por favor, seleccione un archivo PDF o imagen.");
      return;
    }

    const nuevoDocumentoComisiones = {
      codigoTipoDocumentoComisiones: tipoDocumentoComisiones.value,
      nombreTipoDocumentoComisiones: tipoDocumentoComisiones.label,
      pdfArchivo: pdfArchivoFinal,
    };

    // setDocumentosComisiones([...documentosComisiones, nuevoDocumentoComisiones]);
    limpiarCamposComisiones();
    setPdfTempData(null);

    if (nuevoDocumentoComisiones.pdfArchivo || nuevoDocumentoComisiones?.pdfArchivo?.contenido) {
      //MP_COMISIONES_TIPOS_DOCUMENTOS_EXPEDIENTES_GRABAR
      const grabadoArchivosGlobal =
        await DocumentosService.grabarArchivoComisiones({
          folio: folio,
          codigo_tipo_documento: nuevoDocumentoComisiones.codigoTipoDocumentoComisiones,
          nombre_pdf: nuevoDocumentoComisiones?.pdfArchivo?.nombre || `${folio}.pdf`,
          archivo: nuevoDocumentoComisiones?.pdfArchivo?.contenido,
          cod_usu: session.profile.COD_USU,
          servidor: session.profile.servidor,
        });

      if (!grabadoArchivosGlobal?.isValid) {
        hasError = true;
        console.error(grabadoArchivosGlobal);
      }
      else {
        const [comisionesExpedientesData] = await Promise.all([
          DocumentosService.getComisionesTiposDocumentosExpedientes({
            folio: folio,
            servidor: session.profile.servidor,
          }),
        ]);
        setDocumentosComisiones(comisionesExpedientesData.data);
        toastr.success("Archivo grabado exitosamente");
      }
    }
  };

  const eliminarDocumentoComisiones = async (index) => {
    if (!documentosComisiones.length) {
      toastr.warning("No hay documentos para eliminar");
      return;
    }

    if (documentosComisiones[index].renglonId) {
      const result = await MySwal.fire({
        title: "¿Deseas eliminar este documento?",
        confirmButtonText: "Confirmar",
        showCancelButton: true,
        text: `Si eliminas el documento se perderán todos sus datos. ¿Deseas continuar?`,
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        icon: "warning",
      });

      if (!result.isConfirmed) {
        return;
      }

      await DocumentosService.eliminarXML({
        id: documentosComisiones[index].renglonId,
        servidor: session.profile.servidor,
      });
    }

    setDocumentosComisiones(documentosComisiones.filter((_, i) => i !== index));
    toastr.success("Documento eliminado");
  };

  const limpiarCamposComisiones = () => {
    setTipoDocumentoComisiones("");
    setPdfTempData(null);
  };

  return (
    <div className="row">
      <div className="col-sm-12">
        <table className="table table-bordered table-sm tablaResponsiva">
          <thead>
            <tr>
              <th className="text-center"></th>
              <th className="text-center" style={{ maxWidth: "100px" }}>
                <Select
                  options={tipoDocumentosComisiones}
                  onChange={handleTipoDocumentoComisionesChange}
                  placeholder="Tipo de documento"
                  isDisabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  value={tipoDocumentoComisiones}
                />
              </th>
              <th className="text-center" style={{ maxWidth: "80px" }}>
                <label
                  htmlFor="pdfArchivo-upload"
                  className="btn btn-primary mb-0 d-flex align-items-center justify-content-center py-2 px-3"
                >
                  {pdfTempData ? (
                    <i className="fal fa-solid fa-repeat mr-1"></i>
                  ) : (
                    <i className="fal fa-file-pdf mr-1"></i>
                  )}
                  <span>PDF/IMG</span>
                  <input
                    id="pdfArchivo-upload"
                    type="file"
                    disabled={
                      estatus.estatus !== "Nuevo" &&
                      estatus.estatus !== "GRABADO"
                    }
                    accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
                    style={{ display: "none" }}
                    onChange={handleFileComisionesUpload}
                  />
                </label>
              </th>
              <th className="text-center" style={{ maxWidth: "80px" }}>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center py-2 px-3"
                  disabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  onClick={agregarDocumentoComisiones}
                >
                  <i className="fal fa-plus mr-1"></i> Agregar
                </button>
              </th>
            </tr>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">Documento</th>
              <th className="text-center">
                <i className="fal fa-file"></i>
              </th>
              <th className="text-center">
                <i className="fal fa-cog"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {documentosComisiones.map((doc, i) => (
              <tr key={i} className={!doc.descartado ? "" : "table-danger"}>
                <td className="text-center">{i + 1}</td>
                {/* <td>{doc?.codigoTipoDocumentoComisiones} - {doc?.nombreTipoDocumentoComisiones}</td> */}
                <td>{doc?.DOCUMENTO}</td>
                <td className="text-center">
                  {estatus.estatus !== "CANCELADO" && doc.NOMBRE_ARCHIVO && (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="text-secondary" style={{ marginRight: "15px" }}>{doc.NOMBRE_ARCHIVO}</span>
                      {/* <FontAwesomeIcon
                        icon={faDownload}
                        style={{
                          marginRight: "8px",
                          // cursor: estatus.estatus === "Nuevo" && "pointer",
                          cursor: "pointer",
                        }}
                        onClick={() => handleFileComisionesDownload(doc?.pdfArchivo)}
                      /> */}

                      {/* {(estatus.estatus === "Nuevo" || !doc.renglonId) && (
                        <label
                          htmlFor={`pdfArchivo-replace-${i}`}
                          style={{
                            cursor:
                              (estatus.estatus === "Nuevo" || !doc.renglonId) &&
                              "pointer",
                          }}
                          className="mt-2"
                        >
                          <FontAwesomeIcon icon={faRetweet} />
                          <input
                            id={`pdfArchivo-replace-${i}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileComisionesUpload(e, i)}
                          />
                        </label>
                      )} */}
                    </div>
                  )}
                </td>
                {(estatus.estatus === "Nuevo" ||
                  estatus.estatus === "GRABADO") && (
                    <td className="text-center">
                      {/* {estatus.propietario && (
                        <i
                          className="fal fa-trash-alt text-danger cursor-pointer font-weight-bold"
                          onClick={() => eliminarDocumentoComisiones(i)}
                        ></i>
                      )} */}
                    </td>
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
