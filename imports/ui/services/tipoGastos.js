const TipoGastosService = {};

TipoGastosService.getAll = async (baseDatos) => {
  return await Meteor.callSync("tipoGastos.getAll", baseDatos);
};

export { TipoGastosService };
