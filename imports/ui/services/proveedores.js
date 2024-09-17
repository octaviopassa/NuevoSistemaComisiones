const ProveedoresService = {};

ProveedoresService.getAll = async () => {
  return await Meteor.callSync("proveedores.getAll");
};

ProveedoresService.getAllWithName = async (datos) => {
  return await Meteor.callSync("proveedores.getAllWithName", datos);
};

ProveedoresService.insert = async (datos) => {
  return await Meteor.callSync("proveedores.insert", datos);
};

ProveedoresService.update = async (datos) => {
  return await Meteor.callSync("proveedores.update", datos);
};

export { ProveedoresService };
