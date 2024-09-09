const GastosService = {};

GastosService.pagarA = async (datos) => {
  return await Meteor.callSync("gastos.pagarA", datos);
};

export default GastosService;
