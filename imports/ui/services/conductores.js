const ConductoresService = {};

ConductoresService.getAll = async (datos) => {
  return await Meteor.callSync("conductores.getAll", datos);
};

export {ConductoresService};
