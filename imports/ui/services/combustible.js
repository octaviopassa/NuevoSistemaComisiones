const CombustibleService = {};

CombustibleService.getAll = async (baseDatos) => {
  return await Meteor.callSync("combustibles.getAll", baseDatos);
};

export { CombustibleService };
