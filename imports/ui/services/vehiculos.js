const VehiculosService = {};

VehiculosService.getAll = async (plaza) => {
  return await Meteor.callSync("vehiculos.getAll", plaza);
};

VehiculosService.insert = async (datos) => {
  return await Meteor.callSync("vehiculos.insert", datos);
};

VehiculosService.update = async (datos) => {
  return await Meteor.callSync("vehiculos.update", datos);
};

export { VehiculosService };
