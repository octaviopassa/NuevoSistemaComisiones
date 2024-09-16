const ProveedoresService = {};

ProveedoresService.getAll = async () => {
  return await Meteor.callSync("proveedores.getAll");
};

ProveedoresService.getAllWithName = async (datos) => {
  return await Meteor.callSync("proveedores.getAllWithName", datos);
};

export { ProveedoresService };
