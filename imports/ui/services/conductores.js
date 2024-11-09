const ConductoresService = {};

ConductoresService.getAll = async (data) => {
  return await Meteor.callSync("conductores.getAll", data);
};

ConductoresService.getAllByPlazaAndCode = async (data) => {
  return await Meteor.callSync("conductores.getAllByPlazaAndCode", data);
};

ConductoresService.insert = async (data) => {
  return await Meteor.callSync("conductores.insert", data);
};

ConductoresService.update = async (data) => {
  return await Meteor.callSync("conductores.update", data);
};

export { ConductoresService };
