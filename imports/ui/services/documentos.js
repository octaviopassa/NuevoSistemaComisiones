const DocumentosService = {};

DocumentosService.grabarArchivoXML = async (data) => {
  return await Meteor.callSync("documentos.grabarArchivoXML", data);
};

DocumentosService.grabarArchivoPDF = async (data) => {
  return await Meteor.callSync("documentos.grabarArchivoPDF", data);
};

DocumentosService.grabarArchivo = async (data) => {
  return await Meteor.callSync("documentos.grabarArchivo", data);
};

DocumentosService.grabarArchivoNota = async (data) => {
  return await Meteor.callSync("documentos.grabarArchivoNota", data);
};

DocumentosService.grabarArchivoComisiones = async (data) => {
  return await Meteor.callSync("documentos.grabarArchivoComisiones", data);
};

DocumentosService.eliminarXML = async (data) => {
  return await Meteor.callSync("documentos.eliminarXML", data);
};

DocumentosService.getResumen = async (data) => {
  return await Meteor.callSync("documentos.getResumen", data);
};

DocumentosService.getGastoGlobal = async (data) => {
  return await Meteor.callSync("documentos.getGastoGlobal", data);
};

DocumentosService.getGastosDetalle = async (data) => {
  return await Meteor.callSync("documentos.getGastosDetalle", data);
};

DocumentosService.getComisionesTiposDocumentosExpedientes = async (data) => {
  return await Meteor.callSync("documentos.getComisionesTiposDocumentosExpedientes", data);
};

DocumentosService.autorizarGasto = async (data) => {
  return await Meteor.callSync("documentos.autorizarGasto", data);
};

DocumentosService.desautorizarGasto = async (data) => {
  return await Meteor.callSync("documentos.desautorizarGasto", data);
};

DocumentosService.cancelarGasto = async (data) => {
  return await Meteor.callSync("documentos.cancelarGasto", data);
};

DocumentosService.descartarDetalle = async (data) => {
  return await Meteor.callSync("documentos.descartarDetalle", data);
};

DocumentosService.habilitarDetalle = async (data) => {
  return await Meteor.callSync("documentos.habilitarDetalleDescartado", data);
};

DocumentosService.validarXml = async (data) => {
  return await Meteor.callSync("documentos.validarXml", data);
};

DocumentosService.getXml = async (data) => {
  return await Meteor.callSync("documentos.getXml", data);
};

DocumentosService.getPDF = async (data) => {
  return await Meteor.callSync("documentos.getPDF", data);
};

export { DocumentosService };
