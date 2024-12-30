const PlazasService = {};

PlazasService.getAll = async (datos) => {
  return await Meteor.callSync("plazas.getAll", datos);
};

PlazasService.getAllGastosAdmin = async (datos) => {
  return await Meteor.callSync("plazas.getAllGastosAdmin", datos);
};

export { PlazasService };
