const GastosService = {};

GastosService.pagarA = async (datos) => {
  return await Meteor.callSync("gastos.pagarA", datos);
};

GastosService.getFolioProvisional = async (plaza) => {
  return await Meteor.callSync("gastos.getFolioProvisional", plaza);
};

GastosService.grabar = async (datos, accion) => {
  return await Meteor.callSync("gastos.grabar", datos, accion);
};

GastosService.grabarRenglon = async (datos) => {
  return await Meteor.callSync("gastos.grabarRenglon", datos);
};

GastosService.grabarGastoCombustible = async (datos) => {
  return await Meteor.callSync("gastos.grabarGastoCombustible", datos);
};

GastosService.consultar = async (datos) => {
  return await Meteor.callSync("gastos.consultar", datos);
};

export { GastosService };
  