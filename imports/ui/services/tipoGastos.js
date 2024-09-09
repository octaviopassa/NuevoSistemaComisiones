const TipoGastosService = {};

TipoGastosService.getAll = async () => {
  return await Meteor.callSync("tipoGastos.getAll");
};

export default TipoGastosService;
