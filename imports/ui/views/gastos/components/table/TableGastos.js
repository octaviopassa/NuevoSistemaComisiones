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
  ProveedoresService,
  TipoGastosService,
} from "../../../../services";
import {
  ModalCatalogoProveedores,
  ModalButton,
  ModalCatalogoClientes,
  ModalImportes,
  ModalCombustible,
} from "../modals";
import { useFetchData } from "../../../../hooks";
import { useGastosData } from "../../store";
import { format } from "date-fns";

const GRABADO = false;

export const TableGastos = ({ clientesVisible }) => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
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

  const { setDocumentos, documentos } = useGastosData();
  console.log("documentos", documentos);
  const { data: dataTipoGastos } = useFetchData(TipoGastosService.getAll);
  const tipoGastos = dataTipoGastos.map((tg) => ({
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

  const handleXmlUpload = (event, index) => {
    const file = event.target.files[0];

    if (file && file.name.endsWith(".xml")) {
      const fileName = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode.apply(null, byteArray));
        const xmlContent = new TextDecoder().decode(arrayBuffer);
        const xmlDoc = new DOMParser().parseFromString(xmlContent, "text/xml");
        const comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];

        if (!comprobante) {
          toastr.error("El archivo XML no contiene un nodo 'cfdi:Comprobante'");
          return;
        }

        const datos = {
          fecha: comprobante.getAttribute("Fecha") || "",
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
            // datos.impuesto = totalImpuestosTrasladados;

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

        const complemento = xmlDoc.getElementsByTagName("cfdi:Complemento")[0];
        if (complemento) {
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
        }

        // suma total de todos los impuestos de todo tipo
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
    } else {
      toastr.error("Por favor, seleccione un archivo XML válido");
      event.target.value = null;
    }
  };

  //TODO: Fix this
  const handlePdfUpload = (event, index) => {
    try {
      const file = event.target.files[0];
      const fileName = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode.apply(null, byteArray));

        const pdfData = {
          nombre: fileName,
          contenido: base64String,
        };

        if (index !== undefined) {
          // Estamos actualizando un documento existente
          setDocumentos(
            documentos.map((doc, i) =>
              i === index ? { ...doc, pdfArchivo: pdfData } : doc
            )
          );
        } else {
          // Es una nueva carga
          setPdfTempData(pdfData);
        }

        toastr.success("Archivo PDF cargado correctamente");
      };

      reader.readAsArrayBuffer(file);
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

  const handlePdfDownload = (index) => {
    const doc = documentos[index];
    if (doc.pdfArchivo) {
      // Convertir la cadena base64 a un Blob
      const byteCharacters = atob(doc.pdfArchivo.contenido);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // Crear URL del objeto y descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.pdfArchivo.nombre || "documento.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.error("No se encontró archivo PDF para este documento");
      toastr.error("No hay archivo PDF disponible para descargar");
    }
  };

  const handleXmlDelete = (index) => {
    const newDocumentos = [...documentos];
    newDocumentos[index] = {
      ...newDocumentos[index],
      xmlArchivo: null,
      xmlData: null,
    };
    setDocumentos(newDocumentos);
    toastr.success("Archivo XML eliminado");
  };

  const handlePdfDelete = (index) => {
    const newDocumentos = [...documentos];
    newDocumentos[index] = {
      ...newDocumentos[index],
      pdfArchivo: null,
    };
    setDocumentos(newDocumentos);
    toastr.success("Archivo PDF eliminado");
  };

  const handleSelectProveedor = (selectedOption) => {
    setProveedorSeleccionado(selectedOption);
  };

  const handleSelectCliente = (selectedOption) => {
    setClienteSeleccionado(selectedOption);
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
    if (
      !tipoDocumento ||
      !proveedorSeleccionado ||
      !tipoGastoSeleccionado ||
      !concepto
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
      if (key !== "fecha") {
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
      cliente: clienteSeleccionado,
      tipoGasto: tipoGastoSeleccionado,
      concepto,
      detalleGasto,
      importes: importesFinales,
      xmlArchivo: xmlArchivoFinal,
      pdfArchivo: pdfArchivoFinal,
    };

    setDocumentos([...documentos, nuevoDocumento]);
    limpiarCampos();
    setXmlTempData(null);
    setPdfTempData(null);

    toastr.success("Documento agregado con éxito");
  };

  const eliminarDocumento = (index) => {
    if (!documentos.length) {
      toastr.warning("No hay documentos para eliminar");
      return;
    }

    setDocumentos(documentos.filter((_, i) => i !== index));
    toastr.success("Documento eliminado");
  };

  const limpiarCampos = () => {
    setTipoDocumento("");
    setProveedorSeleccionado(null);
    setClienteSeleccionado(null);
    setTipoGastoSeleccionado(null);
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

  return (
    <div className="row">
      <div className="col-sm-12">
        <table className="table table-bordered table-sm tablaResponsiva">
          <thead>
            <tr>
              <th className="text-center"></th>
              <th className="text-center">
                <Select
                  options={tipoDocumentoOptions}
                  onChange={handleTipoDocumentoChange}
                  placeholder="Tipo de documento"
                  styles={customStyles}
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
                  styles={customStyles}
                />
              </th>
              {clientesVisible == 1 && (
                <th className="text-center">
                  <AsyncSelect
                    id="cliente"
                    loadOptions={clientesOptions}
                    onChange={handleSelectCliente}
                    value={clienteSeleccionado}
                    placeholder="Cliente"
                    styles={customStyles}
                  />
                </th>
              )}
              <th className="text-center">
                <Select
                  options={tipoGastos}
                  onChange={handleTipoGastoChange}
                  value={tipoGastoSeleccionado}
                  placeholder="Tipo de gasto"
                />
              </th>
              <th className="text-center">
                <input
                  className="form-control"
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Concepto"
                />
              </th>
              <th className="text-center" style={{ minWidth: "105px" }}>
                {tipoGastoSeleccionado && (
                  <>
                    {tipoGastoSeleccionado.value === 1 ? (
                      <ModalButton
                        color=""
                        buttonClasses="px-2 py-2 btn btn-sm btn-secondary d-flex align-items-center justify-content-center w-100"
                        text={detalleGasto ? `Editar Gasto` : "Agregar Gasto"}
                        ModalComponent={ModalCombustible}
                        setDetalleGasto={setDetalleGasto}
                        detalleGasto={detalleGasto}
                      />
                    ) : tipoGastoSeleccionado.value === 17 ? (
                      <AsyncSelect
                        id="atencionCliente"
                        loadOptions={clientesOptions}
                        onChange={handleSelectAtencionCliente}
                        placeholder="Seleccione cliente"
                        value={atencionClienteSeleccionado}
                        styles={customStyles}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        value={detalleGasto}
                        onChange={(e) => setDetalleGasto(e.target.value)}
                        placeholder="Detalle del Gasto"
                      />
                    )}
                  </>
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
                    buttonClasses="px-2 py-2 btn btn-sm btn-info d-flex align-items-center justify-content-center w-100"
                    ModalComponent={ModalImportes}
                    importesData={importesData}
                    setImportesData={setImportesData}
                  />
                )}
              </th>

              <th className="text-center">
                {tipoDocumento.value == "Factura" && (
                  <>
                    <label
                      htmlFor="xml-upload"
                      className="btn btn-primary mb-0 d-flex align-items-center py-2 px-3"
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
                      style={{ display: "none" }}
                      onChange={handleXmlUpload}
                    />
                  </>
                )}
              </th>
              <th className="text-center">
                {tipoDocumento.value == "Factura" && (
                  <label
                    htmlFor="pdf-upload"
                    className="btn btn-primary mb-0 d-flex align-items-center py-2 px-3"
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
                      accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
                      style={{ display: "none" }}
                      onChange={handlePdfUpload}
                    />
                  </label>
                )}
              </th>
              <th>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center py-2 px-3"
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
              {clientesVisible == 1 && (
                <th className="text-center">
                  Cliente
                  <ModalButton
                    icon={faGear}
                    ModalComponent={ModalCatalogoClientes}
                  />
                </th>
              )}
              <th className="text-center">Tipo de gasto</th>
              <th className="text-center">Concepto</th>
              <th className="text-center">Detalle</th>
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
              {GRABADO ? (
                <th className="text-center">
                  <i className="fal fa-cog"></i>
                </th>
              ) : (
                <th className="text-center">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
                <td>{doc.tipoDocumento}</td>
                <td>{doc.proveedor?.label}</td>
                <td>{doc.cliente?.label}</td>
                <td>{doc.tipoGasto?.label}</td>
                <td>{doc.concepto}</td>
                <td>
                  {doc.tipoGasto.label === "GASOLINA" ? (
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
                        Conductor: {doc.detalleGasto.conductor.label}
                        <br />
                        Combustible: {doc.detalleGasto.combustible.label}
                        <br />
                        Gasolinera: {doc.detalleGasto.gasolinera.label}
                        <br />
                        Kilometraje: {doc.detalleGasto.kilometraje}
                        <br />
                        Litros: {doc.detalleGasto.litros}
                        <br />
                        Vehiculo: {doc.detalleGasto.vehiculo.label}
                      </UncontrolledTooltip>
                    </span>
                  ) : doc.tipoGasto.label === "ATENCION A CLIENTES" ? (
                    <>
                      <strong>Cliente: </strong> {doc.detalleGasto.label}
                    </>
                  ) : (
                    doc.detalleGasto
                  )}
                </td>
                <td>
                  <span>
                    <strong>Fecha: </strong>{" "}
                    {format(new Date(doc.importes?.fecha), "dd/MM/yyyy") ||
                      "N/A"}
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
                      {/* <br />
                      Impuesto: $
                      {parseFloat(doc.importes?.impuesto || 0).toFixed(2)} */}
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
                    (doc.xmlArchivo ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <FontAwesomeIcon
                          icon={faDownload}
                          style={{ marginRight: "5px", cursor: "pointer" }}
                          onClick={() => handleXmlDownload(i)}
                          title={doc.xmlArchivo.nombre}
                        />
                        <label
                          htmlFor={`xml-upload-${i}`}
                          style={{ cursor: "pointer" }}
                          className="mt-2"
                        >
                          <FontAwesomeIcon icon={faRetweet} />
                          <input
                            id={`xml-upload-${i}`}
                            type="file"
                            accept=".xml"
                            style={{ display: "none" }}
                            onChange={(e) => handleXmlUpload(e, i)}
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor={`xml-upload-${i}`}
                        style={{ cursor: "pointer" }}
                      >
                        <FontAwesomeIcon icon={faUpload} />
                        <input
                          id={`xml-upload-${i}`}
                          type="file"
                          accept=".xml"
                          style={{ display: "none" }}
                          onChange={(e) => handleXmlUpload(e, i)}
                        />
                      </label>
                    ))}
                </td>
                <td className="text-center">
                  {doc.tipoDocumento === "Factura" &&
                    (doc.pdfArchivo ? (
                      <>
                        <FontAwesomeIcon
                          icon={faDownload}
                          style={{ marginRight: "5px", cursor: "pointer" }}
                          onClick={() => handlePdfDownload(i)}
                          title={doc.pdfArchivo.nombre}
                        />
                        <FontAwesomeIcon
                          icon={faRetweet}
                          style={{ cursor: "pointer" }}
                          onClick={() => handlePdfDelete(i)}
                        />
                      </>
                    ) : (
                      <label
                        htmlFor={`pdf-upload-${i}`}
                        style={{ cursor: "pointer" }}
                      >
                        <FontAwesomeIcon icon={faUpload} />
                        <input
                          id={`pdf-upload-${i}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
                          style={{ display: "none" }}
                          onChange={(e) => handlePdfUpload(e, i)}
                        />
                      </label>
                    ))}
                </td>
                {GRABADO ? (
                  <td className="text-center">
                    <i className="fal fa-cog"></i>
                  </td>
                ) : (
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarDocumento(i)}
                    >
                      <i className="fal fa-trash-alt"></i> Eliminar
                    </button>
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
