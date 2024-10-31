const ProveedoresService = {};

ProveedoresService.getAll = async (baseDatos) => {
  return await Meteor.callSync("proveedores.getAll", baseDatos);
};

ProveedoresService.getAllWithName = async (datos, baseDatos) => {
  return await Meteor.callSync("proveedores.getAllWithName", datos, baseDatos);
};

ProveedoresService.insert = async (datos, baseDatos) => {
  return await Meteor.callSync("proveedores.insert", datos, baseDatos);
};

ProveedoresService.update = async (datos, baseDatos) => {
  return await Meteor.callSync("proveedores.update", datos, baseDatos);
};

export { ProveedoresService };
