const VehiculosService = {};

VehiculosService.getAll = async (plaza, baseDatos) => {
  return await Meteor.callSync("vehiculos.getAll", plaza, baseDatos);
};

VehiculosService.insert = async (datos, baseDatos) => {
  return await Meteor.callSync("vehiculos.insert", datos, baseDatos);
};

VehiculosService.update = async (datos, baseDatos) => {
  return await Meteor.callSync("vehiculos.update", datos, baseDatos);
};

export { VehiculosService };
