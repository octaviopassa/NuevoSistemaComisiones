const TipoDocumentosComisionesService = {};

TipoDocumentosComisionesService.getAll = async (baseDatos) => {
  return await Meteor.callSync("tipoDocumentosComisiones.getAll", baseDatos);
};

export { TipoDocumentosComisionesService };
