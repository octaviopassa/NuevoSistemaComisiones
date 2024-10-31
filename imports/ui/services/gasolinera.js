const GasolinerasService = {};

GasolinerasService.getAll = async (plaza, baseDatos) => {
  return await Meteor.callSync("gasolineras.getAll", plaza, baseDatos);
};

GasolinerasService.insert = async (data, baseDatos) => {
  return await Meteor.callSync("gasolineras.insert", data, baseDatos);
};

GasolinerasService.update = async (data, baseDatos) => {
  return await Meteor.callSync("gasolineras.update", data, baseDatos);
};

export { GasolinerasService };
