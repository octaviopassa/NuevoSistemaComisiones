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

export { DocumentosService };
