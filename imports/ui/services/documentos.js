const DocumentosService = {};

DocumentosService.grabarArchivoXML = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.grabarArchivoXML", data, baseDatos);
};

DocumentosService.grabarArchivoPDF = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.grabarArchivoPDF", data, baseDatos);
};

DocumentosService.grabarArchivo = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.grabarArchivo", data, baseDatos);
};

DocumentosService.grabarArchivoNota = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.grabarArchivoNota", data, baseDatos);
};

DocumentosService.eliminarXML = async (id, baseDatos) => {
  return await Meteor.callSync("documentos.eliminarXML", id, baseDatos);
};

DocumentosService.getResumen = async (folio, baseDatos) => {
  return await Meteor.callSync("documentos.getResumen", folio, baseDatos);
};

DocumentosService.getGastoGlobal = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.getGastoGlobal", data, baseDatos);
};

DocumentosService.getGastosDetalle = async (folio, baseDatos) => {
  return await Meteor.callSync("documentos.getGastosDetalle", folio, baseDatos);
};

DocumentosService.autorizarGasto = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.autorizarGasto", data, baseDatos);
};

DocumentosService.desautorizarGasto = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.desautorizarGasto", data, baseDatos);
};

DocumentosService.cancelarGasto = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.cancelarGasto", data, baseDatos);
};

DocumentosService.descartarDetalle = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.descartarDetalle", data, baseDatos);
};

DocumentosService.habilitarDetalle = async (data, baseDatos) => {
  return await Meteor.callSync("documentos.habilitarDetalleDescartado", data, baseDatos);
};

DocumentosService.validarXml = async (uuid, baseDatos) => {
  return await Meteor.callSync("documentos.validarXml", uuid, baseDatos);
};

export { DocumentosService };
