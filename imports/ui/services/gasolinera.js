const GasolinerasService = {};

GasolinerasService.getAll = async (datos) => {
  return await Meteor.callSync("gasolineras.getAll", datos);
};

export { GasolinerasService };
