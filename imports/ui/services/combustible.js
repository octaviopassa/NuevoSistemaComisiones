const CombustibleService = {};

CombustibleService.getAll = async () => {
  return await Meteor.callSync("combustibles.getAll");
};

export default CombustibleService;
