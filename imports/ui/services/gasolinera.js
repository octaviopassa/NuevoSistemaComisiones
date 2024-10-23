const GasolinerasService = {};

GasolinerasService.getAll = async (plaza) => {
  return await Meteor.callSync("gasolineras.getAll", plaza);
};

GasolinerasService.insert = async (data) => {
  return await Meteor.callSync("gasolineras.insert", data);
};

GasolinerasService.update = async (data) => {
  return await Meteor.callSync("gasolineras.update", data);
};

export { GasolinerasService };
