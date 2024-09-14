import React, { useRef, useState } from "react";
import {
  faFileAlt,
  faFilePdf,
  faInfoCircle,
  faTrashAlt,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select/async";
import { UncontrolledTooltip } from "reactstrap";
import toastr from "toastr";
import Page from "../../components/global/Page";
import ClientesService from "../../services/clientes";
import ProveedoresService from "../../services/proveedores";
import useUserSession from "../../store/userSession";
import { GastosToolbar } from "./components";
import { ModalCombustible } from "./components/modals/ModalCombustible";
import ModalImportes from "./components/modals/ModalImportes";

const initialImportesData = {
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
};

const Gastos = () => {
  const [plazaSeleccionada, setPlazaSeleccionada] = useState("");
  const [combustibles, setCombustibles] = useState([]);

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [tipoGastoSeleccionado, setTipoGastoSeleccionado] = useState("");
  const [concepto, setConcepto] = useState("");
  const [detalleGasto, setDetalleGasto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [tipoGastos, setTipoGastos] = useState([]);

  const [atencionClienteSeleccionado, setAtencionClienteSeleccionado] =
    useState(null);
  const [xmlTempData, setXmlTempData] = useState(null);
  const [pdfTempData, setPdfTempData] = useState(null);

  const [tipoDocumento, setTipoDocumento] = useState("");
  const [modalImportesVisible, setModalImportesVisible] = useState(false);
  const [importesData, setImportesData] = useState(initialImportesData);

  const [xmlData, setXmlData] = useState(null);

  const [modalCombustibleVisible, setModalCombustibleVisible] = useState(false);
  const [clientesVisible, setClientesVisible] = useState(false);

  const tipoDocumentoRef = useRef(null);
  const proveedorRef = useRef(null);
  const clienteRef = useRef(null);
  const tipoGastoRef = useRef(null);

  const { session } = useUserSession();
  const user = {
    ...session,
  };

  const toggleModalImportes = () => {
    setModalImportesVisible(!modalImportesVisible);
  };

  const proveedoresOptions = async (inputValue) => {
    if (inputValue.length >= 3) {
      try {
        const proveedores = await ProveedoresService.getAll({
          search: inputValue,
          cod_usu: user.profile.COD_USU,
          baseDatos: user.profile.baseDatos,
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

  //! Error, no funciona
  const clientesOptions = async (inputValue) => {
    if (inputValue.length >= 3) {
      try {
        const clientes = await ClientesService.getAll({
          search: inputValue,
          cod_usu: user.profile.COD_USU,
          baseDatos: user.profile.baseDatos,
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
        const xmlDoc = new DOMParser().parseFromString(
          new TextDecoder().decode(arrayBuffer),
          "text/xml"
        );

        const comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
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

        const impuestos = comprobante.getElementsByTagName("cfdi:Impuestos")[0];
        if (impuestos) {
          datos.impuesto =
            impuestos.getAttribute("TotalImpuestosTrasladados") || "0";
          datos.ret = impuestos.getAttribute("TotalImpuestosRetenidos") || "0";

          const traslados = impuestos.getElementsByTagName("cfdi:Traslados")[0];
          if (traslados) {
            const trasladoItems =
              traslados.getElementsByTagName("cfdi:Traslado");
            for (let traslado of trasladoItems) {
              const impuesto = traslado.getAttribute("Impuesto");
              const tasa = traslado.getAttribute("TasaOCuota");
              const importe = traslado.getAttribute("Importe") || "0";

              if (impuesto === "002") {
                // IVA
                if (tasa === "0.160000") {
                  datos.iva_16 = importe;
                } else if (tasa === "0.080000") {
                  datos.iva_8 = importe;
                }
              } else if (impuesto === "003") {
                // IEPS
                datos.ieps = importe;
              }
            }
          }
        }

        // Convertir todos los valores numéricos y aplicar toFixed()
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
          // Estamos actualizando un documento existente
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
          // Es una nueva carga
          setXmlTempData(xmlData);
        }

        toastr.success("Archivo XML cargado y analizado correctamente");
      };

      reader.readAsArrayBuffer(file);
    } else {
      console.error("Archivo inválido seleccionado");
      toastr.error("Por favor, seleccione un archivo XML válido");
      event.target.value = null;
    }
  };

  const handlePdfUpload = (event, index) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
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
    } else {
      console.error("Archivo inválido seleccionado");
      toastr.error("Por favor, seleccione un archivo PDF válido");
      event.target.value = null;
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

  const renderDocumentos = () =>
    documentos.map((doc, i) => (
      <tr key={i}>
        <td className="text-center">{i + 1}</td>
        <td>{doc.tipoDocumento}</td>
        <td>{doc.proveedor?.Nombre}</td>
        <td>{doc.cliente?.Nombre}</td>
        <td>{doc.tipoGasto?.Nombre}</td>
        <td>{doc.concepto}</td>
        <td>{doc.detalleGasto}</td>
        <td>
          <span>Fecha: {doc.importes?.fecha || "N/A"}</span>,{" "}
          <span>
            Total: ${parseFloat(doc.importes?.total || 0).toFixed(2)}{" "}
            <FontAwesomeIcon
              icon={faInfoCircle}
              style={{ color: "blue", cursor: "pointer" }}
              id={`tooltip-${i}`}
            />
            <UncontrolledTooltip target={`tooltip-${i}`} placement="right">
              <strong>Detalles de importes:</strong>
              <br />
              Subtotal: ${parseFloat(doc.importes?.subtotal || 0).toFixed(2)}
              <br />
              Impuesto: ${parseFloat(doc.importes?.impuesto || 0).toFixed(2)}
              <br />
              IVA_16: ${parseFloat(doc.importes?.iva_16 || 0).toFixed(2)}
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
        <td className="text-center">
          {doc.tipoDocumento === "Factura" &&
            (doc.xmlArchivo ? (
              <>
                <FontAwesomeIcon
                  icon={faFileAlt}
                  style={{ marginRight: "5px", cursor: "pointer" }}
                  onClick={() => handleXmlDownload(i)}
                  title={doc.xmlArchivo.nombre}
                />
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleXmlDelete(i)}
                />
              </>
            ) : (
              <label htmlFor={`xml-upload-${i}`} style={{ cursor: "pointer" }}>
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
                  icon={faFilePdf}
                  style={{ marginRight: "5px", cursor: "pointer" }}
                  onClick={() => handlePdfDownload(i)}
                  title={doc.pdfArchivo.nombre}
                />
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  style={{ cursor: "pointer" }}
                  onClick={() => handlePdfDelete(i)}
                />
              </>
            ) : (
              <label htmlFor={`pdf-upload-${i}`} style={{ cursor: "pointer" }}>
                <FontAwesomeIcon icon={faUpload} />
                <input
                  id={`pdf-upload-${i}`}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handlePdfUpload(e, i)}
                />
              </label>
            ))}
        </td>
        <td className="text-center">
          <i className="fal fa-cog"></i>
        </td>
        <td className="text-center">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => eliminarDocumento(i)}
          >
            <i className="fal fa-trash-alt"></i> Eliminar
          </button>
        </td>
      </tr>
    ));

  const renderResumen = () =>
    resumen.map((item, i) => (
      <tr key={i}>
        <td>{item.tipoGasto}</td>
        <td className="text-right">${item.total.toFixed(2)}</td>
        <td className="text-right">${item.proSemanal.toFixed(2)}</td>
        <td className="text-right">{item.numSemanas}</td>
        <td className="text-right">${item.acumulado.toFixed(2)}</td>
      </tr>
    ));

  const handleSelectProveedor = (selectedOption) => {
    const proveedor = {
      Codigo: selectedOption.value,
      Nombre: selectedOption.label,
    };

    setProveedorSeleccionado(proveedor);
  };

  const handleSelectCliente = (selectedOption) => {
    const cliente = {
      Codigo: selectedOption.value,
      Nombre: selectedOption.label,
    };

    setClienteSeleccionado(cliente);
  };

  const handleSelectAtencionCliente = (selectedOption) => {
    const atencionCliente = {
      Codigo: selectedOption.value,
      Nombre: selectedOption.label,
    };

    setAtencionClienteSeleccionado(atencionCliente);
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

  const filterTipoGastos = (inputValue) => {
    return tipoGastos.filter((tipoGasto) =>
      tipoGasto.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptionsTipoGasto = (inputValue) =>
    new Promise((resolve) => {
      resolve(filterTipoGastos(inputValue));
    });

  const toggleModalCombustible = () => {
    setModalCombustibleVisible(!modalCombustibleVisible);
  };

  const tipoDocumentoOptions = [
    { value: "Factura", label: "Factura" },
    { value: "Nota", label: "Nota" },
  ];

  const handleTipoDocumentoChange = (selectedOption) => {
    setTipoDocumento(selectedOption.value);
  };

  const loadTipoDocumentoOptions = (inputValue, callback) => {
    const filteredOptions = tipoDocumentoOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filteredOptions);
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

    if (tipoDocumento === "Nota") {
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
      tipoDocumento,
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
      subtotal: "",
      impuesto: "",
      iva_16: "",
      iva_8: "",
      ieps: "",
      ish: "",
      tua: "",
      ret: "",
      total: "",
    });

    // Reiniciar los campos de selección
    if (tipoDocumentoRef.current) {
      tipoDocumentoRef.current.clearValue();
    }
    if (proveedorRef.current) {
      proveedorRef.current.clearValue();
    }
    if (clienteRef.current) {
      clienteRef.current.clearValue();
    }
    if (tipoGastoRef.current) {
      tipoGastoRef.current.clearValue();
    }
  };

  return (
    <Page name="Gastos">
      <GastosToolbar
        setPlazaSeleccionada={setPlazaSeleccionada}
        plazaSeleccionada={plazaSeleccionada}
        user={user}
        setTipoGastos={setTipoGastos}
        setCombustibles={setCombustibles}
        setClientesVisible={setClientesVisible}
      />

      <div className="row">
        <div className="col-sm-12">
          <table className="table table-bordered table-sm tablaResponsiva">
            <thead>
              <tr>
                <th className="text-center"></th>
                <th className="text-center">
                  <Select
                    cacheOptions
                    defaultOptions={tipoDocumentoOptions}
                    loadOptions={loadTipoDocumentoOptions}
                    onChange={handleTipoDocumentoChange}
                    placeholder="Tipo de documento"
                    styles={customStyles}
                    value={tipoDocumentoOptions.find(
                      (option) => option.value === tipoDocumento
                    )}
                  />
                </th>
                <th className="text-center">
                  <label style={{ fontSize: "8pt" }}>
                    {proveedorSeleccionado?.Nombre || ""}
                  </label>
                  <Select
                    id="proveedor"
                    cacheOptions
                    loadOptions={proveedoresOptions}
                    defaultOptions
                    onChange={handleSelectProveedor}
                    placeholder="Proveedor"
                    styles={customStyles}
                  />
                </th>
                {clientesVisible == 1 ? (
                  <th className="text-center">
                    <label style={{ fontSize: "8pt" }}>
                      {clienteSeleccionado?.Nombre || ""}
                    </label>
                    <Select
                      id="cliente"
                      cacheOptions
                      loadOptions={clientesOptions}
                      defaultOptions
                      onChange={handleSelectCliente}
                      placeholder="Cliente"
                      styles={customStyles}
                    />
                  </th>
                ) : null}
                <th className="text-center">
                  <label style={{ fontSize: "8pt" }}>
                    {tipoGastoSeleccionado?.Nombre || ""}
                  </label>
                  <Select
                    cacheOptions
                    defaultOptions={tipoGastos}
                    loadOptions={promiseOptionsTipoGasto}
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
                <th className="text-center">
                  {tipoGastoSeleccionado && (
                    <>
                      {tipoGastoSeleccionado.value === 1 ? (
                        <button
                          className="btn btn-link"
                          onClick={toggleModalCombustible}
                        >
                          Ver adjunto
                        </button>
                      ) : tipoGastoSeleccionado.value === 17 ? (
                        <>
                          <label style={{ fontSize: "8pt" }}>
                            {atencionClienteSeleccionado
                              ? atencionClienteSeleccionado.Nombre
                              : ""}
                          </label>
                          <Select
                            id="atencionCliente"
                            cacheOptions
                            loadOptions={clientesOptions}
                            defaultOptions
                            onChange={handleSelectAtencionCliente}
                            placeholder="Seleccione cliente"
                            value={atencionClienteSeleccionado}
                          />
                        </>
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
                <th className="text-center">
                  {tipoDocumento === "Nota" ? (
                    <a href="#" onClick={toggleModalImportes}>
                      Registrar importes
                    </a>
                  ) : (
                    <></>
                  )}
                </th>

                <th className="text-center">
                  {tipoDocumento == "Factura" && (
                    <>
                      <label
                        htmlFor="xml-upload"
                        className="btn btn-primary mb-0"
                      >
                        <i className="fal fa-file-alt"></i> XML
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
                  {tipoDocumento == "Factura" && (
                    <>
                      <label
                        htmlFor="pdf-upload"
                        className="btn btn-primary mb-0"
                      >
                        <i className="fal fa-file-pdf"></i> PDF
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          style={{ display: "none" }}
                          onChange={handlePdfUpload}
                        />
                      </label>
                    </>
                  )}
                </th>

                <th className="text-center">
                  <button className="btn btn-danger">
                    <i className="fal fa-trash-alt"></i> Eliminar
                  </button>
                </th>
                <th>
                  <button
                    className="btn btn-primary float-right"
                    onClick={agregarDocumento}
                  >
                    <i className="fal fa-plus mr-1"></i>
                  </button>
                </th>
              </tr>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">Documento</th>
                <th className="text-center">Proveedor</th>
                {clientesVisible == 1 ? (
                  <th className="text-center">Cliente</th>
                ) : null}
                <th className="text-center">Tipo de gasto</th>
                <th className="text-center">Concepto</th>
                <th className="text-center">Detalle</th>
                <th className="text-center">Importes</th>
                <th className="text-center">
                  <i className="fal fa-file-alt"></i>
                </th>
                <th className="text-center">
                  <i className="fal fa-file"></i>
                </th>
                <th className="text-center">
                  <i className="fal fa-cog"></i>
                </th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>{renderDocumentos()}</tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Estatus: GRABADO</h5>
              <small className="text-muted">
                Grabó: GILBERTO_MENDOZA 06/07/2024
              </small>
              <textarea
                className="form-control mt-3"
                id="observacionesTextarea"
                rows="5"
                placeholder="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="col-sm-5">
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body p-0 pt-3">
                  <h5 className="card-title pl-3">Resumen</h5>
                  <table className="table table-sm tablaResponsiva">
                    <thead>
                      <tr>
                        <th className="text-center">Tipo gasto</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Pro. Semanal</th>
                        <th className="text-center">Num. Semanas</th>
                        <th className="text-center">Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>{renderResumen()}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-3 text-center">
            <div className="col-sm-12">
              <button
                type="button"
                className="btn btn-warning bg-warning-900color-warning-900
                  waves-effect waves-themed text-white mr-2"
              >
                <i className="fal fa-search"></i> Consultar
              </button>
              <button
                type="button"
                className="btn btn-primary waves-effect waves-themed mr-2"
              >
                <i className="fal fa-plus"></i> Nuevo
              </button>
              <button
                type="button"
                className="btn btn-danger waves-effect waves-themed"
              >
                <i className="fal fa-print"></i> Imprimir
              </button>
            </div>
            <div className="col-sm-2"></div>
          </div>
        </div>
        <div className="col-sm-2">
          <div className="card">
            <div className="card-body p-0">
              <table className="table table-sm tablaResponsiva">
                <thead>
                  <tr>
                    <th className="text-left">Subtotal:</th>
                    <th className="text-right">
                      <span className="badge badge-primary">
                        $
                        {xmlData
                          ? parseFloat(xmlData.subtotal).toFixed(2)
                          : "0.00"}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-left">IVA:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">
                        ${xmlData ? parseFloat(xmlData.iva).toFixed(2) : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">IVA_16:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">
                        $
                        {xmlData
                          ? parseFloat(xmlData.iva_16).toFixed(2)
                          : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">IVA_8:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">
                        $
                        {xmlData
                          ? parseFloat(xmlData.iva_8).toFixed(2)
                          : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">IEPS:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">
                        $
                        {xmlData ? parseFloat(xmlData.ieps).toFixed(2) : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">ISH:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">
                        ${xmlData ? parseFloat(xmlData.ish).toFixed(2) : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">TUA:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">
                        ${xmlData ? parseFloat(xmlData.tua).toFixed(2) : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left">Retención:</th>
                    <td className="text-right">
                      <span className="badge badge-danger">
                        $
                        {xmlData
                          ? parseFloat(xmlData.retencion).toFixed(2)
                          : "0.00"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left">Total:</th>
                    <td className="text-right">
                      <span className="badge badge-success">
                        $
                        {xmlData
                          ? parseFloat(xmlData.total).toFixed(2)
                          : "0.00"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-sm-2">
          <div className="card">
            <div className="card-body p-0">
              <table className="table table-sm tablaResponsiva">
                <thead>
                  <tr>
                    <th className="text-left">Facturas</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-left">Importe:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">$423.40</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">Cantidad:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">2</span>
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left">Notas</th>
                    <td className="text-right"></td>
                  </tr>
                  <tr>
                    <td className="text-left">Importe:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">$550.00</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">Cantidad:</td>
                    <td className="text-right">
                      <span className="badge badge-primary">1</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modalCombustibleVisible && (
        <ModalCombustible
          modalCombustibleVisible={modalCombustibleVisible}
          toggleModalCombustible={toggleModalCombustible}
          plazaSeleccionada={plazaSeleccionada}
          combustibles={combustibles}
        />
      )}

      {/* Modal para Importes / Impuestos */}
      {modalImportesVisible && (
        <ModalImportes
          modalImportesVisible={modalImportesVisible}
          toggleModalImportes={toggleModalImportes}
          importesData={importesData}
          setImportesData={setImportesData}
        />
      )}
    </Page>
  );
};

export default Gastos;
