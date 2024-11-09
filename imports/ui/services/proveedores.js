const ProveedoresService = {};

ProveedoresService.getAll = async (servidor) => {
  return await Meteor.callSync("proveedores.getAll", servidor);
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
