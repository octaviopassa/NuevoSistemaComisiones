const GastosService = {};

GastosService.pagarA = async (datos) => {
  return await Meteor.callSync("gastos.pagarA", datos);
};

GastosService.getFolioProvisional = async (plaza, baseDatos) => {
  return await Meteor.callSync("gastos.getFolioProvisional", plaza, baseDatos);
};

GastosService.grabar = async (datos, baseDatos) => {
  return await Meteor.callSync("gastos.grabar", datos, baseDatos);
};

GastosService.grabarRenglon = async (datos, baseDatos) => {
  return await Meteor.callSync("gastos.grabarRenglon", datos, baseDatos);
};

GastosService.grabarGastoCombustible = async (datos, baseDatos) => {
  return await Meteor.callSync("gastos.grabarGastoCombustible", datos, baseDatos);
};

GastosService.consultar = async (datos, baseDatos) => {
  return await Meteor.callSync("gastos.consultar", datos, baseDatos);
};

GastosService.getProyectos = async (baseDatos) => {
  return await Meteor.callSync("gastos.getProyectos", baseDatos);
};

export { GastosService };
