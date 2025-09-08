const RepresentantesService = {};

RepresentantesService.getAll = async (datos) => {
  return await Meteor.callSync("representantes.getAll", datos);
};

export { RepresentantesService };
