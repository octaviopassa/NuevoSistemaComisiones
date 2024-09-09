const VehiculosService = {};

VehiculosService.getAll = async (datos) => {
  return await Meteor.callSync("vehiculos.getAll", datos);
};

export default VehiculosService;
