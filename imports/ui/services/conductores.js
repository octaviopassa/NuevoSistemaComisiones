const ConductoresService = {};

ConductoresService.getAll = async (plaza, baseDatos) => {
  return await Meteor.callSync("conductores.getAll", plaza, baseDatos);
};

ConductoresService.getAllByPlazaAndCode = async (plaza, code, baseDatos) => {
  return await Meteor.callSync("conductores.getAllByPlazaAndCode", plaza, code, baseDatos);
};

ConductoresService.insert = async (data, baseDatos) => {
  return await Meteor.callSync("conductores.insert", data, baseDatos);
};

ConductoresService.update = async (data, baseDatos) => {
  return await Meteor.callSync("conductores.update", data, baseDatos);
};

export { ConductoresService };
