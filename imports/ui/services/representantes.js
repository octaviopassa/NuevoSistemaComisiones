const RepresentantesService = {};

RepresentantesService.getAll = async (datos) => {
  return await Meteor.callSync("representantes.getAll", datos);
};

RepresentantesService.grabar = async (datos) => {
  return await Meteor.callSync("representantes.grabar", datos);
};

RepresentantesService.grabarClienteRelacionado = async (datos) => {
  return await Meteor.callSync("representantes.grabarClienteRelacionado", datos);
};

RepresentantesService.eliminarClienteRelacionado = async (datos) => {
  return await Meteor.callSync("representantes.eliminarClienteRelacionado", datos);
};

RepresentantesService.getClientesRelacionados = async (datos) => {
  return await Meteor.callSync("representantes.getClientesRelacionados", datos);
};

export { RepresentantesService };
