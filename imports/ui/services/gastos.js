const GastosService = {};

GastosService.pagarA = async (datos) => {
  return await Meteor.callSync("gastos.pagarA", datos);
};

GastosService.getFolioProvisional = async (plaza) => {
  return await Meteor.callSync("gastos.getFolioProvisional", plaza);
};

export { GastosService };
