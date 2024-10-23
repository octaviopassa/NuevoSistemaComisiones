const PlazasService = {};

PlazasService.getAll = async (datos) => {
  return await Meteor.callSync("plazas.getAll", datos);
};

export { PlazasService };
