const DocumentosService = {};

DocumentosService.grabarArchivoXML = async (data, accion) => {
  return await Meteor.callSync("documentos.grabarArchivoXML", data, accion);
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

DocumentosService.eliminarXML = async (id) => {
  return await Meteor.callSync("documentos.eliminarXML", id);
};

DocumentosService.getResumen = async (folio) => {
  return await Meteor.callSync("documentos.getResumen", folio);
};

DocumentosService.getGastoGlobal = async (data) => {
  return await Meteor.callSync("documentos.getGastoGlobal", data);
};

DocumentosService.getGastosDetalle = async (folio) => {
  return await Meteor.callSync("documentos.getGastosDetalle", folio);
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

export { DocumentosService };
