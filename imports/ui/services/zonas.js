const ZonasService = {};

ZonasService.getAll = async (datos) => {
  return await Meteor.callSync("zonas.getAll", datos);
};

export { ZonasService };
