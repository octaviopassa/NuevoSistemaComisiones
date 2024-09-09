const ClientesService = {};

ClientesService.getAll = async (datos) => {
  return await Meteor.callSync("clientes.getAll", datos);
};

ClientesService.clientesVisible = async (datos) => {
  return await Meteor.callSync("clientes.clientesVisible", datos);
};

export default ClientesService;
