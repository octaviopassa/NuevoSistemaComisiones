const GasolinerasService = {};

GasolinerasService.getAll = async (data) => {
  return await Meteor.callSync("gasolineras.getAll", data);
};

GasolinerasService.insert = async (data) => {
  return await Meteor.callSync("gasolineras.insert", data);
};

GasolinerasService.update = async (data) => {
  return await Meteor.callSync("gasolineras.update", data);
};

export { GasolinerasService };
