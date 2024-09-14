const ProveedoresService = {};

ProveedoresService.getAll = async (datos) => {
  return await Meteor.callSync("proveedores.getAll", datos);
};

export { ProveedoresService };
