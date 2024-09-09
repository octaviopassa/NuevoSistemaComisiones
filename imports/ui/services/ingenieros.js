const IngenierosService = {};

IngenierosService.getAll = async (datos) => {
  return await Meteor.callSync("ingenieros.getAll", datos);
};

export default IngenierosService;
