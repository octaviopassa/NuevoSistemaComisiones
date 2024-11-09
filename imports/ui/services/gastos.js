const GastosService = {};

GastosService.pagarA = async (datos) => {
  return await Meteor.callSync("gastos.pagarA", datos);
};

GastosService.getFolioProvisional = async (datos) => {
  return await Meteor.callSync("gastos.getFolioProvisional", datos);
};

GastosService.grabar = async (datos) => {
  return await Meteor.callSync("gastos.grabar", datos);
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

GastosService.getProyectos = async (servidor) => {
  return await Meteor.callSync("gastos.getProyectos", servidor);
};

export { GastosService };
