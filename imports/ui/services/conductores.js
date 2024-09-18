const ConductoresService = {};

ConductoresService.getAll = async (plaza) => {
  return await Meteor.callSync("conductores.getAll", plaza);
};

ConductoresService.getAllByPlazaAndCode = async (plaza, code) => {
  return await Meteor.callSync("conductores.getAllByPlazaAndCode", plaza, code);
};

ConductoresService.insert = async (data) => {
  return await Meteor.callSync("conductores.insert", data);
};

ConductoresService.update = async (data) => {
  return await Meteor.callSync("conductores.update", data);
};

export { ConductoresService };
