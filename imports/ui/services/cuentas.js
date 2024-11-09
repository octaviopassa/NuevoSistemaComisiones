const CuentasService = {};

CuentasService.getBancos = async (baseDatos) => {
  return await Meteor.callSync("cuentas.getBancos", baseDatos);
};

CuentasService.insert = async (data, baseDatos) => {
  return await Meteor.callSync("cuentas.insert", data);
};

CuentasService.update = async (data, baseDatos) => {
  return await Meteor.callSync("cuentas.update", data);
};

export { CuentasService };
