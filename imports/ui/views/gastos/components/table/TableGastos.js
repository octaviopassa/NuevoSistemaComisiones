import React, { useState } from "react";
import {
  faDownload,
  faGear,
  faInfoCircle,
  faRetweet,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { UncontrolledTooltip } from "reactstrap";
import toastr from "toastr";
import {
  ClientesService,
  DocumentosService,
  EmpresasService,
  ProveedoresService,
  TipoGastosService,
} from "../../../../services";
import {
  ModalCatalogoProveedores,
  ModalButton,
  ModalImportes,
  ModalCombustible,
  ModalCatalogoClientes,
} from "../modals";
import { useFetchData } from "../../../../hooks";
import { useGastosData } from "../../store";
import { format } from "date-fns";
import { useUserSession } from "../../../../store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { extraerRFC, validarMesYAnio } from "../../../../../utils/utils";

export const TableGastos = () => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [tipoGastoSeleccionado, setTipoGastoSeleccionado] = useState("");
  const [concepto, setConcepto] = useState("");
  const [detalleGasto, setDetalleGasto] = useState("");
  const [atencionClienteSeleccionado, setAtencionClienteSeleccionado] =
    useState(null);
  const [xmlTempData, setXmlTempData] = useState(null);
  const [pdfTempData, setPdfTempData] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [importesData, setImportesData] = useState({
    fecha: "",
    folio: "",
    subtotal: "0.00",
    impuesto: "0.00",
    iva_16: "0.00",
    iva_8: "0.00",
    ieps: "0.00",
    ish: "0.00",
    tua: "0.00",
    ret: "0.00",
    total: "0.00",
  });
  const MySwal = withReactContent(Swal);
  const { session } = useUserSession();
  const {
    setDocumentos,
    documentos,
    estatus,
    folio: folioGlobal,
    plazaSeleccionada,
    gastosDate,
  } = useGastosData();
  const { data: dataTipoGastos } = useFetchData(TipoGastosService.getAll);
  const tipoGastos = dataTipoGastos?.map((tg) => ({
    value: tg.Codigo,
    label: tg.Nombre,
  }));

  const proveedoresOptions = async (inputValue) => {
    if (inputValue.length >= 3) {
      try {
        const proveedores = await ProveedoresService.getAllWithName({
          search: inputValue,
        });
        return proveedores.map((p) => ({
          value: p.Codigo,
          label: p.Nombre,
        }));
      } catch (error) {
        console.error("Error al cargar proveedores", error);
        return [];
      }
    }
    return [];
  };

  const clientesOptions = async (inputValue) => {
    if (inputValue.length >= 3) {
      try {
        const clientes = await ClientesService.getAllByName({
          search: inputValue,
        });

        return clientes.map((p) => ({
          value: p.Codigo,
          label: p.Nombre,
        }));
      } catch (error) {
        console.error("Error al cargar clientes", error);
        return [];
      }
    }
    return [];
  };

  const handleXmlUpload = async (event, index) => {
    const file = event.target.files[0];
    try {
      if (file && file.name.endsWith(".xml")) {
        const fileName = file.name;
        const reader = new FileReader();

        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          const byteArray = new Uint8Array(arrayBuffer);
          const base64String = btoa(String.fromCharCode.apply(null, byteArray));
          const xmlContent = new TextDecoder().decode(arrayBuffer);
          const xmlDoc = new DOMParser().parseFromString(
            xmlContent,
            "text/xml"
          );

          let uuid;
          const comprobante =
            xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
          const metodo = comprobante.getAttribute("MetodoPago");
          const tipo = comprobante.getAttribute("TipoDeComprobante");
          const rfcReceptor = comprobante
            .getElementsByTagName("cfdi:Receptor")[0]
            .getAttribute("Rfc");
          const rfcEmisor = comprobante
            .getElementsByTagName("cfdi:Emisor")[0]
            .getAttribute("Rfc");
          const fecha = comprobante.getAttribute("Fecha") || "";

          //TODO: Refactorizar IF's por funciones de validación
          if (
            session.profile.baseDatos === "IANSA" ||
            session.profile.baseDatos === "Smartcarb"
          ) {
            if (validarMesYAnio(fecha, gastosDate)) {
              toastr.error(
                "La fecha del archivo XML no coincide con el mes y año actual"
              );
              event.target.files = null;
              return;
            }
          }
          if (rfcEmisor !== extraerRFC(proveedorSeleccionado.label)) {
            toastr.error(
              "El RFC del emisor no coincide con el RFC del proveedor seleccionado o no has seleccionado un proveedor"
            );
            event.target.files = null;
            return;
          }

          const complemento =
            xmlDoc.getElementsByTagName("cfdi:Complemento")[0] || null;

          if (!complemento) {
            toastr.error("El archivo XML no contiene un complemento");
            event.target.files = null;
            return;
          }

          const timbreFiscal = complemento.getElementsByTagName(
            "tfd:TimbreFiscalDigital"
          )[0];

          if (timbreFiscal) {
            const uuidFiscal = timbreFiscal.getAttribute("UUID");
            const existingDocument = documentos.some(
              (doc) => doc?.xmlArchivo?.uuid === uuidFiscal
            );

            const existingInDatabase = await DocumentosService.validarXml(
              uuidFiscal
            );

            if (!existingInDatabase.isValid) {
              toastr.warning(existingInDatabase.message);
              event.target.files = null;
              return;
            }

            if (existingDocument) {
              toastr.warning(
                "XML de timbre ya existe dentro de los documentos"
              );
              event.target.files = null;
              return;
            }

            if (!uuidFiscal) {
              toastr.warning("XML de timbre invalido");
              event.target.files = null;
              return;
            }

            uuid = uuidFiscal;
          } else {
            toastr.warning("XML de tipo invalido");
            event.target.files = null;
            return;
          }

          const [empresaRfc] = await EmpresasService.getRFC(
            session.profile.baseDatos
          );

          if (tipo !== "I") {
            toastr.error("XML de tipo invalido, debe ser de tipo Ingreso");
            event.target.files = null;
            return;
          }

          if (rfcReceptor !== empresaRfc.rfc) {
            toastr.error(
              "El RFC del receptor no coincide con el RFC de la empresa con la que has iniciado sesión"
            );
            event.target.files = null;
            return;
          }

          if (!comprobante) {
            toastr.error(
              "El archivo XML no contiene un nodo 'cfdi:Comprobante'"
            );
            event.target.files = null;
            return;
          }

          if (metodo !== "PUE") {
            toastr.error("XML de tipo invalido");
            event.target.files = null;
            return;
          }

          const datos = {
            fecha,
            folio: comprobante.getAttribute("Folio") || "",
            subtotal: comprobante.getAttribute("SubTotal") || "0",
            total: comprobante.getAttribute("Total") || "0",
            impuesto: "0",
            iva_16: "0",
            iva_8: "0",
            ieps: "0",
            ish: "0",
            tua: "0",
            ret: "0",
          };
          const impuestosList = Array.from(
            comprobante.getElementsByTagName("cfdi:Impuestos") || []
          );

          impuestosList.forEach((impuestos) => {
            const totalImpuestosTrasladados = impuestos.getAttribute(
              "TotalImpuestosTrasladados"
            );

            if (totalImpuestosTrasladados) {
              const traslados = impuestos.getElementsByTagName("cfdi:Traslado");

              for (let traslado of traslados) {
                const impuesto = traslado.getAttribute("Impuesto");
                const tasa = traslado.getAttribute("TasaOCuota");
                const importe = traslado.getAttribute("Importe") || "0";

                if (impuesto === "002") {
                  if (tasa === "0.160000") {
                    datos.iva_16 = (
                      parseFloat(datos.iva_16) + parseFloat(importe)
                    ).toFixed(2);
                  } else if (tasa === "0.080000") {
                    datos.iva_8 = (
                      parseFloat(datos.iva_8) + parseFloat(importe)
                    ).toFixed(2);
                  }
                } else if (impuesto === "003") {
                  // IEPS
                  datos.ieps = (
                    parseFloat(datos.ieps) + parseFloat(importe)
                  ).toFixed(2);
                }
              }
            }

            const totalImpuestosRetenidos = impuestos.getAttribute(
              "TotalImpuestosRetenidos"
            );

            if (totalImpuestosRetenidos) {
              datos.ret = totalImpuestosRetenidos;
            }
          });

          const impuestosLocales = complemento.getElementsByTagName(
            "implocal:ImpuestosLocales"
          )[0];

          const impuestoTUA = complemento.getElementsByTagName(
            "aerolineas:Aerolineas"
          )[0];

          if (impuestoTUA) {
            const totalTUA = impuestoTUA.getAttribute("TUA");

            if (totalTUA) {
              datos.tua = totalTUA;
            }
          }

          if (impuestosLocales) {
            const totaldeRetenciones =
              impuestosLocales.getAttribute("TotaldeRetenciones");

            if (totaldeRetenciones) {
              datos.ret = totaldeRetenciones;
            }

            const trasladosLocales = impuestosLocales.getElementsByTagName(
              "implocal:TrasladosLocales"
            );
            for (let traslado of trasladosLocales) {
              const impuesto = traslado.getAttribute("ImpLocTrasladado");
              const importe = traslado.getAttribute("Importe") || "0";

              if (impuesto === "ISH") {
                datos.ish = (
                  parseFloat(datos.ish) + parseFloat(importe)
                ).toFixed(2);
              } else if (impuesto === "TUA") {
                datos.tua = (
                  parseFloat(datos.tua) + parseFloat(importe)
                ).toFixed(2);
              }
            }
          }

          datos.impuesto = parseFloat(
            datos.ieps +
              datos.iva_16 +
              datos.iva_8 +
              datos.ish +
              datos.tua +
              datos.ret
          ).toFixed(2);

          for (let key in datos) {
            if (key !== "fecha" && key !== "folio") {
              const valor = parseFloat(datos[key]);
              datos[key] = isNaN(valor) ? "0.00" : valor.toFixed(2);
            }
          }

          const xmlData = {
            archivo: {
              nombre: fileName,
              contenido: base64String,
              uuid,
            },
            importes: datos,
          };

          if (index !== undefined) {
            setDocumentos(
              documentos.map((doc, i) =>
                i === index
                  ? {
                      ...doc,
                      xmlArchivo: xmlData.archivo,
                      importes: xmlData.importes,
                    }
                  : doc
              )
            );
          } else {
            setXmlTempData(xmlData);
          }

          toastr.success("Archivo XML cargado y analizado correctamente");
        };

        reader.readAsArrayBuffer(file);

        event.target.files = null;
      } else {
        toastr.error("Por favor, seleccione un archivo XML válido");
        event.target.files = null;
      }
    } catch (error) {
      console.log(error);
      toastr.error("Ocurrio un error al cargar el archivo XML");
      event.target.files = null;
    }
  };

  const handleFileUpload = (event, index) => {
    try {
      const file = event.target.files[0];
      const fileName = file.name;
      const reader = new FileReader();
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
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode.apply(null, byteArray));
        const pdfData = {
          nombre: fileName,
          contenido: base64String,
        };

        if (index !== undefined) {
          setDocumentos(
            documentos.map((doc, i) =>
              i === index ? { ...doc, pdfArchivo: pdfData } : doc
            )
          );
        } else {
          setPdfTempData(pdfData);
        }
        toastr.success("Archivo cargado correctamente");
      };

      reader.readAsArrayBuffer(file);
      // reader.readAsDataURL(file);
    } catch (error) {
      console.error("Archivo inválido seleccionado");
      toastr.error("Por favor, seleccione un archivo PDF válido");
    }
  };

  const handleXmlDownload = (index) => {
    const doc = documentos[index];
    if (doc.xmlArchivo) {
      // Convertir la cadena base64 a un Blob
      const byteCharacters = atob(doc.xmlArchivo.contenido);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/xml" });

      // Crear URL del objeto y descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.xmlArchivo.nombre || "documento.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.error("No se encontró archivo XML para este documento");
      toastr.error("No hay archivo XML disponible para descargar");
    }
  };

  const handleFileDownload = (index) => {
    const doc = documentos[index];
    if (doc.pdfArchivo && doc.pdfArchivo.contenido) {
      try {
        // Limpiar y convertir la cadena base64
        const cleanedBase64 = doc.pdfArchivo.contenido.replace(
          /[^A-Za-z0-9+/=]/g,
          ""
        ); // Limpiar base64
        const byteCharacters = atob(cleanedBase64); // Decodificar base64
        const byteNumbers = new Array(byteCharacters.length);

        // Convertir caracteres a códigos
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers); // Crear Uint8Array

        // Crear un Blob a partir del byteArray
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Crear URL del objeto y descargar
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.pdfArchivo.nombre || "documento.pdf"; // Nombre del archivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Limpiar la URL del objeto
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

  const handleSelectProveedor = (selectedOption) => {
    setProveedorSeleccionado(selectedOption);
  };

  const handleSelectAtencionCliente = (selectedOption) => {
    setAtencionClienteSeleccionado(selectedOption);
    setDetalleGasto(selectedOption);
  };

  const handleTipoGastoChange = (selectedOption) => {
    setTipoGastoSeleccionado(selectedOption);

    if (selectedOption) {
      switch (selectedOption.Codigo) {
        case 1:
          setDetalleGasto("GASTOS DE VIAJE");
          break;
        case 17:
          setDetalleGasto("GASTOS DE VIAJE EXTRANJERO");
          break;
        default:
          setDetalleGasto(""); // Limpiar el detalle para otros códigos
      }
    } else {
      setDetalleGasto(""); // Limpiar el detalle si no hay selección
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: 200,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const tipoDocumentoOptions = [
    { value: "Factura", label: "Factura" },
    { value: "Nota", label: "Nota" },
  ];

  const handleTipoDocumentoChange = (selectedOption) => {
    setTipoDocumento(selectedOption);
  };

  const agregarDocumento = () => {
    const clienteValidation =
      session.profile.WEB_REACT_CLIENTE_OBLIGATORIO ||
      tipoGastoSeleccionado === 17;

    if (
      !tipoDocumento ||
      !proveedorSeleccionado ||
      !tipoGastoSeleccionado ||
      !concepto ||
      (clienteValidation && !atencionClienteSeleccionado)
    ) {
      toastr.warning("Por favor, llene todos los campos requeridos.");
      return;
    }

    let importesFinales = {};
    let xmlArchivoFinal = null;
    let pdfArchivoFinal = null;

    if (tipoDocumento.value === "Nota") {
      importesFinales = {
        subtotal: parseFloat(importesData.subtotal) || 0,
        impuesto: parseFloat(importesData.impuesto) || 0,
        iva_16: parseFloat(importesData.iva_16) || 0,
        iva_8: parseFloat(importesData.iva_8) || 0,
        ieps: parseFloat(importesData.ieps) || 0,
        ish: parseFloat(importesData.ish) || 0,
        tua: parseFloat(importesData.tua) || 0,
        ret: parseFloat(importesData.ret) || 0,
        fecha: importesData.fecha,
        folio: importesData.folio,
        total: parseFloat(importesData.total) || 0,
      };
    } else {
      if (!xmlTempData) {
        toastr.error(
          "Por favor, adjunte un archivo XML para este tipo de documento."
        );
        return;
      }
      importesFinales = xmlTempData.importes;
      xmlArchivoFinal = xmlTempData.archivo;
    }

    // Asegurarse de que todos los valores numéricos sean números y tengan dos decimales
    for (let key in importesFinales) {
      if (key !== "fecha" && key !== "folio") {
        importesFinales[key] = parseFloat(importesFinales[key]).toFixed(2);
      }
    }

    // Manejar el archivo PDF
    if (pdfTempData) {
      pdfArchivoFinal = pdfTempData;
    }

    const nuevoDocumento = {
      tipoDocumento: tipoDocumento.value,
      proveedor: proveedorSeleccionado,
      tipoGasto: tipoGastoSeleccionado,
      concepto,
      detalleGasto,
      importes: importesFinales,
      xmlArchivo: xmlArchivoFinal,
      pdfArchivo: pdfArchivoFinal,
      descartado: false,
    };

    setDocumentos([...documentos, nuevoDocumento]);
    limpiarCampos();
    setXmlTempData(null);
    setPdfTempData(null);

    toastr.success("Documento agregado con éxito");
  };

  const eliminarDocumento = async (index) => {
    if (!documentos.length) {
      toastr.warning("No hay documentos para eliminar");
      return;
    }

    if (documentos[index].renglonId) {
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

      await DocumentosService.eliminarXML(documentos[index].renglonId);
    }

    setDocumentos(documentos.filter((_, i) => i !== index));
    toastr.success("Documento eliminado");
  };

  const limpiarCampos = () => {
    setTipoDocumento("");
    setProveedorSeleccionado(null);
    setTipoGastoSeleccionado(null);
    setAtencionClienteSeleccionado(null);
    setConcepto("");
    setDetalleGasto("");
    setXmlTempData(null);
    setPdfTempData(null);
    setImportesData({
      fecha: "",
      folio: "",
      subtotal: "0.00",
      impuesto: "0.00",
      iva_16: "0.00",
      iva_8: "0.00",
      ieps: "0.00",
      ish: "0.00",
      tua: "0.00",
      ret: "0.00",
      total: "0.00",
    });
  };

  const handleDescartar = async (documento) => {
    const data = {
      folio: folioGlobal,
      plaza: plazaSeleccionada,
      detalleId: documento.renglonId,
      cod_usu: session.profile.COD_USU,
    };

    if (!data.detalleId) {
      toastr.error("Por favor, seleccione un documento");
      return;
    }

    try {
      const descartado = await DocumentosService.descartarDetalle(data);

      if (!descartado.isValid) {
        toastr.error("No se pudo descartar el detalle");
        return;
      }

      const index = documentos.findIndex(
        (doc) => doc.renglonId === documento.renglonId
      );
      const newDocumentos = [...documentos];
      newDocumentos[index] = { ...newDocumentos[index], descartado: true };
      setDocumentos(newDocumentos);
      toastr.success("Detalle descartado correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  const handleHabilitar = async (documento) => {
    const data = {
      folio: folioGlobal,
      plaza: plazaSeleccionada,
      detalleId: documento.renglonId,
      cod_usu: session.profile.COD_USU,
    };

    try {
      const habilitado = await DocumentosService.habilitarDetalle(data);

      if (!habilitado.isValid) {
        toastr.error("No se pudo descartar el gasto");
        return;
      }

      const index = documentos.findIndex(
        (doc) => doc.renglonId === documento.renglonId
      );
      const newDocumentos = [...documentos];
      newDocumentos[index] = { ...newDocumentos[index], descartado: false };
      setDocumentos(newDocumentos);
      toastr.success("Detalle habilitado correctamente");
    } catch (error) {
      console.log(error);
    }
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
                  options={tipoDocumentoOptions}
                  onChange={handleTipoDocumentoChange}
                  placeholder="Tipo de documento"
                  isDisabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  value={tipoDocumento}
                />
              </th>
              <th className="text-center">
                <AsyncSelect
                  id="proveedor"
                  loadOptions={proveedoresOptions}
                  onChange={handleSelectProveedor}
                  value={proveedorSeleccionado}
                  placeholder="Proveedor"
                  isDisabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  styles={customStyles}
                />
              </th>
              <th className="text-center">
                <Select
                  options={tipoGastos}
                  onChange={handleTipoGastoChange}
                  isDisabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  value={tipoGastoSeleccionado}
                  placeholder="Tipo de gasto"
                />
              </th>
              <th className="text-center">
                <input
                  className="form-control"
                  type="text"
                  value={concepto}
                  disabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Concepto"
                />
              </th>
              <th className="text-center" style={{ minWidth: "105px" }}>
                {tipoGastoSeleccionado?.value === 1 && (
                  <ModalButton
                    color=""
                    buttonClasses={`px-2 py-2 btn btn-sm btn-secondary d-flex align-items-center justify-content-center w-100 ${
                      estatus.estatus !== "Nuevo" &&
                      estatus.estatus !== "GRABADO"
                        ? "disabled"
                        : ""
                    }`}
                    text={detalleGasto ? `Editar Gasto` : "Agregar Gasto"}
                    ModalComponent={ModalCombustible}
                    setDetalleGasto={setDetalleGasto}
                    detalleGasto={detalleGasto}
                  />
                )}
              </th>
              <th className="text-center" style={{ minWidth: "105px" }}>
                {(tipoGastoSeleccionado?.value === 17 ||
                  session.profile.WEB_REACT_CLIENTE_OBLIGATORIO) && (
                  <AsyncSelect
                    id="atencionCliente"
                    loadOptions={clientesOptions}
                    onChange={handleSelectAtencionCliente}
                    placeholder="Seleccione cliente"
                    isDisabled={
                      estatus.estatus !== "Nuevo" &&
                      estatus.estatus !== "GRABADO"
                    }
                    value={atencionClienteSeleccionado}
                    styles={customStyles}
                  />
                )}
              </th>
              <th className="text-center" style={{ minWidth: "105px" }}>
                {tipoDocumento.value === "Nota" && (
                  <ModalButton
                    color=""
                    text={
                      importesData.total > 0
                        ? "Editar Importe"
                        : "Agregar Importe"
                    }
                    buttonClasses={`px-2 py-2 btn btn-sm btn-info d-flex align-items-center justify-content-center w-100 ${
                      estatus.estatus !== "Nuevo" &&
                      estatus.estatus !== "GRABADO"
                        ? "disabled"
                        : ""
                    }`}
                    ModalComponent={ModalImportes}
                    importesData={importesData}
                    setImportesData={setImportesData}
                  />
                )}
              </th>

              <th className="text-center" style={{ maxWidth: "80px" }}>
                {tipoDocumento.value == "Factura" && (
                  <>
                    <label
                      htmlFor="xml-upload"
                      className="btn btn-primary mb-0 d-flex align-items-center justify-content-center py-2 px-3"
                      onClick={() => {
                        if (!proveedorSeleccionado || !gastosDate) {
                          toastr.warning("Por favor, seleccione un proveedor");
                          return;
                        }
                      }}
                    >
                      {xmlTempData ? (
                        <i className="fal fa-solid fa-repeat mr-1"></i>
                      ) : (
                        <i className="fal fa-file-alt mr-1"></i>
                      )}
                      <span>XML</span>
                    </label>
                    <input
                      id="xml-upload"
                      type="file"
                      accept=".xml"
                      disabled={
                        (estatus.estatus !== "Nuevo" &&
                          estatus.estatus !== "GRABADO") ||
                        !proveedorSeleccionado ||
                        !gastosDate
                      }
                      style={{ display: "none" }}
                      onChange={handleXmlUpload}
                    />
                  </>
                )}
              </th>
              <th className="text-center" style={{ maxWidth: "80px" }}>
                <label
                  htmlFor="pdf-upload"
                  className="btn btn-primary mb-0 d-flex align-items-center justify-content-center py-2 px-3"
                >
                  {pdfTempData ? (
                    <i className="fal fa-solid fa-repeat mr-1"></i>
                  ) : (
                    <i className="fal fa-file-pdf mr-1"></i>
                  )}
                  <span>PDF/IMG</span>
                  <input
                    id="pdf-upload"
                    type="file"
                    disabled={
                      estatus.estatus !== "Nuevo" &&
                      estatus.estatus !== "GRABADO"
                    }
                    accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </label>
              </th>
              <th className="text-center" style={{ maxWidth: "80px" }}>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center py-2 px-3"
                  disabled={
                    estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                  }
                  onClick={agregarDocumento}
                >
                  <i className="fal fa-plus mr-1"></i> Agregar
                </button>
              </th>
            </tr>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">Documento</th>
              <th className="text-center">
                Proveedor
                <ModalButton
                  icon={faGear}
                  ModalComponent={ModalCatalogoProveedores}
                />
              </th>
              <th className="text-center">Tipo de gasto</th>
              <th className="text-center">Concepto</th>
              <th className="text-center">Detalle</th>
              <th className="text-center">
                Cliente
                <ModalButton
                  icon={faGear}
                  ModalComponent={ModalCatalogoClientes}
                />
              </th>
              <th
                className="text-center"
                style={{
                  minWidth: "105px !important",
                  maxWidth: "130px !important",
                }}
              >
                Importe
              </th>
              <th className="text-center">
                <i className="fal fa-file-alt"></i>
              </th>
              <th className="text-center">
                <i className="fal fa-file"></i>
              </th>
              <th className="text-center">
                <i className="fal fa-cog"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc, i) => (
              <tr key={i} className={!doc.descartado ? "" : "table-danger"}>
                <td className="text-center">{i + 1}</td>
                <td>{doc?.tipoDocumento}</td>
                <td>{doc?.proveedor?.label}</td>
                <td>{doc?.tipoGasto?.label}</td>
                <td>{doc?.concepto}</td>
                <td>
                  {doc.tipoGasto.label === "GASOLINA" && (
                    <span className="">
                      {doc.tipoGasto.label}
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="ml-1"
                        style={{ color: "orange", cursor: "pointer" }}
                        id={`tipoGasto-${i}`}
                      />
                      <UncontrolledTooltip
                        target={`tipoGasto-${i}`}
                        placement="right"
                      >
                        <strong>Detalles de importes:</strong>
                        <br />
                        Conductor: {doc.detalleGasto.conductor?.label}
                        <br />
                        Combustible: {doc.detalleGasto.combustible?.label}
                        <br />
                        Gasolinera: {doc.detalleGasto.gasolinera?.label}
                        <br />
                        Kilometraje: {doc.detalleGasto?.kilometraje}
                        <br />
                        Litros: {doc.detalleGasto?.litros}
                        <br />
                        Vehiculo: {doc.detalleGasto.vehiculo?.label}
                      </UncontrolledTooltip>
                    </span>
                  )}
                </td>
                <td>
                  {(doc.tipoGasto.label === "ATENCION A CLIENTES" ||
                    session.profile.WEB_REACT_CLIENTE_OBLIGATORIO) && (
                    <>
                      {doc.detalleGasto?.label && (
                        <>
                          <strong>Cliente: </strong>
                          <br />
                          {doc.detalleGasto.label}
                        </>
                      )}
                    </>
                  )}
                </td>
                <td>
                  <span>
                    <strong>Fecha: </strong>{" "}
                    {isNaN(new Date(doc.importes?.fecha))
                      ? doc.importes?.fecha || "N/A"
                      : format(new Date(doc.importes?.fecha), "dd/MM/yyyy")}
                  </span>
                  <br />
                  <span>
                    <strong>Total:</strong> $
                    {parseFloat(doc.importes?.total || 0).toFixed(2)}{" "}
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      style={{ color: "blue", cursor: "pointer" }}
                      id={`tooltip-${i}`}
                    />
                    <UncontrolledTooltip
                      target={`tooltip-${i}`}
                      placement="right"
                    >
                      <strong>Detalles de importes:</strong>
                      <br />
                      Subtotal: $
                      {parseFloat(doc.importes?.subtotal || 0).toFixed(2)}
                      <br />
                      IVA_16: $
                      {parseFloat(doc.importes?.iva_16 || 0).toFixed(2)}
                      <br />
                      IVA_8: ${parseFloat(doc.importes?.iva_8 || 0).toFixed(2)}
                      <br />
                      IEPS: ${parseFloat(doc.importes?.ieps || 0).toFixed(2)}
                      <br />
                      ISH: ${parseFloat(doc.importes?.ish || 0).toFixed(2)}
                      <br />
                      TUA: ${parseFloat(doc.importes?.tua || 0).toFixed(2)}
                      <br />
                      Ret: ${parseFloat(doc.importes?.ret || 0).toFixed(2)}
                    </UncontrolledTooltip>
                  </span>
                </td>
                <td>
                  {doc.tipoDocumento === "Factura" &&
                    estatus.estatus !== "CANCELADO" &&
                    (doc.xmlArchivo ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <FontAwesomeIcon
                          icon={faDownload}
                          style={{
                            marginRight: "8px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleXmlDownload(i)}
                          title={doc.xmlArchivo.nombre}
                        />
                        {estatus.estatus === "Nuevo" && (
                          <label
                            htmlFor={`xml-replace-${i}`}
                            style={{
                              cursor: "pointer",
                            }}
                            className="mt-2"
                          >
                            <FontAwesomeIcon icon={faRetweet} />
                            <input
                              id={`xml-replace-${i}`}
                              type="file"
                              accept=".xml"
                              disabled={estatus.estatus !== "Nuevo"}
                              style={{ display: "none" }}
                              onChange={(e) => handleXmlUpload(e, i)}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label
                        htmlFor={`xml-upload-${i}`}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <FontAwesomeIcon icon={faUpload} />
                        <input
                          id={`xml-upload-${i}`}
                          type="file"
                          accept=".xml"
                          disabled={estatus.estatus !== "Nuevo"}
                          style={{ display: "none" }}
                          onChange={(e) => handleXmlUpload(e, i)}
                        />
                      </label>
                    ))}
                </td>
                <td className="text-center">
                  {estatus.estatus !== "CANCELADO" && doc.pdfArchivo && (
                    <div className="d-flex align-items-center justify-content-center">
                      {doc.pdfArchivo.contenido !== "bnVsbA==" && (
                        <FontAwesomeIcon
                          icon={faDownload}
                          style={{
                            marginRight: "8px",
                            cursor: estatus.estatus === "Nuevo" && "pointer",
                          }}
                          onClick={() => handleFileDownload(i)}
                          title={doc.pdfArchivo.nombre}
                        />
                      )}

                      {(estatus.estatus === "Nuevo" || !doc.renglonId) && (
                        <label
                          htmlFor={`pdf-replace-${i}`}
                          style={{
                            cursor:
                              (estatus.estatus === "Nuevo" || !doc.renglonId) &&
                              "pointer",
                          }}
                          className="mt-2"
                        >
                          <FontAwesomeIcon icon={faRetweet} />
                          <input
                            id={`pdf-replace-${i}`}
                            type="file"
                            // disabled={
                            //   estatus.estatus !== "Nuevo" || doc.renglonId
                            // }
                            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileUpload(e, i)}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </td>
                {(estatus.estatus === "Nuevo" ||
                  estatus.estatus === "GRABADO") && (
                  <td className="text-center">
                    {estatus.estatus === "GRABADO" && doc.renglonId && (
                      <>
                        {doc.descartado ? (
                          <i
                            className="fal fa-check mr-2 text-success cursor-pointer font-weight-bold"
                            onClick={() => handleHabilitar(doc)}
                          ></i>
                        ) : (
                          <i
                            className="fal fa-ban mr-2 text-danger cursor-pointer font-weight-bold"
                            onClick={() => handleDescartar(doc)}
                          ></i>
                        )}
                      </>
                    )}
                    <i
                      className="fal fa-trash-alt text-danger cursor-pointer font-weight-bold"
                      onClick={() => eliminarDocumento(i)}
                    ></i>
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
