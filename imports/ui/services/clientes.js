const ClientesService = {};

ClientesService.getAll = async (datos) => {
  return await Meteor.callSync("clientes.getAll", datos);
};

ClientesService.getAllByName = async (datos) => {
  return await Meteor.callSync("clientes.getAllByName", datos);
};

ClientesService.clientesVisible = async (datos) => {
  return await Meteor.callSync("clientes.clientesVisible", datos);
};

ClientesService.insert = async (datos) => {
  return await Meteor.callSync("clientes.insert", datos);
};

ClientesService.update = async (datos) => {
  return await Meteor.callSync("clientes.update", datos);
};

export { ClientesService };
