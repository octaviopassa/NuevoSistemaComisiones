const VehiculosService = {};

VehiculosService.getAll = async (datos) => {
  return await Meteor.callSync("vehiculos.getAll", datos);
};

VehiculosService.insert = async (datos) => {
  return await Meteor.callSync("vehiculos.insert", datos);
};

VehiculosService.update = async (datos) => {
  return await Meteor.callSync("vehiculos.update", datos);
};

export { VehiculosService };
