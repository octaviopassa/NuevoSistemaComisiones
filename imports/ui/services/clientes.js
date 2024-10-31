const ClientesService = {};

ClientesService.getAll = async (baseDatos) => {
  return await Meteor.callSync("clientes.getAll", baseDatos);
};

ClientesService.getAllByName = async (datos, baseDatos) => {
  return await Meteor.callSync("clientes.getAllByName", datos, baseDatos);
};

ClientesService.clientesVisible = async (datos) => {
  return await Meteor.callSync("clientes.clientesVisible", datos);
};

ClientesService.insert = async (datos, baseDatos) => {
  return await Meteor.callSync("clientes.insert", datos, baseDatos);
};

ClientesService.update = async (datos, baseDatos) => {
  return await Meteor.callSync("clientes.update", datos, baseDatos);
};

export { ClientesService };
