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

export { DocumentosService };
